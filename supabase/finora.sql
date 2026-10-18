-- Finora Topic E: additive schema for a NEW Supabase project.
-- Run in Supabase SQL Editor as the project database owner.
-- No existing Site data is imported, deleted, reset or replaced.
begin;
create schema if not exists finora_private;
revoke all on schema finora_private from public, anon, authenticated;

create table if not exists finora_private.businesses (
 owner uuid not null references auth.users(id) on delete cascade,
 key text not null check(key in ('shenzhen','guangzhou','chengdu')),
 owner_email text not null,
 data jsonb not null,
 revision bigint not null default 1 check(revision>0),
 updated_at timestamptz not null default now(),
 primary key(owner,key)
);
create table if not exists finora_private.members (
 owner uuid not null,
 key text not null,
 user_id uuid not null references auth.users(id) on delete cascade,
 email text not null check(email=lower(email)),
 role text not null check(role in ('accountant','viewer')),
 primary key(owner,key,user_id),
 foreign key(owner,key) references finora_private.businesses(owner,key) on delete cascade
);
create table if not exists finora_private.events (
 id uuid primary key default gen_random_uuid(),
 owner uuid not null,
 key text not null,
 actor uuid not null,
 event text not null,
 created_at timestamptz not null default now(),
 foreign key(owner,key) references finora_private.businesses(owner,key) on delete cascade
);
create index if not exists finora_members_user on finora_private.members(user_id);
create index if not exists finora_events_workspace on finora_private.events(owner,key,created_at desc);
alter table finora_private.businesses enable row level security;
alter table finora_private.members enable row level security;
alter table finora_private.events enable row level security;
revoke all on all tables in schema finora_private from public, anon, authenticated;

-- Only the server's secret API key can execute this function. The Node adapter
-- obtains p_actor and p_email from Supabase Auth GET /user, never from clients.
create or replace function public.finora_workspace(
 p_actor uuid,
 p_email text,
 p_action text,
 p_owner uuid default null,
 p_key text default 'shenzhen',
 p_data jsonb default null,
 p_revision bigint default null,
 p_target text default null,
 p_role text default null
) returns jsonb
language plpgsql security definer set search_path=''
as $finora$
declare
 v_owner uuid:=coalesce(p_owner,p_actor);
 v_email text;
 v_target uuid;
 v_role text;
 v_data jsonb;
 v_item jsonb;
 v_revision bigint;
 v_result jsonb;
