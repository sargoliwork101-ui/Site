<!-- Every agent PR into `main` must fill this. Keep it short, keep it honest. -->

## What & why

- Task / area:
- Why this change:

## Files touched

- <!-- list every file; flag shared files (DataContext, AdminPanel, security.js, auth.php) with ⚠️ -->

## Agent checklist (all must be ✅ before merge)

- [ ] `npm run build` passes with no errors
- [ ] Declaration/usage grep clean — no undefined identifiers in touched files
- [ ] No secrets (passwords, hashes, tokens, SMTP creds) in code or commit
- [ ] No persisted data field renamed/removed (user's localStorage stays compatible)
- [ ] Bilingual rule kept (every FA field has its EN field below it in the panel)
- [ ] No on-screen OTP / client-side OTP / OTP via third party introduced
- [ ] Branch rebased on latest `main`; conflicts resolved (or listed below)
- [ ] `dist/` and `site-upload.zip` NOT hand-edited (integrator rebuilds them)

## Conflicts / needs integrator attention

- <!-- none | describe -->
