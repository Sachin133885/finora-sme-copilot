# Hosting and deployment

Current public app: https://finora-sme-copilot.bravehare4.chatgpt.site/

Baseline: Site version 10, commit `522435c6b9b48fdc3f6b5622a2eb02b4b8993f7a`.

This Part 4 submission adds documentation and a test workflow. It does not deploy a replacement, change the current Site, reset data or move credentials.

## Existing runtime

The build emits a Worker ESM module with `default.fetch`. `.openai/hosting.json` retains existing Site identity and D1 binding `DB`. Hosted migration machinery applies schema files under `drizzle/`. Do not change project identity or initialize a new database as a shortcut to updating the app.

For future updates, use the Sites source workflow to synchronize the authorized checkout, run build/tests, package the matching committed source, save its version and deploy to the same project. Preserve audience, identity settings, D1 records and runtime configuration. The ZIP is neither a database export nor a deployment request.

`LLM_API_KEY` (secret), `LLM_ENDPOINT` and `LLM_MODEL` are server settings. Their values are intentionally absent. Configure them through hosting, never HTML, committed `.env` or workflow source. Test an actual authenticated response before claiming live AI verification.

## GitHub source versus hosting

Recommended competition setup: GitHub for code/reproducibility, existing public app for the working demo. The included Actions workflow only builds/tests; it does not deploy or receive production secrets. It has not run on GitHub yet.

GitHub Pages is static hosting: https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages

It cannot directly execute Finora's Worker API, D1 binding or platform sign-in. Source upload does not migrate the app. The offline HTML is not equivalent to the cloud app and does not reproduce all hosted document/account behavior.

## Separate-host migration, if requested later

1. Choose a compatible runtime and isolated test database.
2. Implement a trusted authenticated session/gateway adapter. Strip visitor-supplied `oai-authenticated-user-id` and `oai-authenticated-user-email`. The present platform supplies these headers; exposing the Worker directly elsewhere with the same trust assumption is unsafe.
3. Adapt sign-in/out URLs and owner/member identity mapping. Do not use a fixed user header or disable authorization.
4. Plan explicit, backed-up account/permission/record/revision migration. No live data is in the ZIP. Do not run demo initialization against existing records.
5. Provision server-only secrets and origin protections. Browser storage is origin-specific and does not automatically move to a new URL.
6. Run regression tests plus real browser/mobile, roles, sync/conflict and live-AI checks on the candidate host.
7. Preserve the original app until data integrity and an agreed cutover are verified.

No separate-host migration was performed for this submission.
