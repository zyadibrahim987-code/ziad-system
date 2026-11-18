# Zyad Work System: project context

Read this first in any new chat about the system. Reply to Zyad in **Egyptian Arabic**, short and clear. He cares most that things are **easy to use and not confusing**.

## Who and what
- Zyad Ibrahim, freelance Performance Media Buyer (Cairo). Clients are mostly Saudi (SAR).
- The system is his team ERP: admin (Zyad) + team members he creates (Media Buyer, Designer, Account Manager, CMO, Sales Manager…), clients (store or leads), daily numbers, tasks and deliveries, dashboards, finance, strategy, media plan and campaigns.
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
profiles, clients, client_members (per client: platforms, see_numbers, see_files, plan_access none/view/edit), metrics (daily numbers; `p` = platform, `_store` = store sales, `_bk` = bookings), tasks, task_status, client_files, lead_stats, client_billing + payments + app_settings (finance; **admin only**), plan_items + plan_meta (Media plan), plan_campaigns (Search + PMax campaign builder, data in jsonb), strategy_items (Strategy area: one row per item; `kind` = store / store_note / avatar so far, new roadmap sessions add kinds; `data` jsonb; same RLS as plan_campaigns via plan_access), client_notes (side notes: client_delay, account, payment, site, action, note; with resolved_at), client_cards (Visa vault: **admin only**, encrypted in the browser with Zyad's own passphrase, stores only last4 + ciphertext), clarity_projects + clarity_snapshots (made in another chat; not wired into the app yet).
RLS helpers live in the `private` schema: is_admin, is_member_of, sees_numbers, sees_files, member_platforms, plan_access.

## Hard rules (Zyad's requirements)
1. The team must **never** see anything finance-related (billing, payments, fees, rates) or the Visa cards. After any change, verify with RLS tests while impersonating a member.
2. Members cannot change their own password; Settings for members = logout only.
3. **Never modify his existing Google Sheets.** Read only.
4. Ask before any irreversible deletion of data.
5. Never put the sync token or any secret in GitHub or in chat.
6. Arabic UI with English section labels (Today, Clients, Review, Finance, Settings, Strategy, Media plan, Campaigns…). Fix mixed Arabic/English direction with `<bdi>`/`isolateLatin`; money is shown as "CPP 75 ر.س".
7. Font is IBM Plex Sans Arabic + IBM Plex Sans. Brand: ink #111a1f, teal #0b5d57 / #3fc1a9, lime #c8f04a, paper #f5f4ef; logo = 4-bar mark.
8. Commit as `Zyad Ibrahim <zyadibrahim987@gmail.com>`.
9. Work in **one chat at a time** on the code; pull before deploying, because two chats once pushed over each other.

## Main features (as of 18 Nov 2026)
- Sidebar: Today (admin) / My Tasks (members), Clients, Review, Finance (admin), Settings (Team & Permissions, Clients, Backup & Sheets, Account).
- Client page side views: Results (Total + each team member's slice), Plan (Strategy, Media plan, Campaigns), Client (Files, Visa [admin], Notes, Deliveries, Tasks).
- Members who have "see whole client" get an overview strip (sales, spend, ROAS) on their own results.
- Strategy (client page > Plan > Strategy; code at the end of `core.js`, helpers `strategyView`, `strOf`, state `STR`; CSS `.st-*`): tab "المتجر والمنافسين" (cards or a compare table; our store marked متجرنا and shown first; a "الخلاصة والفرص" note) and tab "Social Media" (stores across × IG/TikTok/Snap/X/YouTube down; stored inside each `store` row as `data.social[ig|tt|snap|x|yt] = {has,url,fol,eng,media[],pct,note}` + `data.social_extra`; summary note kind `social_note`; helpers `stSocial`, `openSocial`, `stNum`), tab "Customer Avatar" (one or more avatars), and tab "KW research" (kind `kw_group`, one row per keyword group: `data = {name, kws:[{t,vol,comp,low,high,is,m3,yoy}], note, extra, sent[]}`; summary kind `kw_note`; paste parser `kwParse` reads sheet/Keyword Planner rows, blank line = new group; `openKwSend`/`doKwSend` append keywords with chosen match types to a Search campaign ad group in `plan_campaigns` (dedupes, can create the ad group or a new campaign, "send all" maps each group to an ad group of the same name)), and tab "Design ideas" (kind `design_idea`, one card per idea: `data = {title, angle, lp, insp:[{url,img}], tagline, copy, sizes[], plats[], note, extra, task:{id,to,at,due}}`; images are resized in the browser and uploaded to the **public** storage bucket `ideas` under `<client_id>/` (insert: admin or plan_access edit on that client); admin-only "حوّلها لتاسك" (`openIdeaTask`/`doIdeaTask`) creates a once task (kind `design`, needs review) with an auto-built brief (`diBrief`) for the chosen designer, and "send all new ideas" makes one task per idea; card status comes from the task's `task_status` (فكرة / عند الديزاينر / اتسلّمت / اترجعت / اتعتمدت) with "شوف التسليم" and "راجع"; filter chips by status), and tab "Motion ideas" (kind `motion_idea`: `data = {title, type, idea, insp:[{url,img}], edits, ost, music, vo:"yes"|"no", vo_text, cta, dur, sizes[], plats[], note, extra, task}`; reuses the Design ideas helpers (`DI_INSP`, `diUpload`, `diPaste`, `diStatus`); functions `moView`, `moCard`, `openMotion`, `saveMotion`, `moBrief`; idea→task is shared through `IDEA_K` + `openIdeaTask(cid,id,kind)`/`doIdeaTask`, motion tasks get kind `motion` and default to a member whose job matches Motion/موشن/Editor). Tab "Shooting ideas" (kind `shoot_idea`: `data = {title, type, idea, insp:[{url,img}], hook, scenes:[{shot,say,sec}], script, cta, dur, loc, cast, props, sizes[], plats[], note, extra, task}`; script = scene rows with an auto total (`sceneRow`, `shTot`), dur falls back to the scene total; functions `shView`, `shCard`, `openShoot`, `shRead`, `saveShoot`, `shBrief`; idea→task via `IDEA_K.shoot_idea`, tasks get kind `shoot` and default to a member whose job matches تصوير/مصوّر/photo/UGC/Content creator). Tab "Offers ideas" (kind `offer_idea`: `data = {title, type, value, products, occ, from, to, code, cond, why, plats[], status, note, extra, di}`; status set by hand idea/sent/ok/live/done/no (`OF_ST`), changeable from a dropdown on the card (`ofSetSt`); cards sorted by start date with an auto "يبدأ بعد / فاضل" chip (`ofWhen`); general note kind `offer_note`; "اعمل منه فكرة تصميم" (`ofToDesign`) creates a `design_idea` with the offer details and stores its id in `data.di`; functions `ofView`, `ofCard`, `openOffer`, `saveOffer`, `dupOffer`). Strategy tabs wrap onto a second line instead of scrolling. Task briefs everywhere now render links as clickable and image links as thumbnails (`briefHtml`). New roadmap sessions add tabs here.
- Media plan: per month; platform monthly total typed manually; campaign budget = **daily** spend (they are not linked); pacing bar; branded PDF export with a campaign tree.
- Campaigns: Search builder (settings, ad groups, keywords with match types, RSA 15/4 with counters and pins, extensions, tracking checklist, testing/optimization, QA, Google Ads Editor CSV export) and PMax (asset groups, themes, signals, QA, Editor export).
- Side notes on Today + per-client Notes (timestamped; issues can be marked resolved; "copy month summary"); the report skill reads `client_notes`.
- Finance: per client billing (SAR/EGP/USD), schedules, paid/late, monthly summary, FX rates.
- Every plan form has "+ خانة جديدة" (custom named fields); Zyad asked for this everywhere.

## Strategy roadmap (agreed 18 Nov 2026): one feature per chat, build + test + deploy
Source sheets Zyad uses today (read only, never edit):
- Strategy (PC Cloud example): https://docs.google.com/spreadsheets/d/1PK4-wtIwmS1i3VvykvHiQDyVxruePH8FhJQP2sIxNxo
- Media plan: https://docs.google.com/spreadsheets/d/14cIXGT7L9YpGlt3XRgkehQse5wXQ7WD5HwJkxXekKhA (done)
- Search structure: https://docs.google.com/spreadsheets/d/1nSjl_wbcrPUBp_El-lj-2o-FOinx2O2iXo5IAWAFofg (done)
- PMax structure: https://docs.google.com/spreadsheets/d/1x1LMyaSl1utzgRVzk-jZxnpua6uhZA4OMXQafCWzTpc (done)
- KW research: https://docs.google.com/spreadsheets/d/1uHuheHHLxjlnzGsLIGlH1wJgG-nDn0h32vN1ylXWfJ0

Planned sessions, in order (tick when deployed):
1. [x] (deployed 18 Nov) Store + competitors analysis (website) + Customer Avatar.
2. [x] (deployed 18 Nov) Social media analysis for the store and each competitor: per platform (IG, TikTok, Snap, X, YouTube): link, media type, share %, engagement, followers, brief note. Attach to the existing store rows (kind `store`) so the compare table can show it.
3. [x] (deployed 18 Nov) KW research (Search): keyword, avg monthly searches, competition, low/high bid, impression share, 3-month change, YoY; group keywords and send them to a Search campaign ad group.
4. [x] (deployed 18 Nov) Design ideas → designer task: landing page, angle, inspiration (link/image), tagline (design text), ad copy, size, platforms. Each row can become a task.
5. [x] (deployed 18 Nov) Motion ideas → task: task type, reference link, video idea, edits, on-screen text, music, AI voice-over yes/no, outro CTA, notes.
6. [x] (deployed 18 Nov) Shooting ideas + references + scripts: reference link, idea, script, duration, notes.
7. [x] (deployed 18 Nov) Offers ideas: a place to log offer ideas per client (offer, products, period/occasion, status).

Home: client page → Plan → Strategy (tabs). Store every new kind in `strategy_items`. Plan permission (plan_access) applies; no finance data in any of these.

## Testing
Use Playwright with the in-memory Supabase mock `src/test/mock.js`: route the supabase-js CDN request to it plus a `__mockSetup({tables, user})` call, and load a copy of `src/index.html` placed next to the built `app.js` (the root `index.html` only gets the new CSS when deploy.py runs). Show Zyad a screenshot before deploying. For DB changes, run an RLS check in SQL impersonating a member (`set local role authenticated` + `request.jwt.claims`) with plan_access none and edit. GitHub Pages takes 1–2 minutes to publish; a hard refresh fixes a stale version. The sidebar footer shows the running version.
