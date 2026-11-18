# Zyad Work System: project context

Read this first in any new chat about the system. Reply to Zyad in **Egyptian Arabic**, short and clear. He cares most that things are **easy to use and not confusing**.

## Who and what
- Zyad Ibrahim, freelance Performance Media Buyer (Cairo). Clients are mostly Saudi (SAR).
- The system is his team ERP: admin (Zyad) + team members he creates (Media Buyer, Designer, Account Manager, CMO, Sales Manager…), clients (store or leads), daily numbers, tasks and deliveries, dashboards, finance, media plan and campaigns.
- Live: https://zyadibrahim987-code.github.io/ziad-system/ (installable on mobile; favicon is his logo mark)

## Where everything lives
- **Code:** GitHub repo `zyadibrahim987-code/ziad-system` (GitHub Pages serves the repo root).
  - `src/`: the source. Edit `src/core.js` (main app) and `src/index.html` (HTML + all CSS).
  - `src/_parts.json`, `src/app_tail.js`: older code chunks that `build.py` stitches around `core.js`.
  - Root `app.js`, `index.html`, `version.json`: **generated; never edit them by hand.**
- **Build and deploy:** `cd src && python3 deploy.py "message"`. This builds `app.js`, stamps a version (cache-busting `?v=`), pulls, commits and pushes. Open apps reload themselves within about 60s through `version.json`.
- **Backend:** Supabase project `apnxxhvjqnqgpryscixg` (Postgres + RLS, storage, edge functions `invite-member` and `sync`).
- **Backup and lead sync:** Google Apps Script `src/appscript/Code.gs` in the sheet "Zyad System — Backup". The real sync token is only inside Apps Script; the copy in the repo is redacted.

## Database (public schema)
profiles, clients, client_members (per client: platforms, see_numbers, see_files, plan_access none/view/edit), metrics (daily numbers; `p` = platform, `_store` = store sales, `_bk` = bookings), tasks, task_status, client_files, lead_stats, client_billing + payments + app_settings (finance; **admin only**), plan_items + plan_meta (Media plan), plan_campaigns (Search + PMax campaign builder, data in jsonb), client_notes (side notes: client_delay, account, payment, site, action, note; with resolved_at), client_cards (Visa vault: **admin only**, encrypted in the browser with Zyad's own passphrase, stores only last4 + ciphertext), clarity_projects + clarity_snapshots (made in another chat; not wired into the app yet).
RLS helpers live in the `private` schema: is_admin, is_member_of, sees_numbers, sees_files, member_platforms, plan_access.

## Hard rules (Zyad's requirements)
1. The team must **never** see anything finance-related (billing, payments, fees, rates) or the Visa cards. After any change, verify with RLS tests while impersonating a member.
2. Members cannot change their own password; Settings for members = logout only.
3. **Never modify his existing Google Sheets.** Read only.
4. Ask before any irreversible deletion of data.
5. Never put the sync token or any secret in GitHub or in chat.
6. Arabic UI with English section labels (Today, Clients, Review, Finance, Settings, Media plan, Campaigns…). Fix mixed Arabic/English direction with `<bdi>`/`isolateLatin`; money is shown as "CPP 75 ر.س".
7. Font is IBM Plex Sans Arabic + IBM Plex Sans. Brand: ink #111a1f, teal #0b5d57 / #3fc1a9, lime #c8f04a, paper #f5f4ef; logo = 4-bar mark.
8. Commit as `Zyad Ibrahim <zyadibrahim987@gmail.com>`.
9. Work in **one chat at a time** on the code; pull before deploying, because two chats once pushed over each other.

## Main features (as of 18 Nov 2026)
- Sidebar: Today (admin) / My Tasks (members), Clients, Review, Finance (admin), Settings (Team & Permissions, Clients, Backup & Sheets, Account).
- Client page side views: Results (Total + each team member's slice), Plan (Media plan, Campaigns), Client (Files, Visa [admin], Notes, Deliveries, Tasks).
- Members who have "see whole client" get an overview strip (sales, spend, ROAS) on their own results.
- Media plan: per month; platform monthly total typed manually; campaign budget = **daily** spend (they are not linked); pacing bar; branded PDF export with a campaign tree.
- Campaigns: Search builder (settings, ad groups, keywords with match types, RSA 15/4 with counters and pins, extensions, tracking checklist, testing/optimization, QA, Google Ads Editor CSV export) and PMax (added in another chat).
- Side notes on Today + per-client Notes (timestamped; issues can be marked resolved; "copy month summary"); the report skill reads `client_notes`.
- Finance: per client billing (SAR/EGP/USD), schedules, paid/late, monthly summary, FX rates.
- Every plan form has "+ خانة جديدة" (custom named fields); Zyad asked for this everywhere.

## Testing
Use Playwright with an in-memory Supabase mock (build one that exposes the tables above) before deploying, and show Zyad a screenshot of the result. GitHub Pages takes 1–2 minutes to publish; a hard refresh fixes a stale version. The sidebar footer shows the running version.
