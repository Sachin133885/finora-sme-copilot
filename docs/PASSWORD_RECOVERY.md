# Finora password recovery update

Upload this ZIP's contents at the existing GitHub repository root, retaining folder paths. Render must deploy the new commit before the recovery URL is usable. No SQL changes, new keys, account deletion or ledger initialization is required.

In Supabase Authentication > URL Configuration > Redirect URLs, add both exact URLs:
https://finora-sme-copilot.onrender.com/reset-password?lang=en
https://finora-sme-copilot.onrender.com/reset-password?lang=zh

Leave Site URL as https://finora-sme-copilot.onrender.com. Keep email confirmation enabled. The default Reset Password email template must retain its ConfirmationURL link.

Then open https://finora-sme-copilot.onrender.com/reset-password?lang=en and enter your registered email once. Follow the newest reset email, enter matching new passwords (12–128 characters), and return to Account & access > Sign in. Do not select Create account.

Recovery uses Supabase's email recovery proof; proof is removed from the URL and retained only in page memory, not localStorage or logs. The server validates the proof with Auth before updating the password and attempts global signout. Existing account UUID, workspace grants and financial records are retained. A browser refresh after following a reset link requires a new link because proof is deliberately not persisted.

31/31 local suites passed, including server/API and simulated DOM recovery checks. Code review found no blockers. No actual browser layout, live Supabase email delivery, redirect allowlist or live password reset was verified during preparation. Supabase email rate limits still apply; 429 must be resolved by waiting for the provider allowance or configuring SMTP, not repeatedly requesting emails. Existing access JWTs may remain valid until expiry after signout.
