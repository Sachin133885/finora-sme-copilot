CREATE TABLE finora_businesses (owner TEXT NOT NULL, key TEXT NOT NULL, owner_email TEXT NOT NULL, data TEXT NOT NULL, revision INTEGER NOT NULL DEFAULT 1, updated_at TEXT NOT NULL, PRIMARY KEY(owner,key));
--> statement-breakpoint
CREATE TABLE finora_members (owner TEXT NOT NULL, key TEXT NOT NULL, email TEXT NOT NULL, role TEXT NOT NULL CHECK(role IN ('viewer','accountant')), PRIMARY KEY(owner,key,email));
--> statement-breakpoint
CREATE TABLE finora_cloud_events (id TEXT PRIMARY KEY NOT NULL, owner TEXT NOT NULL, key TEXT NOT NULL, actor TEXT NOT NULL, event TEXT NOT NULL, created_at TEXT NOT NULL);
