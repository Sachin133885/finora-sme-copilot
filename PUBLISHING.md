# Publish this prepared repository update

Target: https://github.com/Sachin133885/finora-sme-copilot

The connected account Shimanto23 currently has read-only access. This prepared package has not been pushed. A source archive is not a substitute for the existing Git history.

## Repository owner or authorized collaborator

1. Keep a backup/current commit reference and use the existing repository checkout, not a new repository.
2. Extract the package. Copy the contents inside `finora-sme-copilot-main/` into the repository root. Do not upload the ZIP or nest the project under an extra directory. Preserve the existing `.git/` history and private local environment files; never copy real secrets into Git.
3. Review the diff. It should include the final 1.2 source and this documentation/branding update. Keep existing Render/Supabase secrets and account records. Commit to an appropriate branch or main according to the team’s review process.
4. Include hidden tracked configuration (`.github/`, `.openai/`, `.gitignore`, example environment files). Actual `.env`, credentials, databases, node_modules and the registration workbook are excluded.
5. Run the documented checks or wait for GitHub Actions. Then merge/commit to the branch tracked by Render. Auto-deployment depends on the service settings; otherwise use Manual Deploy → Deploy latest commit.
6. Confirm Render is Live at the intended commit and test the actual app. Documentation preparation does not verify production signup, cloud roles, recovery email or live AI.
7. Capture the final screenshots using SCREENSHOTS.md, add genuine files and captions, and record their source/version.

To enable the assistant to push later, the repository owner must grant the connected account write access, and any invitation must be accepted. Public team names in README do not grant GitHub permissions. No paid plan or Vercel credits are required by this source update.