begin
 select lower(u.email) into v_email from auth.users u
 where u.id=p_actor and u.email_confirmed_at is not null;
 if v_email is null or v_email<>lower(p_email) then
  return jsonb_build_object('status',401,'error','Verified sign in required');
 end if;
 if p_key not in ('shenzhen','guangzhou','chengdu') then
  return jsonb_build_object('status',400,'error','Invalid workspace');
 end if;

 if p_action='initialize' then
  if v_owner<>p_actor or jsonb_typeof(p_data) is distinct from 'array' then
   return jsonb_build_object('status',400,'error','Invalid initialization');
  end if;
  if jsonb_array_length(p_data)<>3 or
   (select count(distinct x->>'org') from jsonb_array_elements(p_data) x)<>3 then
   return jsonb_build_object('status',400,'error','Invalid initialization');
  end if;
  for v_item in select value from jsonb_array_elements(p_data) loop
   if coalesce(v_item->>'org','') not in ('shenzhen','guangzhou','chengdu') or
    jsonb_typeof(v_item->'transactions') is distinct from 'array' or
    jsonb_typeof(v_item->'invoices') is distinct from 'array' or
    octet_length(v_item::text)>4800000 then
    return jsonb_build_object('status',400,'error','Invalid initialization');
   end if;
  end loop;
  for v_item in select value from jsonb_array_elements(p_data) loop
   insert into finora_private.businesses(owner,key,owner_email,data)
   values(p_actor,v_item->>'org',v_email,v_item)
   on conflict(owner,key) do nothing;
  end loop;
 end if;

 if p_action in ('list','initialize') then
  select coalesce(jsonb_agg(jsonb_build_object('owner',b.owner,'key',b.key,
   'owner_email',lower(ou.email),'role',case when b.owner=p_actor then 'owner' else m.role end)
   order by b.owner,b.key),'[]'::jsonb) into v_result
  from finora_private.businesses b join auth.users ou on ou.id=b.owner left join finora_private.members m
   on m.owner=b.owner and m.key=b.key and m.user_id=p_actor
  where b.owner=p_actor or m.user_id=p_actor;
  return jsonb_build_object('status',200,'businesses',v_result);
 end if;

 -- A common row lock serializes saves and permission changes for this workspace.
 select b.data,b.revision into v_data,v_revision
 from finora_private.businesses b where b.owner=v_owner and b.key=p_key for update;
 if not found then return jsonb_build_object('status',404,'error','Workspace not found');end if;
 if v_owner=p_actor then v_role:='owner';else
  select m.role into v_role from finora_private.members m
   where m.owner=v_owner and m.key=p_key and m.user_id=p_actor;
 end if;
 if v_role is null then return jsonb_build_object('status',403,'error','Access denied');end if;

 if p_action='get' then
  return jsonb_build_object('status',200,'data',v_data,'revision',v_revision,'role',v_role);
 elsif p_action='save' then
  if v_role='viewer' then return jsonb_build_object('status',403,'error','Read only access');end if;
  if p_data is null or coalesce(p_data->>'org','')<>p_key or
   jsonb_typeof(p_data->'transactions') is distinct from 'array' or
   jsonb_typeof(p_data->'invoices') is distinct from 'array' or
   octet_length(p_data::text)>4800000 or p_revision is null then
   return jsonb_build_object('status',400,'error','Invalid financial data');
  end if;
  if p_revision<>v_revision then return jsonb_build_object('status',409,'error','Conflict: export your local backup before loading the server copy');end if;
  update finora_private.businesses set data=p_data,revision=revision+1,updated_at=now()
   where owner=v_owner and key=p_key;
  insert into finora_private.events(owner,key,actor,event) values(v_owner,p_key,p_actor,'save_records');
  return jsonb_build_object('status',200,'revision',v_revision+1);
 elsif p_action='audit' then
  select coalesce(jsonb_agg(to_jsonb(x) order by x.created_at desc),'[]'::jsonb) into v_result
  from (select e.actor,e.event,e.created_at from finora_private.events e
   where e.owner=v_owner and e.key=p_key order by e.created_at desc limit 100) x;
  return jsonb_build_object('status',200,'events',v_result);
 elsif p_action in ('members','grant','revoke') then
  if v_role<>'owner' then return jsonb_build_object('status',403,'error','Owner access required');end if;
  if p_action='members' then
   select coalesce(jsonb_agg(jsonb_build_object('email',lower(u.email),'role',m.role) order by u.email),'[]'::jsonb)
    into v_result from finora_private.members m join auth.users u on u.id=m.user_id where m.owner=v_owner and m.key=p_key;
   return jsonb_build_object('status',200,'members',v_result);
  end if;
  if p_target is null or p_target<>lower(p_target) or length(p_target)>120 or
   p_target !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
   return jsonb_build_object('status',400,'error','Invalid member');
  end if;
  if p_action='grant' then
   if p_role is null or p_role not in ('viewer','accountant') then return jsonb_build_object('status',400,'error','Invalid role');end if;
   select u.id into v_target from auth.users u where lower(u.email)=p_target and u.email_confirmed_at is not null;
   if v_target is null or v_target=p_actor then
    return jsonb_build_object('status',400,'error','Ask the person to register and confirm email first');
   end if;
   insert into finora_private.members(owner,key,user_id,email,role) values(v_owner,p_key,v_target,p_target,p_role)
    on conflict(owner,key,user_id) do update set role=excluded.role,email=excluded.email;
  else
   select u.id into v_target from auth.users u where lower(u.email)=p_target;
   delete from finora_private.members where owner=v_owner and key=p_key and user_id=v_target;
  end if;
  insert into finora_private.events(owner,key,actor,event) values(v_owner,p_key,p_actor,'access_'||p_action);
  return jsonb_build_object('status',200,'ok',true);
 end if;
 return jsonb_build_object('status',400,'error','Unsupported action');
end;
$finora$;
revoke all on function public.finora_workspace(uuid,text,text,uuid,text,jsonb,bigint,text,text) from public, anon, authenticated;
grant execute on function public.finora_workspace(uuid,text,text,uuid,text,jsonb,bigint,text,text) to service_role;
notify pgrst, 'reload schema';
commit;
