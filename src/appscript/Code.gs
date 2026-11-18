/**
 * Zyad Work System — backup + lead sheets sync
 * Runs every hour:
 *  1) Pulls every number from the system into the tabs "الأرقام" and "ملخص يومي" (backup).
 *  2) Reads each leads client's lead sheet and sends daily lead + booking counts to the system.
 * Setup: run  setup()  once and approve the permissions. That's it.
 */
const SYNC_URL = "https://apnxxhvjqnqgpryscixg.supabase.co/functions/v1/sync";
const TOKEN = "PUT_SYNC_TOKEN_HERE"; // the real token is only in the Apps Script project, never in GitHub
const TZ = "Asia/Riyadh";

function setup() {
  ScriptApp.getProjectTriggers().forEach(function (t) { ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger("syncAll").timeBased().everyHours(1).create();
  syncAll();
}

function syncAll() {
  const log = [];
  let data;
  try { data = fetchExport_(); } catch (e) { writeStatus_([["خطأ في سحب الأرقام", String(e)]]); throw e; }
  try { const n = writeBackup_(data); log.push(["النسخة الاحتياطية", n + " صف"]); } catch (e) { log.push(["النسخة الاحتياطية", "خطأ: " + e]); }
  data.clients.filter(function (c) { return c.type === "leads" && c.lead_sheet && c.lead_sheet.url; }).forEach(function (c) {
    try {
      const res = readLeadSheet_(c);
      post_({ action: "leads", client_id: c.id, stats: res.stats, tabs: res.tabs, skipped_rows: res.skipped });
      log.push(["شيت ليدز " + c.name, res.total + " ليد · " + res.booked + " حجز · " + res.skipped + " صف اتجاهل"]);
    } catch (e) { log.push(["شيت ليدز " + c.name, "خطأ: " + e]); }
  });
  writeStatus_(log);
}

/* ---------- system API ---------- */
function fetchExport_() {
  const r = UrlFetchApp.fetch(SYNC_URL + "?action=export", { headers: { "x-sync-token": TOKEN }, muteHttpExceptions: true });
  if (r.getResponseCode() !== 200) throw new Error("HTTP " + r.getResponseCode() + " " + r.getContentText().slice(0, 200));
  return JSON.parse(r.getContentText());
}
function post_(body) {
  const r = UrlFetchApp.fetch(SYNC_URL, { method: "post", contentType: "application/json", headers: { "x-sync-token": TOKEN }, payload: JSON.stringify(body), muteHttpExceptions: true });
  if (r.getResponseCode() !== 200) throw new Error("HTTP " + r.getResponseCode() + " " + r.getContentText().slice(0, 200));
  return JSON.parse(r.getContentText());
}

/* ---------- 1) backup ---------- */
function writeBackup_(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const C = {}; data.clients.forEach(function (c) { C[c.id] = c; });
  const P = {}; data.profiles.forEach(function (p) { P[p.id] = p.name || p.email; });
  const n = function (v) { return v == null || v === "" ? "" : Number(v); };
  const pname = function (p) { return p === "_store" ? "المتجر (المبيعات)" : p === "_bk" ? "حجوزات" : p; };
  const head = ["التاريخ", "العميل", "المنصة", "القسم", "الصرف", "مكالمات", "رسائل", "ليدز", "تحويلات أخرى", "حجوزات", "قيمة الحجوزات", "أوردرات", "المبيعات", "سجّلها", "آخر تعديل"];
  const rows = data.metrics.map(function (m) {
    const c = C[m.client_id] || {};
    return [m.d, c.name || "", pname(m.p), m.dep || "", n(m.s), n(m.ca), n(m.ms), n(m.ld), n(m.ins), n(m.bk), n(m.bv), n(m.o), n(m.sl), P[m.entered_by] || "", m.updated_at ? new Date(m.updated_at) : ""];
  });
  putTable_(ss, "الأرقام", head, rows);

  // daily summary per client
  const agg = {};
  data.metrics.forEach(function (m) {
    const k = m.d + "|" + m.client_id; const a = agg[k] = agg[k] || { d: m.d, cid: m.client_id, s: 0, conv: 0, po: 0, so: 0, sl: 0, bk: 0 };
    a.s += +m.s || 0; a.conv += (+m.ca || 0) + (+m.ms || 0) + (+m.ld || 0) + (+m.ins || 0); a.sl += +m.sl || 0; a.bk += +m.bk || 0;
    if (m.p === "_store") a.so += +m.o || 0; else if (m.p !== "_bk") a.po += +m.o || 0;
  });
  const sh2 = ["التاريخ", "العميل", "النوع", "الصرف", "المبيعات", "ROAS", "الأوردرات", "CPP", "التحويلات", "تكلفة التحويل", "حجوزات"];
  const rows2 = Object.keys(agg).sort().reverse().map(function (k) {
    const a = agg[k], c = C[a.cid] || {}, store = c.type === "store", o = a.so || a.po;
    return [a.d, c.name || "", store ? "متجر" : "ليدز", r2_(a.s), store ? r2_(a.sl) : "", store && a.s ? r2_(a.sl / a.s) : "", store ? o : "", store && o ? r2_(a.s / o) : "", store ? "" : a.conv, !store && a.conv ? r2_(a.s / a.conv) : "", a.bk || ""];
  });
  putTable_(ss, "ملخص يومي", sh2, rows2);
  return rows.length;
}
function putTable_(ss, name, head, rows) {
  const sh = ss.getSheetByName(name) || ss.insertSheet(name);
  sh.clearContents();
  sh.getRange(1, 1, 1, head.length).setValues([head]).setFontWeight("bold").setBackground("#0b5d57").setFontColor("#ffffff");
  if (rows.length) sh.getRange(2, 1, rows.length, head.length).setValues(rows);
  sh.setFrozenRows(1); sh.setRightToLeft(true);
}
function writeStatus_(log) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName("حالة المزامنة") || ss.insertSheet("حالة المزامنة", 0);
  sh.clearContents(); sh.setRightToLeft(true);
  const rows = [["آخر تحديث", Utilities.formatDate(new Date(), TZ, "yyyy-MM-dd HH:mm") + " (توقيت السعودية)"]].concat(log);
  sh.getRange(1, 1, rows.length, 2).setValues(rows);
  sh.getRange(1, 1, rows.length, 1).setFontWeight("bold");
  sh.autoResizeColumns(1, 2);
}
function r2_(x) { return Math.round(x * 100) / 100; }

/* ---------- 2) lead sheets ---------- */
const HEADER_RE = /^(created_time|createtime|lead creation time|campaignname|campaign_name|tiktok lead id|formname|form_name)$/i;
const DEPT_GROUPS = [
  { roots: ["عيون", "العيون", "eye"], words: ["عيون", "العيون", "eye", "نظر", "الحول", "ليزك", "قرنية", "شبكية"] },
  { roots: ["أسنان", "اسنان", "الأسنان", "dental"], words: ["اسنان", "أسنان", "الأسنان", "dental", "زراعة الأسنان", "تقويم", "تبييض", "ابتسامة"] },
  { roots: ["تجميل", "جلدية", "aesthetic"], words: ["تجميل", "جلدية", "الجلدية", "aesthetic", "ليزر", "بوتوكس", "فيلر", "ابرة", "إبرة", "نضارة", "بشرة", "رموش", "فراكشنال", "تقشير"] },
  { roots: ["عائلة", "العائلة", "family"], words: ["عائلة", "العائلة", "family", "طب الأسرة"] }
];

function readLeadSheet_(c) {
  const id = (String(c.lead_sheet.url).match(/\/d\/([a-zA-Z0-9-_]+)/) || [])[1];
  if (!id) throw new Error("لينك الشيت مش مظبوط");
  const ss = SpreadsheetApp.openById(id);
  const over = c.lead_sheet.tabs || {};
  const plats = (c.platforms || []).map(function (p) { return typeof p === "string" ? p : p.name; });
  const depts = c.depts || [];
  const agg = {}, tabs = []; let skipped = 0, total = 0, booked = 0;

  ss.getSheets().forEach(function (sh) {
    const name = sh.getName(), o = over[name] || {};
    const info = { name: name, p: o.p || guessPlatform_(name, plats), dep: o.dep || "", skip: !!o.skip, leads: 0, booked: 0, first: "", last: "" };
    tabs.push(info);
    if (o.skip) return;
    const vals = sh.getDataRange().getValues();
    if (vals.length < 2) return;
    let hi = -1;
    for (let i = 0; i < Math.min(6, vals.length); i++) if (vals[i].some(function (x) { return HEADER_RE.test(String(x).trim()); })) { hi = i; break; }
    if (hi < 0) hi = 0;
    const H = vals[hi].map(function (x) { return String(x).trim().toLowerCase(); });
    const col = function (re) { for (let j = 0; j < H.length; j++) if (re.test(H[j])) return j; return -1; };
    const cDate = col(/^(created_time|createtime|lead creation time|created time|date|التاريخ)$/);
    const cTT = col(/^tiktok lead id$/);
    const textCols = H.map(function (h, j) { return /(campaign|form|adset|adsquad|ad_?name|خدمة|الخدمة|القسم)/.test(h) ? j : -1; }).filter(function (j) { return j >= 0; });
    const tabDep = info.dep || guessDept_(name, depts);

    for (let i = 0; i < vals.length; i++) {
      if (i === hi) continue;
      const r = vals[i];
      if (r.every(function (x) { return x === "" || x === null; })) continue;
      if (r.some(function (x) { return /^test[:\s]|test lead|dummy data|^تيست|\sتيست/i.test(String(x)); })) { skipped++; continue; }
      let d = cDate >= 0 ? toDay_(r[cDate]) : null;
      if (!d && cTT >= 0) d = fromTikTokId_(r[cTT]);
      if (!d) for (let j = 0; j < r.length && !d; j++) if (/^\d{4}-\d{2}-\d{2}T/.test(String(r[j]))) d = toDay_(r[j]);
      if (!d) { skipped++; continue; }
      const dep = tabDep || guessDept_(textCols.map(function (j) { return r[j]; }).join(" "), depts);
      const isBooked = r.some(function (x) { const s = String(x); return /حجز/.test(s) && !/(لم|ما تم|الغاء|إلغاء|كنسل|ملغي|يرغب)/.test(s); });
      const k = d + "|" + name + "|" + dep;
      const a = agg[k] = agg[k] || { d: d, tab: name, p: info.p, dep: dep, leads: 0, booked: 0 };
      a.leads++; info.leads++; total++;
      if (isBooked) { a.booked++; info.booked++; booked++; }
      if (!info.first || d < info.first) info.first = d;
      if (!info.last || d > info.last) info.last = d;
    }
  });
  return { stats: Object.keys(agg).map(function (k) { return agg[k]; }), tabs: tabs, skipped: skipped, total: total, booked: booked };
}
function toDay_(v) {
  if (!v) return null;
  if (Object.prototype.toString.call(v) === "[object Date]" && !isNaN(v)) return Utilities.formatDate(v, TZ, "yyyy-MM-dd");
  const s = String(v).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) { const dt = new Date(s); if (!isNaN(dt)) return Utilities.formatDate(dt, TZ, "yyyy-MM-dd"); return s.slice(0, 10); }
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (m) return m[3] + "-" + ("0" + m[2]).slice(-2) + "-" + ("0" + m[1]).slice(-2);
  return null;
}
function fromTikTokId_(v) {
  const s = String(v).replace(/\D/g, ""); if (s.length < 17) return null;
  const secs = Math.floor(Number(s) / 4294967296);
  if (secs < 1500000000 || secs > 2200000000) return null;
  return Utilities.formatDate(new Date(secs * 1000), TZ, "yyyy-MM-dd");
}
function guessPlatform_(name, plats) {
  const s = name.toLowerCase();
  let g = /tik ?tok|تيك/.test(s) ? "TikTok" : /snap|سناب/.test(s) ? "Snapchat" : /insta|انستا|انستجرام|meta|face|فيس|\bfb\b|\big\b/.test(s) ? "Meta" : /google|جوجل/.test(s) ? "Google" : /\bx\b|twitter|تويتر/.test(s) ? "X" : "";
  const hit = plats.filter(function (p) { return p.toLowerCase() === g.toLowerCase(); })[0];
  return hit || g;
}
function guessDept_(text, depts) {
  const t = String(text).toLowerCase();
  for (let i = 0; i < depts.length; i++) {
    const d = depts[i], grp = DEPT_GROUPS.filter(function (g) { return g.roots.some(function (r) { return d.indexOf(r) >= 0; }); })[0];
    const words = grp ? grp.words : [d];
    if (words.some(function (w) { return t.indexOf(w.toLowerCase()) >= 0; })) return d;
  }
  return "";
}
