# Security and privacy

Finora is a competition prototype, not independently audited financial infrastructure. Do not publish a vulnerability containing credentials, personal records or an exploit against another person’s workspace. Contact the repository owner privately through an available verified channel; no private security inbox or guaranteed response time is specified here.

## Implemented boundaries

- Supabase identity verified server-side; UUID workspace membership and owner/accountant/viewer rules.
- Private PostgreSQL schema and service-only workspace RPC; no public browser table grants are required.
- Protected cookies, origin/CSRF/JSON/body-size checks, revision conflicts and bounded best-effort auth/AI limits.
- Reviewed inputs and explicit confirmation before permitted financial writes; receipt duplicate and business checks.
- Optional live AI with consent and read-only tools. Credentials stay on the server.

These controls have local regression coverage; that does not establish deployed security, reliable distributed abuse prevention or independent cross-device durability. Service-role secrets can bypass public database restrictions and must remain private.

PDF field extraction does not authenticate documents. Recorded cash is not a verified bank balance. Forecasts and rescue plans are estimates. No automatic payment, lending application or message sending is implemented.

Use backups and validate actual auth, roles, recovery emails, revision conflicts, secret rotation and restore behavior in the deployed environment. The public registration workbook and identity attachments must never be committed. Source/asset notices do not establish a project-wide license.
