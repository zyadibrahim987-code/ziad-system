# CLAUDE.md (read automatically by every thread)

Full context: see `src/PROJECT.md`. Key points:

- Reply to Zyad in Egyptian Arabic, short. Keep the UI simple; he must never feel lost.
- Edit only `src/core.js` and `src/index.html`; root `app.js` / `index.html` / `version.json` are generated.
- Test with Playwright + `src/test/mock.js` before deploying; show Zyad a screenshot.
- Deploy = `cd src && python3 deploy.py "message"`: commits and pushes to **main** (GitHub Pages serves main). Do not leave work on a side branch or a PR, or it never goes live.
- Supabase project `apnxxhvjqnqgpryscixg`. Team must never see finance or Visa; verify RLS as a member after DB changes.
- Never modify Zyad's Google Sheets. Ask before deleting data. No secrets in git.
- One thread at a time on the code; deploy.py rebases on origin/main before pushing.
