const DAYS = ["الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"];
const DAY_ORDER = [6,0,1,2,3,4,5];
const DSHORT = ["أحد","اثنين","تلات","أربع","خميس","جمعة","سبت"];
const MONTHS = ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];
const PLATFORM_PRESETS = ["Meta","TikTok","Snapchat","Google","X","LinkedIn","YouTube"];
const BADGE = { meta:["#0866FF","M"], tiktok:["#111111","T"], snapchat:["#FFE600","S","#111"], google:["#34A853","G"], x:["#2b2b2b","X"], linkedin:["#0A66C2","in"], youtube:["#E62117","Y"] };
const REPEAT_LABEL = {daily:"كل يوم",interval:"كل كام يوم",days:"أيام محددة",weekly:"أسبوعي",monthly:"شهري",once:"مرة واحدة"};
const DEFAULT_TASKS = [
  {title:"Optimization ومتابعة الكامبينز", repeat:"daily", kind:"optimize"},
  {title:"سجّل أرقام امبارح", repeat:"daily", kind:"metrics"},
  {title:"الرد على العميل", repeat:"daily"},
  {title:"تحليل يومي: الصرف والتكلفة", repeat:"daily"},
  {title:"تحليل الكريتيفز والأوديانس", repeat:"interval", every:2},
  {title:"تحليل أسبوعي لنتايج كل المنصات", repeat:"weekly", days:[4]},
  {title:"الريبورت الأسبوعي", repeat:"weekly", days:[4], kind:"weeklyReport"},
  {title:"الريبورت الشهري", repeat:"monthly", monthDay:1, kind:"monthlyReport"},
  {title:"حدد ميعاد ميتينج الريبورت الشهري", repeat:"monthly", monthDay:1, kind:"meeting"},
];
const $ = s => document.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const jsq = s => String(s).replace(/\\/g,"\\\\").replace(/'/g,"\\'");
const uid = () => Math.random().toString(36).slice(2,10) + Date.now().toString(36).slice(-4);
const pad = n => String(n).padStart(2,"0");
const keyOf = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const fromKey = k => { const [y,m,d] = k.split("-").map(Number); return new Date(y,m-1,d||1); };
const addDays = (d,n) => { const x = new Date(d); x.setDate(x.getDate()+n); return x; };
const addDaysK = (k,n) => keyOf(addDays(fromKey(k), n));
const daysBetween = (a,b) => Math.round((fromKey(b) - fromKey(a)) / 864e5);
const todayK = () => keyOf(new Date());
const ymOf = k => k.slice(0,7);
const ymAdd = (ym, n) => { const d = fromKey(ym + "-01"); return keyOf(new Date(d.getFullYear(), d.getMonth()+n, 1)).slice(0,7); };
const monthLabel = ym => `${MONTHS[+ym.slice(5)-1]} ${ym.slice(0,4)}`;
const daysOfMonth = ym => { const d = fromKey(ym+"-01"); const n = new Date(d.getFullYear(), d.getMonth()+1, 0).getDate(); return Array.from({length:n}, (_,i) => `${ym}-${pad(i+1)}`); };
const fmtDate = d => `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
const fmtShort = k => { const d = fromKey(k); return `${d.getDate()} ${MONTHS[d.getMonth()]}`; };
const normUrl = u => { u = (u||"").trim(); if(!u) return ""; return /^https?:\/\//i.test(u) ? u : "https://" + u; };
const num = v => { if (v == null || v === "") return 0; const n = parseFloat(String(v).replace(/[,\s]/g,"")); return isFinite(n) ? n : 0; };
const r2 = n => Math.round((+n||0)*100)/100;
const fmt = (n, dec=0) => (n == null || !isFinite(n)) ? "—" : Number(n).toLocaleString("en-US",{maximumFractionDigits:dec});
const fmt2 = n => fmt(n, 2);
const z = n => n ? fmt(n) : "";
const sheetIdFromUrl = u => (String(u||"").match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/)||[])[1] || null;
function toast(msg){ const t=$("#toast"); t.textContent=msg; t.classList.add("show"); clearTimeout(toast._t); toast._t=setTimeout(()=>t.classList.remove("show"),2200); }
function badge(name){
  const k = String(name||"").toLowerCase().replace(/\s+/g,"");
  let b = BADGE[k];
  if (!b) { let h = 0; for (const ch of k) h = (h*31 + ch.charCodeAt(0)) >>> 0; const hues = ["#7c4dff","#00897b","#ef6c00","#5d4037","#c2185b","#455a64"]; b = [hues[h % hues.length], (name||"?").trim().charAt(0).toUpperCase()]; }
  return `<span class="pb" style="background:${b[0]};color:${b[2]||"#fff"}">${esc(b[1])}</span>`;
}
const pname = p => `<span class="pname">${badge(p)}${esc(p)}</span>`;

function agg(rows){
  const a = {s:0,ca:0,ms:0,ld:0,in:0,bk:0,bv:0,o:0,sl:0,po:0,so:0};
  const od = {};
  for (const r of rows) {
    for (const k in a) if (k !== "o" && k !== "po" && k !== "so") a[k] += +r[k] || 0;
    if (r.o) { const x = od[r.d] = od[r.d] || { so:0, po:0 }; if (r.p === "_store") x.so += +r.o; else if (r.p !== "_bk") x.po += +r.o; }
  }
  a.poB = 0; a.soB = 0;
  for (const d in od) { a.so += od[d].so; a.po += od[d].po; a.o += od[d].so || od[d].po; if (od[d].so && od[d].po) { a.soB += od[d].so; a.poB += od[d].po; } }
  a.conv = a.ca + a.ms + a.ld + a.in;
  a.cpl = a.conv ? a.s / a.conv : null; a.roas = a.s ? a.sl / a.s : null;
  a.cpp = a.o ? a.s / a.o : null; a.aov = a.o ? a.sl / a.o : null; a.cpb = a.bk ? a.s / a.bk : null;
  return a;
}
const monthRows = (cid, ym) => (M[cid]||[]).filter(r => r.d.startsWith(ym));
const adRows = rows => rows.filter(r => r.p !== "_bk" && r.p !== "_store");
function platformsInUse(c, rows){ const names = plats(c).map(p => p.name); for (const r of adRows(rows)) if (!names.includes(r.p)) names.push(r.p); return names; }
function deptsInUse(c, rows){ const ds = (c.depts||[]).slice(); for (const r of rows) if (r.dep && !ds.includes(r.dep)) ds.push(r.dep); return ds; }


function isDueOn(task, dk){
  const d = fromKey(dk), wd = d.getDay();
  if (task.paused) return false;
  if (task.clientId) { const c = clientById(task.clientId); if (!c || c.status === "paused") return false; }
  if (task.created && dk < task.created && task.repeat !== "once") return false;
  switch (task.repeat) {
    case "daily": return !(task.skipFriday && wd === 5);
    case "interval": { const n = Math.max(1, task.every||2); const diff = daysBetween(task.created || dk, dk); return diff >= 0 && diff % n === 0; }
    case "days": case "weekly": return (task.days||[]).includes(wd);
    case "monthly": { const last = new Date(d.getFullYear(), d.getMonth()+1, 0).getDate(); return d.getDate() === Math.min(task.monthDay||1, last); }
    case "once": return task.date === dk;
  }
  return false;
}

function repeatText(t){
  if (t.repeat === "daily") return t.skipFriday ? "كل يوم ما عدا الجمعة" : "كل يوم";
  if (t.repeat === "interval") return (t.every||2) === 2 ? "كل يومين" : `كل ${t.every} أيام`;
  if (t.repeat === "days" || t.repeat === "weekly") return (t.repeat==="weekly"?"كل أسبوع: ":"") + DAY_ORDER.filter(d => (t.days||[]).includes(d)).map(d=>DAYS[d]).join("، ");
  if (t.repeat === "monthly") return `يوم ${t.monthDay||1} من كل شهر`;
  if (t.repeat === "once") return t.date ? `مرة واحدة — ${fmtDate(fromKey(t.date))}` : "مرة واحدة";
  return "";
}

function linksHtml(c){ return (c.links||[]).filter(l => l.url).map(l => `<a class="link" href="${esc(normUrl(l.url))}" target="_blank" rel="noopener" onclick="event.stopPropagation()">${esc(l.label||"لينك")}</a>`).join(""); }


function deltaHtml(cur, prev, goodUp){
  if (cur == null || prev == null || !prev) return `<div class="d muted">—</div>`;
  const ch = (cur - prev) / prev * 100; if (!isFinite(ch)) return "";
  const good = goodUp ? ch >= 0 : ch <= 0;
  return `<div class="d ${good ? "up" : "down"}">${ch >= 0 ? "▲" : "▼"} ${fmt(Math.abs(ch))}% عن الشهر اللي فات</div>`;
}
function rate(cls, val, avg, lowerIsGood){ // color a cell vs month average
  if (val == null || avg == null || !avg) return "";
  const r = val / avg;
  if (lowerIsGood) return r > 1.3 ? "bad" : r < 0.75 ? "good" : "";
  return r < 0.75 ? "bad" : r > 1.3 ? "good" : "";
}

function matrixLeads(c, ym, rows, P, D){
  const days = daysOfMonth(ym), tk = todayK(), ad = adRows(rows), bk = rows.filter(r => r.p === "_bk");
  const view = D.length ? ui.view : (ui.view === "dept" || ui.view === "full" ? "platform" : ui.view);
  const groups = view === "dept" ? D.map(d => ({ label: esc(d), f: r => r.dep === d })) :
                 view === "full" ? P.flatMap(p => D.map(d => ({ label: `${badge(p)} ${esc(d)}`, f: r => r.p === p && r.dep === d }))) :
                 P.map(p => ({ label: pname(p), f: r => r.p === p }));
  const avgs = groups.map(g => agg(ad.filter(g.f)).cpl), totAvg = agg(ad).cpl;
  let h = `<div class="section-title"><h3>الماتريكس اليومي</h3>
    <div class="seg"><button class="${view==="platform"?"on":""}" onclick="ui.view='platform';saveUi();render()">حسب المنصة</button>${D.length ? `<button class="${view==="dept"?"on":""}" onclick="ui.view='dept';saveUi();render()">حسب القسم</button><button class="${view==="full"?"on":""}" onclick="ui.view='full';saveUi();render()">تفصيلي</button>` : ""}</div>
    <span class="spacer"></span><div class="legend"><span><i style="background:var(--bad-cell)"></i>أغلى من متوسط الشهر بـ 30%+</span><span><i style="background:var(--ok-cell)"></i>أرخص بـ 25%+</span><span>دوس على أي يوم عشان تسجّل أو تعدّل</span></div></div>
  <div class="tscroll"><table class="t"><thead>
    <tr><th class="grp"></th>${groups.map(g => `<th class="grp sep" colspan="3">${g.label}</th>`).join("")}<th class="grp sep" colspan="3">الإجمالي</th><th class="grp sep">حجوزات</th></tr>
    <tr><th>اليوم</th>${groups.map(() => `<th class="sep">صرف</th><th>تحويلات</th><th>CPA</th>`).join("")}<th class="sep">صرف</th><th>تحويلات</th><th>CPA</th><th class="sep"></th></tr></thead><tbody>`;
  for (const d of days) {
    const dr = ad.filter(r => r.d === d), fut = d > tk;
    const cells = groups.map((g, i) => { const x = agg(dr.filter(g.f)); const cls = x.s > 0 && x.conv === 0 ? "bad" : rate("", x.cpl, avgs[i], true); return `<td class="sep">${z(x.s)}</td><td>${z(x.conv)}</td><td class="${cls}">${x.cpl != null ? fmt2(x.cpl) : x.s ? "∞" : ""}</td>`; }).join("");
    const t = agg(dr), b = agg(bk.filter(r => r.d === d)).bk, tcls = t.s > 0 && t.conv === 0 ? "bad" : rate("", t.cpl, totAvg, true);
    h += `<tr class="click${fut ? " future" : ""}" onclick="openEntry('${c.id}','${d}')"><td>${fromKey(d).getDate()} <span class="tiny muted">${DSHORT[fromKey(d).getDay()]}</span></td>${cells}<td class="sep"><b>${z(t.s)}</b></td><td><b>${z(t.conv)}</b></td><td class="${tcls}"><b>${t.cpl != null ? fmt2(t.cpl) : t.s ? "∞" : ""}</b></td><td class="sep">${z(b)}</td></tr>`;
  }
  const t = agg(ad);
  h += `<tr class="total"><td>الإجمالي</td>${groups.map(g => { const x = agg(ad.filter(g.f)); return `<td class="sep">${fmt(x.s)}</td><td>${fmt(x.conv)}</td><td>${fmt2(x.cpl)}</td>`; }).join("")}<td class="sep">${fmt(t.s)}</td><td>${fmt(t.conv)}</td><td>${fmt2(t.cpl)}</td><td class="sep">${z(agg(bk).bk)}</td></tr></tbody></table></div>`;
  return h;
}

const PCOLOR = name => { const k = String(name||"").toLowerCase().replace(/\s+/g,""); const b = BADGE[k]; if (b) return k === "snapchat" ? "#E8C800" : (k === "tiktok" || k === "x") ? "var(--mono-plat)" : b[0]; let h = 0; for (const ch of k) h = (h*31 + ch.charCodeAt(0)) >>> 0; return ["#7c4dff","#00897b","#ef6c00","#5d4037","#c2185b","#455a64"][h % 6]; };
const cur = c => c.currency === "SAR" ? "ر.س" : c.currency;
function mixBar(c, ad, total){
  const P = platformsInUse(c, ad).map(p => ({ p, s: agg(ad.filter(r => r.p === p)).s })).filter(x => x.s > 0).sort((a,b) => b.s - a.s);
  if (!P.length) return "";
  return `<div class="section-title" style="margin-bottom:0"><h3>توزيع الصرف على المنصات</h3></div>
    <div class="mix">${P.map(x => `<div title="${esc(x.p)}: ${fmt(x.s)} ${cur(c)}" style="flex:${x.s};background:${PCOLOR(x.p)}"></div>`).join("")}</div>
    <div class="mixlg">${P.map(x => `<span class="pname">${badge(x.p)} ${esc(x.p)}: <b class="num" style="color:var(--ink)">${fmt(x.s)} ${cur(c)}</b> · ${fmt(x.s/total*100)}%</span>`).join("")}</div>`;
}
function metricDefs(c, ad, rows){
  const tg = c.targets || {}, A = agg(rows);
  const vsAvg = (v, avg, lowerGood) => { if (v == null || !avg) return ""; const r = v / avg; const better = lowerGood ? r < 0.85 : r > 1.15, worse = lowerGood ? r > 1.15 : r < 0.85; return better ? "g" : worse ? "r" : "a"; };
  const dot = (cls, t) => `<span class="dot" style="background:${cls}"></span>${t}`;
  if (c.type === "store") return {
    roas: { b:"ROAS", l:"ROAS", v:x => x.sl ? fmt(x.roas,1) : "—", sub:x => `صرف ${fmt(x.s)} ${cur(c)}`,
      cls:x => !x.sl ? "" : tg.minRoas ? (x.roas >= tg.minRoas*1.1 ? "g" : x.roas >= tg.minRoas ? "a" : "r") : vsAvg(x.roas, A.roas, false),
      lg: tg.minRoas ? `ROAS = المبيعات ÷ الصرف. ${dot("var(--ok)","فوق التارجت بـ 10%+")} ${dot("var(--warn)","على التارجت بالعافية")} ${dot("var(--danger)",`تحت التارجت (${fmt2(tg.minRoas)})`)}` : `ROAS = المبيعات ÷ الصرف. اللون مقارنة بمتوسط الشهر (${fmt(A.roas,1)}): ${dot("var(--ok)","أحسن")} ${dot("var(--warn)","قريب منه")} ${dot("var(--danger)","أسوأ")}. حط تارجت من الإعدادات عشان اللون يبقى على التارجت.` },
    s:   { b:"الصرف", l:`الصرف (${cur(c)})`, v:x => fmt(x.s), sub:x => x.sl ? `ROAS ${fmt(x.roas,1)}` : "", cls:() => "", lg:`إجمالي صرف كل يوم على كل المنصات بالـ ${cur(c)}.` },
    sl:  { b:"المبيعات", l:`المبيعات (${cur(c)})`, v:x => x.sl >= 10000 ? fmt(x.sl/1000,1) + "K" : fmt(x.sl), sub:x => `صرف ${fmt(x.s)}`,
      cls:x => { const T = salesTarget(c, ymOf(rows[0] ? rows[0].d : todayK())), dt = T ? T / daysOfMonth(ymOf(rows[0] ? rows[0].d : todayK())).length : 0; return !dt || !x.sl ? "" : x.sl >= dt ? "g" : x.sl >= dt*0.85 ? "a" : "r"; },
      lg: (() => { const ym0 = ymOf(rows[0] ? rows[0].d : todayK()), T = salesTarget(c, ym0); if (!T) return `مبيعات كل يوم بالـ ${cur(c)}. K = ألف. حط تارجت مبيعات عشان الأيام تتلوّن.`; const dt = T / daysOfMonth(ym0).length; return `مبيعات كل يوم بالـ ${cur(c)} (K = ألف). المطلوب في اليوم عشان توصل لتارجت ${fmt(T)}: <b>${fmt(dt)}</b>. ${dot("var(--ok)","وصل المطلوب")} ${dot("var(--warn)","قريب (85%+)")} ${dot("var(--danger)","أقل")}`; })() },
    o:   { b:"الأوردرات", l:"الأوردرات", v:x => fmt(x.o), sub:x => x.cpp != null ? `CPP ${fmt2(x.cpp)}` : "", cls:() => "", lg:"عدد الأوردرات كل يوم." },
    cpp: { b:"CPP", l:`CPP (${cur(c)})`, v:x => x.cpp != null ? fmt2(x.cpp) : "—", sub:x => `أوردرات ${fmt(x.o)}`,
      cls:x => tg.maxCpp && x.cpp != null ? (x.cpp <= tg.maxCpp*0.9 ? "g" : x.cpp <= tg.maxCpp ? "a" : "r") : vsAvg(x.cpp, A.cpp, true),
      lg:`CPP = تكلفة الأوردر الواحد (الصرف ÷ الأوردرات). ${dot("var(--ok)","أرخص")} ${dot("var(--danger)","أغلى")} ${tg.maxCpp ? `من التارجت (${fmt2(tg.maxCpp)})` : `من متوسط الشهر (${fmt2(A.cpp)})`}` },
  };
  const AA = agg(ad);
  return {
    cpl: { b:"تكلفة التحويل", l:`تكلفة التحويل (${cur(c)})`, v:x => x.conv ? fmt2(x.cpl) : x.s ? "مفيش" : "—", sub:x => `${fmt(x.conv)} تحويل · صرف ${fmt(x.s)}`,
      cls:x => x.s && !x.conv ? "r" : tg.cpl && x.cpl != null ? (x.cpl <= tg.cpl*0.9 ? "g" : x.cpl <= tg.cpl ? "a" : "r") : vsAvg(x.cpl, AA.cpl, true),
      lg: tg.cpl ? `تكلفة التحويل = الصرف ÷ (ليدز + رسائل + مكالمات). ${dot("var(--ok)","أرخص من التارجت بـ 10%+")} ${dot("var(--warn)","على التارجت بالعافية")} ${dot("var(--danger)",`أغلى من التارجت (${fmt2(tg.cpl)}) أو صرف من غير تحويلات`)}` : `تكلفة التحويل = الصرف ÷ (ليدز + رسائل + مكالمات). اللون مقارنة بمتوسط الشهر (${fmt2(AA.cpl)}): ${dot("var(--ok)","أرخص")} ${dot("var(--warn)","قريب منه")} ${dot("var(--danger)","أغلى")}. حط تارجت من الإعدادات عشان اللون يبقى على التارجت.` },
    conv:{ b:"التحويلات", l:"التحويلات", v:x => fmt(x.conv), sub:x => [x.ld ? `${fmt(x.ld)} ليد` : "", x.ms ? `${fmt(x.ms)} رسالة` : "", x.ca ? `${fmt(x.ca)} مكالمة` : ""].filter(Boolean).join(" · "), cls:() => "", lg:"عدد التحويلات كل يوم (ليدز + رسائل + مكالمات)." },
    s:   { b:"الصرف", l:`الصرف (${cur(c)})`, v:x => fmt(x.s), sub:x => x.conv ? `${fmt(x.conv)} تحويل` : "", cls:() => "", lg:`إجمالي صرف كل يوم على كل المنصات بالـ ${cur(c)}.` },
    bk:  { b:"الحجوزات", l:"حجوزات فعلية", v:x => x.bk ? fmt(x.bk) : "—", sub:x => x.bk && x.s ? `تكلفة الحجز ${fmt(x.s/x.bk)}` : "", cls:() => "", lg:"الحجوزات الفعلية اللي العميل بعتها لكل يوم." },
  };
}
function calendar(c, ym, rows){
  const defs = metricDefs(c, adRows(rows), rows);
  const key = c.type === "store" ? "metricS" : "metricL";
  let m = ui[key]; if (!defs[m]) m = Object.keys(defs)[0];
  const D = defs[m], days = daysOfMonth(ym), tk = todayK();
  const off = (fromKey(days[0]).getDay() + 1) % 7; // week starts Saturday
  const mname = MONTHS[+ym.slice(5)-1];
  let h = `<div class="section-title"><h3>الشهر يوم بيوم</h3><span class="spacer"></span><span class="tiny muted">المربعات تعرض:</span>
    <div class="seg">${Object.entries(defs).map(([k,d]) => `<button class="${k===m?"on":""}" onclick="ui.${key}='${k}';saveUi();render()">${d.b}</button>`).join("")}</div></div>
  <div class="tiny muted" style="margin:-4px 0 10px">${D.lg}</div>
  <div class="cal calh">${["سبت","أحد","اثنين","تلات","أربع","خميس","جمعة"].map(x => `<div>${x}</div>`).join("")}</div>
  <div class="cal">${"<div></div>".repeat(off)}`;
  for (const d of days) {
    const dr = rows.filter(r => r.d === d), x = agg(c.type === "store" ? dr : adRows(dr)); if (c.type !== "store") x.bk = agg(dr.filter(r => r.p === "_bk")).bk;
    const dn = `${fromKey(d).getDate()} ${mname}`, sel = ui.selDay === d ? " sel" : "";
    if (d > tk) { h += `<div class="cd fut"><span class="dn">${dn}</span></div>`; continue; }
    if (!dr.length) { h += `<div class="cd e${sel}" onclick="ui.selDay='${d}';render()"><span class="dn">${dn}</span><span class="ml">لسه ماتسجلش</span><span class="mv">+ سجّل</span></div>`; continue; }
    h += `<div class="cd ${D.cls(x)}${sel}" onclick="ui.selDay='${d}';render()"><span class="dn">${dn}</span><span class="ml">${D.l}</span><span class="mv">${D.v(x)}</span><span class="sub">${D.sub(x)}</span></div>`;
  }
  h += `</div>`;
  if (ui.selDay && ui.selDay.startsWith(ym)) h += dayDetail(c, ui.selDay, rows.filter(r => r.d === ui.selDay));
  return h;
}
function bars(items, total, c, extra){
  return `<div class="bars">${items.map(x => `<div class="br"><span class="pname">${x.icon||""}${esc(x.name)}</span><div class="track"><i style="width:${total ? Math.max(2, x.s/total*100) : 0}%;background:${x.color}"></i></div><span class="val"><b>${fmt(x.s)} ${cur(c)}</b> · ${total ? fmt(x.s/total*100) : 0}%${extra ? extra(x) : ""}</span></div>`).join("")}</div>`;
}
function dayDetail(c, d, dr){
  const date = fmtDate(fromKey(d));
  if (!dr.length) return `<div class="det"><div class="row"><h3>${date}</h3></div><div class="small muted" style="margin-top:4px">لسه مفيش أرقام لليوم ده.</div><button class="btn primary sm" style="margin-top:10px" onclick="openEntry('${c.id}','${d}')">✍️ سجّل أرقام اليوم ده</button></div>`;
  const ad = adRows(dr), a = agg(c.type === "store" ? dr : ad), P = platformsInUse(c, ad).map(p => ({ name:p, icon:badge(p), color:PCOLOR(p), ...agg(ad.filter(r => r.p === p)) })).filter(x => x.s > 0 || x.conv > 0 || x.po > 0);
  let h = `<div class="det"><div class="row"><h3>تفاصيل ${date}</h3><span class="spacer"></span><button class="btn sm" onclick="openEntry('${c.id}','${d}')">✏️ تعديل الأرقام</button></div>`;
  if (c.type === "store") {
    h += `<div class="kv"><div>الصرف<b>${fmt(a.s)} ${cur(c)}</b></div><div>المبيعات<b>${fmt(a.sl)} ${cur(c)}</b></div><div>ROAS<b>${a.sl ? fmt2(a.roas) : "—"}</b></div><div>الأوردرات<b>${fmt(a.o)}</b></div><div>CPP<b>${a.cpp != null ? fmt2(a.cpp) + " " + cur(c) : "—"}</b></div><div>AOV<b>${a.aov != null ? fmt(a.aov) + " " + cur(c) : "—"}</b></div></div>`;
    if (a.so && a.po) h += `<div class="tiny muted" style="margin-top:6px">أوردرات المتجر ${fmt(a.so)} · المنصات بتقول ${fmt(a.po)}</div>`;
    if (P.length) h += `<div class="small muted" style="margin-top:14px">كل منصة في اليوم ده: الصرف (${cur(c)})، والأوردرات حسب المنصة، والـ CPP</div>` + bars(P.sort((x,y) => y.s - x.s), a.s, c, x => x.po ? ` · <b>${fmt(x.po)}</b> أوردر · CPP <b>${fmt2(x.s/x.po)}</b>` : "");
  } else {
    const bk = agg(dr.filter(r => r.p === "_bk"));
    h += `<div class="kv"><div>الصرف<b>${fmt(a.s)} ${cur(c)}</b></div><div>التحويلات<b>${fmt(a.conv)}</b></div><div>تكلفة التحويل<b>${a.cpl != null ? fmt2(a.cpl) + " " + cur(c) : "—"}</b></div><div>ليدز / رسائل / مكالمات<b>${fmt(a.ld)} / ${fmt(a.ms)} / ${fmt(a.ca)}</b></div>${bk.bk ? `<div>حجوزات فعلية<b>${fmt(bk.bk)}</b></div>` : ""}</div>`;
    const ex = x => ` · <b>${fmt(x.conv)}</b> تحويل · CPA <b>${x.cpl != null ? fmt2(x.cpl) : "—"}</b>`;
    if (P.length) h += `<div class="small muted" style="margin-top:14px">حسب المنصة: الصرف (${cur(c)})، والتحويلات، وتكلفة التحويل</div>` + bars(P.sort((x,y) => y.s - x.s), a.s, c, ex);
    const D = deptsInUse(c, ad);
    if (D.length) { const DS = D.map(dp => ({ name:dp, color:"var(--accent)", ...agg(ad.filter(r => r.dep === dp)) })).filter(x => x.s > 0 || x.conv > 0); if (DS.length) h += `<div class="small muted" style="margin-top:14px">حسب القسم</div>` + bars(DS.sort((x,y) => y.s - x.s), a.s, c, ex); }
  }
  return h + `</div>`;
}
function salesTarget(c, ym){ const t = c.targets || {}; const m = t.salesMonths && t.salesMonths[ym]; return m != null ? (m || null) : (t.sales || null); }
function salesCard(c, ym, a, pa){
  const T = salesTarget(c, ym);
  let h = `<div class="stat"><div class="l row" style="gap:6px">المبيعات<span class="spacer"></span><button class="btn xs ghost" style="padding:0 4px" onclick="openSalesTarget('${c.id}','${ym}')">🎯 ${T ? "التارجت" : "+ تارجت"}</button></div><div class="n">${fmt(a.sl)} <span class="small muted">${cur(c)}</span></div>`;
  if (!T) return h + deltaHtml(a.sl, pa.sl, true) + `</div>`;
  const pct = a.sl / T * 100, n = daysOfMonth(ym).length, tk = todayK(), isCur = ymOf(tk) === ym;
  h += `<div class="progress" style="margin-top:6px"><i style="width:${Math.min(100,pct)}%;background:${pct >= 100 ? "var(--ok)" : "var(--accent)"}"></i></div>
    <div class="d"><b>${fmt(pct)}%</b> من تارجت ${fmt(T)} ${cur(c)}</div>`;
  if (isCur && pct < 100) {
    const passed = fromKey(tk).getDate() - 1, left = n - passed, expected = T * passed / n, need = (T - a.sl) / Math.max(1, left);
    if (passed > 0) h += `<div class="d ${a.sl >= expected ? "up" : "down"}">${a.sl >= expected ? "ماشي أسرع من المطلوب" : `متأخر ${fmt(expected - a.sl)} ${cur(c)} عن المطلوب لحد امبارح`}</div>`;
    h += `<div class="d muted">محتاج ${fmt(need)} ${cur(c)} في اليوم الباقي ${left} يوم</div>`;
  } else if (pct >= 100) h += `<div class="d up">التارجت اتحقق ✓</div>`;
  else h += `<div class="d down">فاضل ${fmt(T - a.sl)} ${cur(c)} عن التارجت</div>`;
  return h + `</div>`;
}
function openSalesTarget(cid, ym){
  const c = clientById(cid), t = c.targets || {}, m = t.salesMonths && t.salesMonths[ym];
  openModal(`<h2>🎯 تارجت مبيعات ${monthLabel(ym)}</h2>
    <p class="small muted">اختياري. سيبه فاضي لو مش عاوز تارجت للشهر ده.</p>
    <label class="f">تارجت المبيعات (${esc(c.currency)})</label><input class="inp" id="stVal" type="number" step="1" autofocus value="${m != null ? (m || "") : (t.sales ?? "")}">
    <label class="check"><input type="checkbox" id="stDef" ${m == null ? "checked" : ""}> خليه التارجت الأساسي لكل الشهور</label>
    <div class="actions"><span class="spacer"></span><button class="btn" onclick="closeModal()">إلغاء</button><button class="btn primary" onclick="saveSalesTarget('${cid}','${ym}')">حفظ</button></div>`);
}
function saveSalesTarget(cid, ym){
  const c = clientById(cid), v = parseFloat($("#stVal").value), val = isFinite(v) && v > 0 ? v : 0;
  c.targets = c.targets || {}; c.targets.salesMonths = c.targets.salesMonths || {};
  if ($("#stDef").checked) { c.targets.sales = val || undefined; delete c.targets.salesMonths[ym]; }
  else c.targets.salesMonths[ym] = val;
  persist(); if (c.sheet && M[c.id]) queueWrite(c.id, [ym]); closeModal(); render(); toast("اتحفظ ✓");
}
function storeDash2(c, ym, rows, a, pa){
  const tg = c.targets || {}, ad = adRows(rows);
  let h = `<div class="stats">
    <div class="stat"><div class="l">الصرف</div><div class="n">${fmt(a.s)} <span class="small muted">${cur(c)}</span></div>${deltaHtml(a.s, pa.s, true)}</div>
    ${salesCard(c, ym, a, pa)}
    <div class="stat"><div class="l">ROAS الشهر${tg.minRoas ? ` · التارجت ${fmt2(tg.minRoas)}` : ""}</div><div class="n">${a.sl ? `<span class="hl">${fmt2(a.roas)}</span>` : "—"}</div>${tg.minRoas && a.sl ? `<div class="d ${a.roas >= tg.minRoas ? "up" : "down"}">${a.roas >= tg.minRoas ? "فوق التارجت" : "تحت التارجت"}</div>` : deltaHtml(a.roas, pa.roas, true)}</div>
    <div class="stat"><div class="l">الأوردرات ${a.so ? "(من المتجر)" : a.po ? "(حسب المنصات)" : ""} · CPP ${a.cpp != null ? fmt2(a.cpp) : "—"} · AOV ${a.aov != null ? fmt(a.aov) : "—"}</div><div class="n">${fmt(a.o)}</div>${a.soB ? `<div class="d muted">في الأيام اللي فيها الرقمين: المتجر ${fmt(a.soB)} · المنصات بتقول ${fmt(a.poB)}</div>` : deltaHtml(a.o, pa.o, true)}</div></div>`;
  h += mixBar(c, ad, a.s);
  const PO = platformsInUse(c, ad).map(p => ({ name:p, icon:badge(p), color:PCOLOR(p), ...agg(ad.filter(r => r.p === p)) })).filter(x => x.s > 0 || x.po > 0).sort((x,y) => y.s - x.s);
  if (PO.some(x => x.po)) h += `<div class="section-title" style="margin-bottom:0"><h3>المنصات في الشهر</h3><span class="tiny muted">الصرف (${cur(c)})، والأوردرات حسب كل منصة، وتكلفة الأوردر (CPP) على المنصة</span></div>` + bars(PO, a.s, c, x => ` · <b>${fmt(x.po)}</b> أوردر · CPP <b>${x.po ? fmt2(x.s/x.po) : "—"}</b>`);
  h += calendar(c, ym, rows);
  h += tableToggle(c, ym, rows);
  return h;
}
function leadsDash2(c, ym, rows, a, pa){
  const tg = c.targets || {}, ad = adRows(rows), A = agg(ad), bk = agg(rows.filter(r => r.p === "_bk"));
  const days = daysOfMonth(ym), ls = c.leadSheet ? leadStats(c, ym + "-01", days[days.length-1]) : null;
  let h = `<div class="stats">
    <div class="stat"><div class="l">الصرف</div><div class="n">${fmt(A.s)} <span class="small muted">${cur(c)}</span></div>${deltaHtml(A.s, pa.s, true)}</div>
    <div class="stat"><div class="l">التحويلات · ليدز ${fmt(A.ld)} · رسائل ${fmt(A.ms)} · مكالمات ${fmt(A.ca)}</div><div class="n">${fmt(A.conv)}</div>${deltaHtml(A.conv, pa.conv, true)}</div>
    <div class="stat"><div class="l">تكلفة التحويل${tg.cpl ? ` · التارجت ${fmt2(tg.cpl)}` : ""}</div><div class="n">${A.cpl != null ? `<span class="hl">${fmt2(A.cpl)}</span>` : "—"} <span class="small muted">${cur(c)}</span></div>${tg.cpl && A.cpl != null ? `<div class="d ${A.cpl <= tg.cpl ? "up" : "down"}">${A.cpl <= tg.cpl ? "أرخص من التارجت" : "أغلى من التارجت"}</div>` : deltaHtml(A.cpl, pa.cpl, false)}</div>
    <div class="stat"><div class="l">حجوزات فعلية${bk.bk && A.s ? ` · تكلفة الحجز ${fmt(A.s/bk.bk)} ${cur(c)}` : ""}</div><div class="n">${bk.bk ? fmt(bk.bk) : ls ? fmt(ls.b) : "—"}</div><div class="d muted">${bk.bk ? "من الأرقام اللي سجلتها" : ls ? "من شيت الليدز" : "لسه مفيش"}</div></div></div>`;
  h += mixBar(c, ad, A.s);
  const D = deptsInUse(c, ad);
  if (D.length && A.s) {
    const DS = D.map(dp => ({ name:dp, color:"var(--accent)", ...agg(ad.filter(r => r.dep === dp)) })).filter(x => x.s > 0 || x.conv > 0).sort((x,y) => y.s - x.s);
    h += `<div class="section-title" style="margin-bottom:0"><h3>الأقسام</h3><span class="tiny muted">الصرف (${cur(c)})، والتحويلات، وتكلفة التحويل لكل قسم في الشهر</span></div>` + bars(DS, A.s, c, x => ` · <b>${fmt(x.conv)}</b> تحويل · CPA <b>${x.cpl != null ? fmt2(x.cpl) : "—"}</b>`);
  }
  h += calendar(c, ym, rows);
  h += tableToggle(c, ym, rows);
  h += leadSheetBlock(c, ls);
  return h;
}
function tableToggle(c, ym, rows){
  const open = !!ui.showTable;
  let h = `<div class="section-title"><button class="btn sm" onclick="ui.showTable=${!open};saveUi();render()">${open ? "▲ اخفي الجدول التفصيلي" : "▼ اعرض الجدول التفصيلي (كل الأيام بالأرقام)"}</button></div>`;
  if (!open) return h;
  if (c.type === "store") return h + storeTable(c, ym, rows);
  return h + matrixLeads(c, ym, rows, platformsInUse(c, rows), deptsInUse(c, rows)).replace(/<div class="section-title"><h3>الماتريكس اليومي<\/h3>/, '<div class="section-title" style="margin-top:0"><h3>الجدول التفصيلي</h3>');
}
function storeTable(c, ym, rows){
  const days = daysOfMonth(ym), tk = todayK(), ad = adRows(rows), P = platformsInUse(c, rows), a = agg(rows);
  let h = `<div class="tscroll"><table class="t"><thead><tr><th>اليوم</th>${P.map((p,i) => `<th class="${i===0?"sep":""}">${pname(p)}</th>`).join("")}<th class="sep">إجمالي الصرف</th><th>الأوردرات</th><th>CPP</th><th>المبيعات</th><th>ROAS</th><th>AOV</th></tr></thead><tbody>`;
  for (const d of days) { if (d > tk) break; const dr = rows.filter(r => r.d === d), x = agg(dr);
    h += `<tr class="click" onclick="openEntry('${c.id}','${d}')"><td>${fromKey(d).getDate()} <span class="tiny muted">${DSHORT[fromKey(d).getDay()]}</span></td>${P.map((p,i) => { const y = agg(ad.filter(r => r.d === d && r.p === p)); return `<td class="${i===0?"sep":""}">${z(y.s)}${y.po ? ` <span class="tiny muted">/ ${fmt(y.po)} أوردر</span>` : ""}</td>`; }).join("")}<td class="sep"><b>${z(x.s)}</b></td><td>${z(x.o)}</td><td>${x.cpp != null ? fmt2(x.cpp) : ""}</td><td>${z(x.sl)}</td><td><b>${x.sl ? fmt2(x.roas) : ""}</b></td><td>${x.aov != null ? fmt(x.aov) : ""}</td></tr>`; }
  return h + `<tr class="total"><td>الإجمالي</td>${P.map((p,i) => `<td class="${i===0?"sep":""}">${fmt(agg(ad.filter(r => r.p === p)).s)}</td>`).join("")}<td class="sep">${fmt(a.s)}</td><td>${fmt(a.o)}</td><td>${fmt2(a.cpp)}</td><td>${fmt(a.sl)}</td><td>${fmt2(a.roas)}</td><td>${fmt(a.aov)}</td></tr></tbody></table></div>`;
}



/* ================= Config ================= */
const SB_URL = "https://apnxxhvjqnqgpryscixg.supabase.co";
const SB_KEY = "sb_publishable_WXafq36LqstgndJfCjh0Gg_y52NhYYr";
const JOBS = ["Media Buyer","Editor","Designer","Motion","UI","SEO","Programming","Social Media","Account Manager"];
let sb = null;

/* ================= State ================= */
let me = null;                // my profile
let profiles = [], clients = [], members = [], tasks = [], ST = {};
const M = {}, Mload = {};
let ui = { tab: "today", date: todayK(), q: "", clientId: null, month: ymOf(todayK()), view: "platform" };
try { Object.assign(ui, JSON.parse(localStorage.getItem("zs-team-ui")||"{}"), { date: todayK() }); } catch(e){}
function saveUi(){ try { localStorage.setItem("zs-team-ui", JSON.stringify({ tab:ui.tab, clientId:ui.clientId, view:ui.view, month:ui.month, metricS:ui.metricS, metricL:ui.metricL, showTable:ui.showTable })); } catch(e){} }
const isAdmin = () => me && me.role === "admin";
const clientById = id => clients.find(c => c.id === id);
const profileById = id => profiles.find(p => p.id === id);
const myMembership = cid => members.find(m => m.client_id === cid && m.user_id === me.id);
const canFiles = cid => isAdmin() || !!(myMembership(cid) || {}).see_files;
const canSeeNumbers = cid => isAdmin() || !!(myMembership(cid) || {}).see_numbers;
const myPlatforms = c => isAdmin() ? plats(c).map(p => p.name) : ((myMembership(c.id) || {}).platforms || []);
function plats(c){ return (c.platforms||[]).map(p => typeof p === "string" ? { name:p, cur:c.currency||"SAR" } : p); }
let LS = {}, LSload = {};
async function loadLeadStats(cid, force){
  if (LSload[cid] && !force) return LSload[cid];
  LSload[cid] = (async () => { try { LS[cid] = await q(sb.from("lead_stats").select("d,tab,p,dep,leads,booked").eq("client_id", cid).order("d"), "ls"); } catch(e){ LS[cid] = []; } render(); })();
  return LSload[cid];
}
function leadStats(c, from, to){
  if (!(c.id in LS)) { LS[c.id] = null; loadLeadStats(c.id); return null; }
  const L = (LS[c.id] || []).filter(r => r.d >= from && r.d <= to);
  if (!L.length) return { n:0, b:0, rows:[], empty:true };
  return { n: L.reduce((a, r) => a + r.leads, 0), b: L.reduce((a, r) => a + r.booked, 0), rows: L };
}
const initials = n => { n = String(n||"?").trim(); const parts = n.split(/\s+/); return (parts.length > 1 ? parts[0][0] + parts[1][0] : n.slice(0,2)); };
function avatar(pid, size){ const p = profileById(pid); const nm = p ? (p.name || p.email) : "؟"; let h = 0; for (const ch of String(pid||"")) h = (h*31 + ch.charCodeAt(0)) >>> 0; const hues = ["var(--accent-soft)","var(--ok-cell)","var(--amb-cell)","var(--bad-cell)","var(--grey-chip)"]; const ink = ["var(--accent)","var(--ok-ink)","var(--amb-ink)","var(--bad-ink)","var(--muted)"]; const i = h % 5; return `<span class="av" title="${esc(nm)}" style="${size?`width:${size}px;height:${size}px;font-size:${Math.round(size*.42)}px;`:""}background:${hues[i]};color:${ink[i]}">${esc(initials(nm))}</span>`; }
const personName = pid => { if (!pid || (me && pid === me.id && isAdmin())) return "انت"; const p = profileById(pid); return p ? (p.name || p.email) : "—"; };
const assigneeOf = t => t.assigneeId || (profiles.find(p => p.role === "admin") || {}).id;
const isMine = t => me && (t.assigneeId === me.id || (!t.assigneeId && isAdmin()));

/* ================= Data ================= */
function mapTask(r){ return { id:r.id, clientId:r.client_id, assigneeId:r.assignee_id, title:r.title, kind:r.kind, repeat:r.repeat, days:r.days||[], every:r.every, monthDay:r.month_day, date:r.date, time:r.time, note:r.note, brief:r.brief, needsReview:r.needs_review, skipFriday:r.skip_friday, paused:r.paused, created:r.created }; }
function taskToDb(t){ return { client_id:t.clientId||null, assignee_id:t.assigneeId||null, title:t.title, kind:t.kind||null, repeat:t.repeat, days:t.days||[], every:t.every||null, month_day:t.monthDay||null, date:t.date||null, time:t.time||null, note:t.note||null, brief:t.brief||null, needs_review:!!t.needsReview, skip_friday:!!t.skipFriday, paused:!!t.paused }; }
function mapMetric(r){ return { id:r.id, d:r.d, p:r.p, dep:r.dep||"", s:+r.s||0, ca:+r.ca||0, ms:+r.ms||0, ld:+r.ld||0, in:+r.ins||0, bk:+r.bk||0, bv:+r.bv||0, o:+r.o||0, sl:+r.sl||0, by:r.entered_by, reviewed:r.reviewed }; }
async function q(promise, label){ const { data, error } = await promise; if (error) { console.error(label, error); throw error; } return data; }
async function loadAll(){
  const since = addDaysK(todayK(), -120);
  const [p, c, m, t, s] = await Promise.all([
    q(sb.from("profiles").select("*").order("created_at"), "profiles"),
    q(sb.from("clients").select("*").order("name"), "clients"),
    q(sb.from("client_members").select("*"), "members"),
    q(sb.from("tasks").select("*"), "tasks"),
    q(sb.from("task_status").select("*").gte("day", since), "status"),
  ]);
  c.forEach(x => { x.leadSheet = x.lead_sheet && x.lead_sheet.url ? x.lead_sheet : null; });
  profiles = p; clients = c; members = m; tasks = t.map(mapTask);
  ST = {}; for (const r of s) ST[r.task_id + "|" + r.day] = r;
  me = profiles.find(x => x.id === me.id) || me;
}
async function loadMetrics(cid, force){
  if (!canSeeNumbers(cid) && !isAdmin()) { const c = clientById(cid); if (!c || !myPlatforms(c).length) return; }
  if (Mload[cid] && !force) return Mload[cid];
  Mload[cid] = (async () => { try { const rows = await q(sb.from("metrics").select("*").eq("client_id", cid).order("d"), "metrics"); M[cid] = rows.map(mapMetric); } catch(e){ M[cid] = M[cid] || []; } render(); })();
  return Mload[cid];
}

/* ================= Task status ================= */
const stOf = (t, dk) => ST[t.id + "|" + dk];
function stateOf(t, dk){ const s = stOf(t, dk); return s ? s.state : null; }
const isDone = (id, dk) => { const s = ST[id + "|" + dk]; return !!s && (s.state === "done" || s.state === "approved" || s.state === "submitted"); };
const isClosed = (t, dk) => { const s = stateOf(t, dk); return s === "done" || s === "approved"; };
async function toggleDone(id, dk, reopenCid){
  const t = tasks.find(x => x.id === id); if (!t) return;
  const key = id + "|" + dk, cur = ST[key];
  try {
    if (cur && (cur.state === "done" || cur.state === "approved")) { await q(sb.from("task_status").delete().eq("task_id", id).eq("day", dk), "undone"); delete ST[key]; }
    else { const row = { task_id:id, day:dk, state:"done", by_user:me.id, updated_at:new Date().toISOString() }; await q(sb.from("task_status").upsert(row), "done"); ST[key] = row; }
  } catch(e){ toast("ماتحفظش، جرب تاني"); }
  render(); if (reopenCid) openDayCard(reopenCid);
}
async function setDone(id, dk, val){
  const key = id + "|" + dk;
  if (val) { const row = { task_id:id, day:dk, state:"done", by_user:me.id, updated_at:new Date().toISOString() }; ST[key] = row; try { await sb.from("task_status").upsert(row); } catch(e){} }
  else { delete ST[key]; try { await sb.from("task_status").delete().eq("task_id", id).eq("day", dk); } catch(e){} }
}
function overdueOnce(tk){ return tasks.filter(t => t.repeat === "once" && !t.paused && t.date && t.date < tk && !isClosed(t, t.date) && (!t.clientId || clientById(t.clientId)?.status !== "paused")); }
const visibleTasks = () => isAdmin() ? tasks : tasks.filter(t => t.assigneeId === me.id);

/* ================= Alerts ================= */
function clientAlerts(c){
  const out = []; if (c.status === "paused" || !M[c.id] || !canSeeNumbers(c.id)) return out;
  const t = todayK(), y = addDaysK(t,-1), f3 = addDaysK(t,-3), tg = c.targets || {};
  const rows = M[c.id].filter(r => r.d >= f3 && r.d <= y), a = agg(rows);
  if (a.s > 0) {
    if (c.type === "leads" && tg.cpl && a.cpl != null && a.cpl > tg.cpl) out.push(`تكلفة التحويل آخر 3 أيام <b class="num">${fmt2(a.cpl)}</b> أعلى من التارجت ${fmt2(tg.cpl)}`);
    if (c.type === "leads" && a.conv === 0) out.push(`صرف <b class="num">${fmt(a.s)}</b> آخر 3 أيام من غير ولا تحويل`);
    if (c.type === "store" && tg.minRoas && a.roas != null && a.sl && a.roas < tg.minRoas) out.push(`الـ ROAS آخر 3 أيام <b class="num">${fmt2(a.roas)}</b> أقل من التارجت ${fmt2(tg.minRoas)}`);
    if (c.type === "store" && tg.maxCpp && a.cpp != null && a.cpp > tg.maxCpp) out.push(`الـ CPP آخر 3 أيام <b class="num">${fmt2(a.cpp)}</b> أعلى من التارجت ${fmt2(tg.maxCpp)}`);
  }
  if (M[c.id].length && !M[c.id].some(r => r.d === y)) out.push(`مسجلتش أرقام امبارح (${fmtShort(y)})`);
  return out;
}
function quickKpi(c){
  if (!M[c.id] || !canSeeNumbers(c.id)) return ""; const y = addDaysK(todayK(),-1), a = agg(M[c.id].filter(r => r.d === y)); if (!a.s && !a.sl) return "";
  return `<span class="chip grey" title="أرقام امبارح">امبارح: صرف ${fmt(a.s)} · ${c.type === "store" ? `ROAS ${fmt2(a.roas)}` : `CPA ${fmt2(a.cpl)}`}</span>`;
}

/* ================= Render / nav ================= */
const ICONS = {
  today:'<path d="M4 6h16M4 12h10M4 18h7"/><circle cx="18" cy="17" r="3"/>',
  clients:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M8 14h3"/>',
  review:'<path d="M5 12l4 4L19 6"/>',
  settings:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>'
};
const ico = k => `<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[k]}</svg>`;
const SHELL2 = `<div class="shell"><aside class="side">
  <div class="brand"><svg width="26" height="26" viewBox="0 0 48 48" aria-hidden="true"><rect class="zm-ink" x="0" y="28" width="12" height="20" rx="2"/><rect class="zm-brand" x="18" y="16" width="12" height="32" rx="2"/><rect class="zm-signal" x="36" y="0" width="12" height="12" rx="2"/><rect class="zm-brand" x="36" y="15" width="12" height="33" rx="2"/></svg><div><div class="nm">زياد إبراهيم</div><div class="sub">Work System</div></div></div>
  <nav class="snav" id="tabs"></nav>
  <div class="side-foot" id="who"></div>
</aside><main class="main" id="view"><div class="card empty">بيحمّل…</div></main></div>`;
const pageHead = (title, sub, actions) => `<div class="ph"><div><h1>${title}</h1>${sub ? `<div class="ph-sub">${sub}</div>` : ""}</div><span class="spacer"></span>${actions || ""}</div>`;
function render(){
  if (!me) return;
  if (ui.tab === "team") { ui.tab = "settings"; ui.stab = "team"; }
  if (!isAdmin() && ui.tab === "review") ui.tab = "today";
  const pending = isAdmin() ? reviewCount() : 0;
  const tabs = isAdmin() ? [["today","Today"],["clients","Clients"],["review","Review"],["settings","Settings"]] : [["today","My Tasks"],["clients","Clients"],["settings","Settings"]];
  const cur = ui.tab === "client" ? "clients" : ui.tab;
  const act = clients.filter(c => c.status !== "paused").sort((a,b) => (a.is_test - b.is_test) || a.name.localeCompare(b.name, "ar"));
  $("#tabs").innerHTML = tabs.map(([k,l]) => `<button data-tab="${k}" class="${cur === k ? "active" : ""}">${ico(k === "today" ? "today" : k)}<span>${l}</span>${k === "review" && pending ? `<span class="nb">${pending}</span>` : ""}</button>` +
    (k === "clients" && act.length ? `<div class="snav-sub">${act.map(c => `<a href="#" class="${ui.tab === "client" && ui.clientId === c.id ? "on" : ""}" onclick="go('client','${c.id}');return false">${c.logo_url ? clientLogo(c, 18) : `<span class="cdot ${c.type}"></span>`}${esc(c.name)}</a>`).join("")}</div>` : "")).join("");
  $("#who").innerHTML = `<button class="whob" onclick="go('settings');ui.stab='account';render()">${avatar(me.id, 30)}<span><b>${esc(me.name || me.email)}</b><span class="tiny muted">${isAdmin() ? "Admin" : esc(me.job || "Team")}</span></span></button>`;
  const v = $("#view");
  if (ui.tab === "client") v.innerHTML = viewClient();
  else if (ui.tab === "clients") v.innerHTML = viewClients();
  else if (ui.tab === "review") v.innerHTML = viewReview();
  else if (ui.tab === "settings") v.innerHTML = viewSettings();
  else v.innerHTML = viewToday();
}
function go(tab, cid){ ui.tab = tab; if (cid) { ui.clientId = cid; ui.month = ymOf(addDaysK(todayK(), -1)); ui.selDay = null; loadMetrics(cid); } saveUi(); render(); window.scrollTo(0,0); }
document.addEventListener("click", e => { const b = e.target.closest("#tabs button"); if (b) go(b.dataset.tab); });

/* ================= Today ================= */
function viewToday(){
  if (!isAdmin()) return viewMyTasks();
  const tk = todayK(), dk = ui.date, d = fromKey(dk), VT = visibleTasks();
  const due = VT.filter(t => isDueOn(t, dk));
  const overdue = dk === tk ? overdueOnce(tk).filter(t => VT.includes(t)) : [];
  const doneN = due.filter(t => isDone(t.id, dk)).length, pct = due.length ? Math.round(doneN/due.length*100) : 0;
  const groups = new Map(); for (const t of due) { const k = t.clientId || "_"; if (!groups.has(k)) groups.set(k, []); groups.get(k).push(t); }
  for (const t of overdue) { const k = t.clientId || "_"; if (!groups.has(k)) groups.set(k, []); }
  const rel = dk === tk ? "النهارده" : dk === addDaysK(tk,1) ? "بكرة" : dk === addDaysK(tk,-1) ? "امبارح" : "";
  const returned = !isAdmin() ? VT.filter(t => Object.values(ST).some(s => s.task_id === t.id && s.state === "returned")) : [];
  let h = pageHead(isAdmin() ? "Today" : "My Tasks", isAdmin() ? "مهام النهارده لكل العملاء والفريق" : "التاسكات المسنودة عليك") + `<div class="daybar">
    <button class="btn sm" onclick="ui.date=addDaysK(ui.date,1);render()" aria-label="اليوم اللي بعده">›</button>
    <div class="date">${rel ? rel + " — " : ""}${fmtDate(d)}</div>
    <button class="btn sm" onclick="ui.date=addDaysK(ui.date,-1);render()" aria-label="اليوم اللي قبله">‹</button>
    ${dk !== tk ? `<button class="btn sm" onclick="ui.date=todayK();render()">ارجع للنهارده</button>` : ""}
    <span class="spacer"></span>${isAdmin() ? `<button class="btn primary sm" onclick="openTask(null,{date:'${dk}',repeat:'once'})">+ مهمة</button>` : ""}</div>
  <div class="strip"><span class="st-prog"><b class="num">${doneN}</b><span class="muted">/${due.length}</span> خلصت<span class="st-bar"><i style="width:${pct}%"></i></span></span>
    ${reviewCount() ? `<a href="#" class="st-chip amb" onclick="go('review');return false">${reviewCount()} مستني مراجعتك ←</a>` : ""}
    ${overdue.length ? `<span class="st-chip bad">${overdue.length} متأخرة</span>` : ""}</div>`;
  if (returned.length) h += `<div class="remind" style="border-inline-start-color:var(--danger)"><span class="rm-ic">↩︎</span><div><div class="rm-t">زياد رجّعلك ${returned.length} ${returned.length === 1 ? "تاسك" : "تاسكات"} للتعديل</div><div class="small">${returned.map(t => `<a href="#" onclick="openSubmit('${t.id}','${returnedDay(t)}');return false">${esc(t.title)}</a>`).join("، ")}</div></div></div>`;
  if (!clients.length && isAdmin()) return h + `<div class="card empty">مفيش عملاء لسه. روح على Clients وضيف أول عميل.</div>`;
  if (!groups.size) return h + `<div class="card empty">${isAdmin() ? "مفيش مهام في اليوم ده 🎉" : "مفيش تاسكات عليك في اليوم ده 🎉"}</div>`;
  for (const [kind, label, per] of [["monthlyReport","الريبورت الشهري", `عن ${monthLabel(ymAdd(ymOf(dk),-1))}`],["weeklyReport","الريبورت الأسبوعي","عن الأسبوع ده"]]) {
    const ts = due.filter(t => t.kind === kind), pend = ts.filter(t => !isDone(t.id, dk)); if (!ts.length) continue;
    const names = pend.map(t => { const c = clientById(t.clientId); return c ? `<a href="#" onclick="openDayCard('${c.id}');return false">${esc(c.name)}</a>` : "عام"; });
    h += pend.length ? `<div class="remind"><span class="rm-ic">📄</span><div><div class="rm-t">النهارده يوم ${label} <span class="muted small">${per}</span></div><div class="small">لسه لازم يتعمل لـ ${pend.length} ${pend.length === 1 ? "عميل" : "عملاء"}: ${names.join("، ")}</div></div></div>`
      : `<div class="remind ok"><span class="rm-ic">✓</span><div><div class="rm-t">${label} خلص لكل العملاء</div></div></div>`;
  }
  const info = [...groups.entries()].map(([cid, ts]) => {
    const c = cid === "_" ? null : clientById(cid), od = overdue.filter(t => (t.clientId || "_") === cid);
    const dn = ts.filter(t => isDone(t.id, dk)).length, pending = ts.filter(t => !isDone(t.id, dk));
    const waiting = ts.filter(t => stateOf(t, dk) === "submitted").length;
    const al = c && dk === tk ? clientAlerts(c) : [];
    const team = [...new Set(ts.map(t => t.assigneeId).filter(x => x && x !== me.id))];
    return { cid, c, ts, od, dn, pending, waiting, al, team, all: !pending.length && !od.length };
  }).sort((a,b) => { if (a.cid === "_") return 1; if (b.cid === "_") return -1; if (a.all !== b.all) return a.all ? 1 : -1; const rk = y => y.pending.filter(t => /Report$/.test(t.kind||"")).length + y.od.length + y.al.length + y.waiting; if (rk(a) !== rk(b)) return rk(b) - rk(a); return (a.c?.name||"").localeCompare(b.c?.name||"","ar"); });
  h += `<div class="tgrid">${info.map(x => {
    const total = x.ts.length, p = total ? Math.round(x.dn/total*100) : 100, next = x.od[0] || x.pending[0];
    return `<button class="tcard${x.all ? " done" : ""}" onclick="openDayCard('${x.cid}')">
      <div class="tc-top">${x.c ? clientLogo(x.c, 28) : ""}<span class="tc-name">${x.c ? esc(x.c.name) : "مهام عامة"}</span>${x.c ? `<span class="chip grey">${x.c.type === "store" ? "متجر" : "ليدز"}</span>` : ""}<span class="spacer"></span>
        ${x.all ? `<span class="chip ok">خلص ✓</span>` : `<span class="tc-count num">${x.dn}<span class="muted">/${total}</span></span>`}</div>
      <div class="tc-bar"><i style="width:${p}%"></i></div>
      <div class="row" style="gap:4px">${x.c ? `<span class="tc-plats">${plats(x.c).map(pp => badge(pp.name)).join("")}</span>` : ""}<span class="spacer"></span>${x.team.map(pid => avatar(pid, 22)).join("")}</div>
      ${x.c && quickKpi(x.c) ? `<div class="tc-kpi">${quickKpi(x.c)}</div>` : ""}
      ${x.c && bestYesterday(x.c) && bestYesterday(x.c).best ? `<div class="tc-best">🏆 <b>${esc(bestYesterday(x.c).best.name)}</b> أرخص منصة امبارح · ${bestYesterday(x.c).R.unit} <span class="num">${fmt2(bestYesterday(x.c).best.cost)}</span></div>` : ""}
      <div class="tc-flags">${x.pending.some(t => t.kind === "monthlyReport") ? `<span class="chip rp">📄 الريبورت الشهري</span>` : ""}${x.pending.some(t => t.kind === "weeklyReport") ? `<span class="chip rp">📄 الريبورت الأسبوعي</span>` : ""}${x.waiting ? `<span class="chip amb">${isAdmin() ? `${x.waiting} مستني مراجعتك` : `${x.waiting} عند زياد للمراجعة`}</span>` : ""}${x.od.length ? `<span class="chip warn">${x.od.length} متأخرة</span>` : ""}${x.al.length ? `<span class="chip warn">⚠️ ${x.al.length} تنبيه</span>` : ""}</div>
      <div class="tc-next">${next ? `<span class="muted">الجاي:</span> ${esc(next.title)}${isAdmin() && next.assigneeId && next.assigneeId !== me.id ? ` <span class="muted">· ${esc(personName(next.assigneeId))}</span>` : ""}` : `<span class="muted">مفيش حاجة فاضلة</span>`}</div>
    </button>`;
  }).join("")}</div>`;
  return h;
}
function returnedDay(t){ const s = Object.values(ST).find(s => s.task_id === t.id && s.state === "returned"); return s ? s.day : todayK(); }
function taskRow(t, dk, cid){
  const st = stOf(t, dk), state = st ? st.state : null, mine = isMine(t), c = t.clientId ? clientById(t.clientId) : null;
  const closed = state === "done" || state === "approved";
  let action = "", stateChip = "";
  if (state === "submitted") stateChip = `<span class="chip amb">${isAdmin() ? "مستني مراجعتك" : "اتسلّم · مستني المراجعة"}</span>`;
  if (state === "approved") stateChip = `<span class="chip ok">اتوافق عليه ✓</span>`;
  if (state === "returned") stateChip = `<span class="chip warn">اترجع للتعديل</span>`;
  if (mine && t.kind === "metrics" && c) action = `<button class="btn xs primary" onclick="openEntry('${c.id}','${addDaysK(dk,-1)}','${t.id}','${dk}')">✍️ سجّل الأرقام</button>`;
  if (mine && t.kind === "meeting" && c && isAdmin()) action = `<button class="btn xs primary" onclick="openMeeting('${c.id}','${t.id}','${dk}')">📅 حدد الميعاد</button>`;
  if (mine && t.needsReview && !isAdmin() && !closed && state !== "submitted") action = `<button class="btn xs primary" onclick="openSubmit('${t.id}','${dk}')">${state === "returned" ? "سلّم تاني" : "سلّم"}</button>`;
  if (isAdmin() && state === "submitted") action = `<button class="btn xs primary" onclick="openReviewItem('${t.id}','${dk}')">راجع</button>`;
  const canTick = mine && !(t.needsReview && !isAdmin());
  const box = canTick ? `<input type="checkbox" ${closed ? "checked" : ""} onchange="toggleDone('${t.id}','${dk}'${cid ? `,'${cid}'` : ""})" aria-label="خلصت">` : `<span class="tbox ${closed ? "on" : state === "submitted" ? "half" : ""}"></span>`;
  return `<div class="task ${closed ? "done" : ""}">${box}
    <div class="t"><div class="title">${esc(t.title)} ${stateChip}</div>
      <div class="meta">${isAdmin() && t.assigneeId && t.assigneeId !== me.id ? `${avatar(t.assigneeId, 16)} ${esc(personName(t.assigneeId))} · ` : ""}${t.time ? esc(t.time) + " · " : ""}${esc(repeatText(t))}${t.note ? " · " + esc(t.note) : ""}</div>
      ${t.brief ? `<div class="brief">${esc(t.brief)}</div>` : ""}
      ${state === "returned" && st.review_note ? `<div class="brief bad">↩︎ ${esc(st.review_note)}</div>` : ""}</div>
    ${action}${isAdmin() ? `<button class="btn ghost sm" onclick="openTask('${t.id}')">تعديل</button>` : ""}</div>`;
}
function openDayCard(cid){
  const dk = ui.date, tk = todayK(), c = cid === "_" ? null : clientById(cid), VT = visibleTasks();
  const ts = VT.filter(t => isDueOn(t, dk) && (t.clientId || "_") === cid);
  const od = dk === tk ? overdueOnce(tk).filter(t => VT.includes(t) && (t.clientId || "_") === cid) : [];
  const al = c && dk === tk ? clientAlerts(c) : [];
  const dn = ts.filter(t => isDone(t.id, dk)).length;
  const mineFirst = list => list.slice().sort((a,b) => (isMine(b) - isMine(a)));
  openModal(`<div class="row" style="margin-bottom:4px"><h2 style="margin:0">${c ? esc(c.name) : "مهام عامة"}</h2>${c ? `<span class="chip grey">${c.type === "store" ? "متجر" : "ليدز"}</span>` : ""}<span class="spacer"></span><span class="num small muted">${dn}/${ts.length}</span></div>
    <div class="small muted" style="margin-bottom:10px">${fmtDate(fromKey(dk))}</div>
    ${c ? fileChips(c) : ""}
    ${al.map(a => `<div class="alert">⚠️ ${a}</div>`).join("")}
    ${c && bestYesterday(c) ? adviceBox(c, [{ label:"امبارح", adv: bestYesterday(c) }]) : ""}
    ${od.length ? `<div class="small" style="color:var(--danger);font-weight:700;margin:8px 0 2px">متأخرة من أيام فاتت</div>${od.map(t => taskRow(t, t.date, cid)).join("")}` : ""}
    ${ts.length ? `<div class="small muted" style="font-weight:700;margin:10px 0 2px">مهام اليوم</div>${mineFirst(ts).map(t => taskRow(t, dk, cid)).join("")}` : ""}
    <div class="actions">${c && isAdmin() ? `<button class="btn sm" onclick="openDataReceived('${c.id}')">📥 العميل بعت داتا</button>` : ""}${c ? `<button class="btn sm" onclick="closeModal();go('client','${c.id}')">صفحة العميل ←</button>` : ""}${isAdmin() ? `<button class="btn sm" onclick="openTask(null,{date:'${dk}',repeat:'once'${c ? `,clientId:'${c.id}'` : ""}})">+ مهمة</button>` : ""}<span class="spacer"></span><button class="btn" onclick="closeModal()">قفل</button></div>`);
}

/* ================= Submit (member) ================= */
let SUB = {};
function openSubmit(tid, dk){
  const t = tasks.find(x => x.id === tid); if (!t) return; const c = clientById(t.clientId), st = stOf(t, dk);
  SUB = { tid, dk, file: null };
  openModal(`<h2>تسليم: ${esc(t.title)}</h2><div class="small muted" style="margin:-6px 0 10px">${c ? esc(c.name) + " · " : ""}${fmtDate(fromKey(dk))}</div>
    ${t.brief ? `<div class="brief" style="margin-bottom:10px"><b>البريف:</b> ${esc(t.brief)}</div>` : ""}
    ${st && st.state === "returned" && st.review_note ? `<div class="brief bad" style="margin-bottom:10px">↩︎ تعليق زياد: ${esc(st.review_note)}</div>` : ""}
    <label class="f">لينك (درايف، فيديو، تصميم…)</label><input class="inp" id="sbLink" dir="ltr" placeholder="https://" value="${esc(st && st.link || "")}">
    <label class="f">أو ارفع ملف (لحد 50 ميجا)</label><input type="file" id="sbFile" class="inp" onchange="SUB.file=this.files[0]||null">
    ${st && st.file_name ? `<div class="tiny muted" style="margin-top:4px">الملف اللي اتسلّم قبل كده: ${esc(st.file_name)}</div>` : ""}
    <label class="f">ملاحظة لزياد (اختياري)</label><textarea class="inp" id="sbNote">${esc(st && st.state !== "returned" ? st.note || "" : "")}</textarea>
    <div id="sbErr" class="small" style="color:var(--danger);margin-top:6px"></div>
    <div class="actions"><span class="spacer"></span><button class="btn" onclick="closeModal()">إلغاء</button><button class="btn primary" id="sbBtn" onclick="doSubmit()">ابعت لزياد</button></div>`);
}
async function doSubmit(){
  const link = $("#sbLink").value.trim(), note = $("#sbNote").value.trim(), f = SUB.file;
  if (!link && !f && !note) { $("#sbErr").textContent = "حط لينك أو ملف أو ملاحظة على الأقل"; return; }
  if (f && f.size > 50*1024*1024) { $("#sbErr").textContent = "الملف أكبر من 50 ميجا. ارفعه على الدرايف وحط اللينك."; return; }
  $("#sbBtn").disabled = true; $("#sbBtn").textContent = f ? "⏳ بيرفع الملف…" : "⏳ بيبعت…";
  try {
    const prev = ST[SUB.tid + "|" + SUB.dk];
    let file_path = prev && prev.file_path || null, file_name = prev && prev.file_name || null;
    if (f) {
      const safe = f.name.replace(/[^\w.\-]+/g, "_").slice(-80);
      file_path = `${me.id}/${SUB.tid}/${Date.now()}_${safe}`; file_name = f.name;
      const { error } = await sb.storage.from("deliveries").upload(file_path, f, { upsert: false, contentType: f.type || undefined });
      if (error) throw error;
    }
    const row = { task_id: SUB.tid, day: SUB.dk, state: "submitted", by_user: me.id, link: link || null, note: note || null, file_path, file_name, review_note: null, updated_at: new Date().toISOString() };
    await q(sb.from("task_status").upsert(row), "submit"); ST[SUB.tid + "|" + SUB.dk] = row;
    closeModal(); render(); toast("اتسلّم ✓ — زياد هيشوفه في المراجعة");
  } catch(e){ $("#sbErr").textContent = "ماتبعتش: " + (e.message || e); $("#sbBtn").disabled = false; $("#sbBtn").textContent = "ابعت لزياد"; }
}

/* ================= Review (admin) ================= */
function pendingSubs(){ return Object.values(ST).filter(s => s.state === "submitted").map(s => ({ s, t: tasks.find(x => x.id === s.task_id) })).filter(x => x.t).sort((a,b) => (b.s.updated_at||"").localeCompare(a.s.updated_at||"")); }
let unreviewed = [];
async function loadUnreviewed(){ if (!isAdmin()) return; try { const rows = await q(sb.from("metrics").select("client_id,d,p,dep,s,ca,ms,ld,ins,o,entered_by").eq("reviewed", false).order("d", { ascending:false }).limit(500), "unrev"); unreviewed = rows; } catch(e){ unreviewed = []; } render(); }
function unreviewedGroups(){ const g = new Map(); for (const r of unreviewed) { const k = r.client_id + "|" + r.d + "|" + r.entered_by; if (!g.has(k)) g.set(k, { cid:r.client_id, d:r.d, by:r.entered_by, rows:[] }); g.get(k).rows.push(r); } return [...g.values()]; }
const reviewCount = () => pendingSubs().length + unreviewedGroups().length;
function viewReview(){
  const subs = pendingSubs(), mg = unreviewedGroups();
  let h = pageHead("Review", "التسليمات والأرقام اللي مستنية رأيك", `<button class="btn sm" onclick="refreshAll()">↻ تحديث</button>`);
  if (!subs.length && !mg.length) return h + `<div class="card empty">مفيش حاجة مستنية مراجعتك ✓</div>`;
  if (subs.length) h += `<div class="section-title" style="margin-top:0"><h3>تسليمات (${subs.length})</h3></div>` + subs.map(({ s, t }) => { const c = clientById(t.clientId); return `<div class="card rv">
      <div class="row">${avatar(s.by_user, 30)}<div style="flex:1;min-width:0"><div><b>${esc(personName(s.by_user))}</b> سلّم <b>${esc(t.title)}</b>${c ? ` · ${esc(c.name)}` : ""}</div><div class="tiny muted">${fmtDate(fromKey(s.day))} · ${s.updated_at ? timeAgo(s.updated_at) : ""}</div></div></div>
      ${s.note ? `<div class="brief" style="margin-top:8px">${esc(s.note)}</div>` : ""}
      <div class="row" style="margin-top:10px">${s.link ? `<a class="link" href="${esc(normUrl(s.link))}" target="_blank" rel="noopener">🔗 افتح اللينك</a>` : ""}${s.file_path ? `<button class="btn xs" onclick="openFile('${esc(s.file_path)}')">📎 ${esc(s.file_name || "الملف")}</button>` : ""}<span class="spacer"></span>
        <button class="btn sm danger" onclick="openReturn('${t.id}','${s.day}')">↩︎ رجّع بتعليق</button><button class="btn sm primary" onclick="approve('${t.id}','${s.day}')">✓ موافق</button></div></div>`; }).join("");
  if (mg.length) h += `<div class="section-title"><h3>أرقام سجّلها الفريق (${mg.length})</h3></div>` + mg.map(g => { const c = clientById(g.cid); const a = agg(g.rows.map(r => ({ ...r, in: r.ins }))); return `<div class="card rv"><div class="row">${avatar(g.by, 30)}<div style="flex:1"><div><b>${esc(personName(g.by))}</b> سجّل أرقام <b>${[...new Set(g.rows.map(r => r.p))].map(esc).join(" و ")}</b>${c ? ` · ${esc(c.name)}` : ""}</div><div class="tiny muted">${fmtDate(fromKey(g.d))} · صرف <span class="num">${fmt(a.s)}</span>${a.conv ? ` · ${fmt(a.conv)} تحويل · CPA <span class="num">${fmt2(a.cpl)}</span>` : ""}${a.o ? ` · ${fmt(a.o)} أوردر` : ""}</div></div>
      <button class="btn sm" onclick="closeModal();go('client','${g.cid}')">افتح</button><button class="btn sm primary" onclick="markReviewed('${g.cid}','${g.d}','${g.by}')">✓ تمام</button></div></div>`; }).join("");
  return h;
}
function timeAgo(iso){ const m = Math.round((Date.now() - new Date(iso)) / 60000); if (m < 1) return "دلوقتي"; if (m < 60) return `من ${m} دقيقة`; const hh = Math.round(m/60); if (hh < 24) return `من ${hh} ساعة`; return `من ${Math.round(hh/24)} يوم`; }
async function openFile(path){ try { const { data, error } = await sb.storage.from("deliveries").createSignedUrl(path, 3600); if (error) throw error; window.open(data.signedUrl, "_blank", "noopener"); } catch(e){ toast("مقدرش يفتح الملف"); } }
function openReviewItem(tid, dk){ go("review"); closeModal(); }
async function approve(tid, dk){ const key = tid + "|" + dk; try { await q(sb.from("task_status").update({ state:"approved", updated_at:new Date().toISOString() }).eq("task_id", tid).eq("day", dk), "approve"); ST[key] = { ...ST[key], state:"approved" }; toast("اتوافق عليه ✓ — اتحفظ في Deliveries بتاعة العميل"); DELIV = {}; } catch(e){ toast("ماتحفظش"); } render(); }
function openReturn(tid, dk){ const t = tasks.find(x => x.id === tid);
  openModal(`<h2>رجّع "${esc(t.title)}"</h2><label class="f">التعليق اللي هيوصله</label><textarea class="inp" id="rtNote" autofocus placeholder="مثلاً: خلّي الخط أكبر والسعر واضح"></textarea>
    <div class="actions"><span class="spacer"></span><button class="btn" onclick="closeModal()">إلغاء</button><button class="btn primary" onclick="doReturn('${tid}','${dk}')">رجّعه</button></div>`); }
async function doReturn(tid, dk){ const note = $("#rtNote").value.trim(); if (!note) { toast("اكتب التعليق"); return; } const key = tid + "|" + dk;
  try { await q(sb.from("task_status").update({ state:"returned", review_note:note, updated_at:new Date().toISOString() }).eq("task_id", tid).eq("day", dk), "return"); ST[key] = { ...ST[key], state:"returned", review_note:note }; closeModal(); toast("اترجع ✓"); } catch(e){ toast("ماتحفظش"); } render(); }
async function markReviewed(cid, d, by){ try { await q(sb.from("metrics").update({ reviewed:true }).eq("client_id", cid).eq("d", d).eq("entered_by", by), "rev"); unreviewed = unreviewed.filter(r => !(r.client_id === cid && r.d === d && r.entered_by === by)); toast("تمام ✓"); } catch(e){ toast("ماتحفظش"); } render(); }

/* ================= Team (admin) ================= */
function viewTeam(){
  const team = profiles.filter(p => p.id !== me.id);
  let h = `<div class="row" style="margin-bottom:12px"><h2>الفريق والصلاحيات</h2><span class="small muted">${team.length} من 6</span><span class="spacer"></span><button class="btn primary sm" onclick="openInvite()">+ ضيف عضو</button></div>`;
  if (!team.length) return h + `<div class="card empty">لسه مفيش حد في الفريق. دوس "ضيف عضو"، واعمله يوزر وباسورد تبعتهمله.</div>`;
  h += `<p class="small muted" style="margin:-4px 0 12px">تحت كل واحد: هو شغال على أنهي عملاء، وبيعمل إيه ويشوف إيه في كل عميل. أي علامة تغيّرها بتتحفظ على طول.</p>`;
  h += `<div class="card" style="padding:4px 16px">${team.map(p => { const cs = members.filter(m => m.user_id === p.id); return `<div class="tm-block"><div class="trow" style="border:0">${avatar(p.id, 34)}<div style="flex:1;min-width:0"><div><b>${esc(p.name || p.email)}</b> <span class="chip grey">${esc(p.job || "—")}</span>${!p.active ? ` <span class="chip warn">متوقف</span>` : ""}</div>
      <div class="tiny muted" dir="ltr">${esc(p.email || "")}</div>
      </div><button class="btn sm primary" onclick="openTask(null,{assigneeId:'${p.id}'})">+ تاسك ليه</button><button class="btn sm" onclick="openMember('${p.id}')">✏️ الاسم والعملاء والباسورد</button></div>
      <div class="perm-list">${cs.length ? cs.map(m => { const c = clientById(m.client_id); return c ? permRow(m, c, "client") : ""; }).join("") : `<div class="small muted" style="padding:6px 0 12px">مش مسنود على أي عميل. دوس «الاسم والعملاء» واختارله عملاء.</div>`}</div>`; }).join("")}</div>`;

  return h;
}
function genPass(){ const a = "abcdefghjkmnpqrstuvwxyz", A = "ABCDEFGHJKLMNPQRSTUVWXYZ", d = "23456789"; const pick = (set, n) => Array.from(crypto.getRandomValues(new Uint32Array(n)), x => set[x % set.length]).join(""); return pick(A,1) + pick(a,4) + pick(d,3); }
function openInvite(){
  openModal(`<h2>ضيف عضو للفريق</h2><p class="small muted">هتعمله يوزر وباسورد، وتبعتهمله على الواتساب. يقدر يغيّر الباسورد بعد ما يدخل.</p>
    <div class="two"><div><label class="f">الاسم</label><input class="inp" id="ivName" autofocus placeholder="أحمد محمد"></div>
      <div><label class="f">الشغلانة</label><select class="inp" id="ivJob">${JOBS.map(j => `<option>${j}</option>`).join("")}</select></div>
      <div><label class="f">اليوزر (حروف إنجليزي وأرقام)</label><input class="inp" id="ivUser" dir="ltr" placeholder="ahmed" autocomplete="off"></div>
      <div><label class="f">الباسورد</label><div class="row" style="gap:6px;flex-wrap:nowrap"><input class="inp" id="ivPass" dir="ltr" value="${genPass()}" autocomplete="off"><button class="btn sm" type="button" onclick="$('#ivPass').value=genPass()" title="باسورد جديد">↻</button></div></div></div>
    <div id="ivErr" class="small" style="color:var(--danger);margin-top:6px"></div>
    <div class="actions"><span class="spacer"></span><button class="btn" onclick="closeModal()">إلغاء</button><button class="btn primary" id="ivBtn" onclick="doInvite()">اعمل الحساب</button></div>`);
}
async function callInvite(body){ const { data, error } = await sb.functions.invoke("invite-member", { body }); if (error) { let msg = error.message; try { const j = await error.context.json(); msg = j.error || msg; } catch(_){} throw new Error(msg); } if (data && data.error) throw new Error(data.error); return data; }
const ERR_AR = { username_taken:"اليوزر ده مستخدم قبل كده، اختار غيره", bad_username:"اليوزر لازم 3 حروف على الأقل، إنجليزي وأرقام بس من غير مسافات", short_password:"الباسورد لازم 8 حروف على الأقل", not_admin:"الحساب ده مش أدمن" };
async function doInvite(){
  const name = $("#ivName").value.trim(), username = $("#ivUser").value.trim().toLowerCase(), password = $("#ivPass").value.trim(), job = $("#ivJob").value;
  if (!name) { $("#ivErr").textContent = "اكتب الاسم"; return; }
  if (!/^[a-z0-9._-]{3,40}$/.test(username)) { $("#ivErr").textContent = ERR_AR.bad_username; return; }
  if (password.length < 8) { $("#ivErr").textContent = ERR_AR.short_password; return; }
  if (profiles.length >= 7) { $("#ivErr").textContent = "الفريق وصل 6 أعضاء"; return; }
  $("#ivBtn").disabled = true; $("#ivBtn").textContent = "⏳ بيعمل الحساب…";
  try { const r = await callInvite({ action:"create", username, password, name, job }); await loadAll(); render(); showCreds(name, username, password, r && r.id); }
  catch(e){ $("#ivErr").textContent = ERR_AR[e.message] || ("ماتعملش: " + e.message); $("#ivBtn").disabled = false; $("#ivBtn").textContent = "اعمل الحساب"; }
}
function credsText(name, username, password){ return `أهلاً ${name} 👋\nده حسابك على سيستم الشغل:\n\nاللينك: ${location.origin + location.pathname}\nاليوزر: ${username}\nالباسورد: ${password}\n\nتقدر تغيّر الباسورد من علامة ⚙︎ فوق بعد ما تدخل.`; }
function showCreds(name, username, password, pid){
  const txt = credsText(name, username, password);
  openModal(`<h2>الحساب جاهز ✓</h2><p class="small muted">ابعت الرسالة دي لـ ${esc(name)} على الواتساب. الباسورد مش هيظهر تاني، فانسخه دلوقتي.</p>
    <textarea class="inp" id="crTxt" style="min-height:190px;font-family:var(--font-ar)" readonly>${esc(txt)}</textarea>
    <div class="actions">${pid ? `<button class="btn sm" onclick="openMember('${pid}')">امسكه على عملاء ←</button>` : ""}<span class="spacer"></span><button class="btn" onclick="closeModal()">قفل</button><button class="btn primary" onclick="copyText(document.getElementById('crTxt').value)">📋 انسخ الرسالة</button></div>`);
}
async function copyText(t){ try { await navigator.clipboard.writeText(t); toast("اتنسخ ✓"); } catch(e){ const el = $("#crTxt"); if (el) { el.select(); document.execCommand && document.execCommand("copy"); toast("اتنسخ ✓"); } } }
function openSetPass(pid){ const p = profileById(pid);
  openModal(`<h2>باسورد جديد لـ ${esc(p.name || p.email)}</h2><p class="small muted">الباسورد القديم هيتلغي، وهتبعتله الجديد.</p>
    <div class="row" style="gap:6px;flex-wrap:nowrap"><input class="inp" id="spPass" dir="ltr" value="${genPass()}"><button class="btn sm" onclick="$('#spPass').value=genPass()">↻</button></div>
    <div id="spErr" class="small" style="color:var(--danger);margin-top:6px"></div>
    <div class="actions"><span class="spacer"></span><button class="btn" onclick="openMember('${pid}')">رجوع</button><button class="btn primary" id="spBtn" onclick="doSetPass('${pid}')">غيّر الباسورد</button></div>`); }
async function doSetPass(pid){ const p = profileById(pid), pass = $("#spPass").value.trim(); if (pass.length < 8) { $("#spErr").textContent = ERR_AR.short_password; return; }
  $("#spBtn").disabled = true; try { await callInvite({ action:"set_password", id:pid, password:pass }); showCreds(p.name || p.email, p.email, pass, null); } catch(e){ $("#spErr").textContent = ERR_AR[e.message] || e.message; $("#spBtn").disabled = false; } }
let MF = {};
function openMember(pid){
  const p = profileById(pid); if (!p) return;
  MF = { pid, rows: clients.map(c => { const m = members.find(x => x.client_id === c.id && x.user_id === pid); return { cid:c.id, on:!!m, platforms: m ? m.platforms.slice() : [], see: m ? m.see_numbers : false, files: m ? !!m.see_files : false }; }) };
  openModal(`<div class="row">${avatar(pid, 36)}<h2 style="margin:0">${esc(p.name || p.email)}</h2><span class="spacer"></span><span class="tiny muted" dir="ltr">يوزر: ${esc(p.email || "")}</span></div>
    <div class="two"><div><label class="f">الاسم</label><input class="inp" id="mfName" value="${esc(p.name || "")}"></div><div><label class="f">الشغلانة</label><select class="inp" id="mfJob">${JOBS.map(j => `<option ${p.job === j ? "selected" : ""}>${j}</option>`).join("")}</select></div></div>
    <label class="check"><input type="checkbox" id="mfActive" ${p.active ? "checked" : ""}> شغال (لو شلت العلامة مش هيقدر يشوف أي حاجة)</label>
    <div class="section"><h3>العملاء اللي شغال عليهم</h3><p class="tiny muted" style="margin:4px 0 8px">المنصات: اللي يقدر يسجّل أرقامها (للـ Media Buyer). "يشوف نتايج العميل كلها": المبيعات والتوتال وكل المنصات، في Total. "الملفات": يشوف لينكات وملفات العميل ويرفع ملفات.</p>
    ${clients.map((c, i) => `<div class="mrow"><label class="check" style="margin:0;min-width:150px"><input type="checkbox" ${MF.rows[i].on ? "checked" : ""} onchange="MF.rows[${i}].on=this.checked;this.closest('.mrow').classList.toggle('off',!this.checked)"> <b>${esc(c.name)}</b></label>
      <div class="mrow-opts">${plats(c).map(pp => `<label class="pchk"><input type="checkbox" ${MF.rows[i].platforms.includes(pp.name) ? "checked" : ""} onchange="MF.rows[${i}].platforms=this.checked?[...MF.rows[${i}].platforms,'${jsq(pp.name)}']:MF.rows[${i}].platforms.filter(x=>x!=='${jsq(pp.name)}')">${badge(pp.name)}</label>`).join("")}
      <label class="check" style="margin:0"><input type="checkbox" ${MF.rows[i].see ? "checked" : ""} onchange="MF.rows[${i}].see=this.checked"> يشوف نتايج العميل كلها</label><label class="check" style="margin:0"><input type="checkbox" ${MF.rows[i].files ? "checked" : ""} onchange="MF.rows[${i}].files=this.checked"> الملفات</label></div></div>`).join("") || `<div class="small muted">مفيش عملاء لسه.</div>`}</div>
    <div class="actions"><button class="btn danger sm" onclick="removeMember('${pid}')">شيله من الفريق</button><button class="btn sm" onclick="openSetPass('${pid}')">🔑 غيّر الباسورد</button><span class="spacer"></span><button class="btn" onclick="closeModal()">إلغاء</button><button class="btn primary" onclick="saveMember()">حفظ</button></div>`, true);
  document.querySelectorAll(".mrow").forEach((el, i) => el.classList.toggle("off", !MF.rows[i].on));
}
async function saveMember(){
  try {
    await q(sb.from("profiles").update({ name: $("#mfName").value.trim(), job: $("#mfJob").value, active: $("#mfActive").checked }).eq("id", MF.pid), "member");
    const keep = MF.rows.filter(r => r.on).map(r => ({ client_id:r.cid, user_id:MF.pid, platforms:r.platforms, see_numbers:r.see, see_files:r.files }));
    const drop = MF.rows.filter(r => !r.on).map(r => r.cid);
    if (drop.length) await q(sb.from("client_members").delete().eq("user_id", MF.pid).in("client_id", drop), "drop");
    if (keep.length) await q(sb.from("client_members").upsert(keep), "keep");
    await loadAll(); closeModal(); render(); toast("اتحفظ ✓");
  } catch(e){ toast("ماتحفظش: " + (e.message || e)); }
}
function removeMember(pid){ const p = profileById(pid);
  openModal(`<h2>تشيل ${esc(p.name || p.email)} من الفريق؟</h2><p>حسابه هيتمسح، والتاسكات اللي عليه هتفضل من غير حد مسنود عليها.</p><div class="actions"><span class="spacer"></span><button class="btn" onclick="openMember('${pid}')">رجوع</button><button class="btn primary" style="background:var(--danger);border-color:var(--danger)" onclick="doRemove('${pid}')">شيله</button></div>`); }
async function doRemove(pid){ try { await callInvite({ action:"remove", id:pid }); await loadAll(); closeModal(); render(); toast("اتشال"); } catch(e){ toast("ماتشالش: " + e.message); } }

/* ================= Clients ================= */
function viewClients(){
  const qx = ui.q.trim().toLowerCase();
  const list = clients.filter(c => !qx || c.name.toLowerCase().includes(qx)).sort((a,b) => (a.is_test - b.is_test) || (a.status === "paused") - (b.status === "paused") || a.name.localeCompare(b.name,"ar"));
  let h = pageHead("Clients", isAdmin() ? `${clients.length} عميل` : "العملاء اللي شغال عليهم") + `<div class="row" style="margin-bottom:12px"><input class="search" placeholder="دوّر على عميل…" value="${esc(ui.q)}" oninput="ui.q=this.value;render();const s=document.querySelector('.search');s.focus();s.setSelectionRange(s.value.length,s.value.length)">${isAdmin() ? `<button class="btn primary sm" onclick="openSettings()">+ عميل جديد</button>` : ""}</div>`;
  if (!list.length) return h + `<div class="card empty">${isAdmin() ? "مفيش عملاء." : "زياد لسه مامسكّكش على أي عميل."}</div>`;
  const ym = ymOf(todayK());
  for (const c of list) if (canSeeNumbers(c.id) && !Mload[c.id]) loadMetrics(c.id);
  h += `<div class="grid">${list.map(c => { const a = M[c.id] && canSeeNumbers(c.id) ? agg(monthRows(c.id, ym)) : null, al = clientAlerts(c).length, team = members.filter(m => m.client_id === c.id).map(m => m.user_id);
    return `<div class="card client" onclick="go('client','${c.id}')">
      <div class="row">${clientLogo(c, 34)}<div class="name">${esc(c.name)}</div><span class="spacer"></span>${c.status === "paused" ? `<span class="chip grey">متوقف</span>` : ""}<span class="chip grey">${c.type === "store" ? "🛒 متجر" : "📞 ليدز"}</span></div>
      <div class="row" style="gap:4px">${plats(c).map(p => badge(p.name)).join("")}<span class="spacer"></span>${isAdmin() ? team.map(pid => avatar(pid, 22)).join("") : ""}</div>
      ${a && (a.s || a.sl) ? `<div class="small">${MONTHS[+ym.slice(5)-1]}: صرف <b class="num">${fmt(a.s)}</b> · ${c.type === "store" ? `ROAS <b class="num">${fmt2(a.roas)}</b>` : `تحويلات <b class="num">${fmt(a.conv)}</b> · CPA <b class="num">${fmt2(a.cpl)}</b>`}</div>` : canSeeNumbers(c.id) ? `<div class="small muted">مفيش أرقام الشهر ده لسه</div>` : `<div class="small muted">${myPlatforms(c).length ? "بتسجّل أرقام: " + myPlatforms(c).map(esc).join("، ") : "تاسكات بس"}</div>`}
      ${al ? `<div class="small" style="color:var(--warn)">⚠️ ${al} تنبيه</div>` : ""}</div>`; }).join("")}</div>`;
  return h;
}
function viewClient(){
  const c = clientById(ui.clientId); if (!c) { ui.tab = "clients"; return viewClients(); }
  const tk = todayK(), ym = ui.month, see = canSeeNumbers(c.id), mp = myPlatforms(c);
  if (!Mload[c.id]) loadMetrics(c.id);
  let h = `<div class="row" style="margin-bottom:10px"><button class="btn sm" onclick="go('clients')">→ العملاء</button>${clientLogo(c, 40, isAdmin())}<h2 style="font-size:21px">${esc(c.name)}</h2><span class="chip grey">${c.type === "store" ? "🛒 متجر" : "📞 ليدز"}</span><span class="spacer"></span>
    ${(isAdmin() || mp.length) ? `<button class="btn sm primary" onclick="openEntry('${c.id}','${addDaysK(tk,-1)}')">✍️ سجّل أرقام</button>` : ""}
    ${isAdmin() ? `<button class="btn sm" onclick="openDataReceived('${c.id}')">📥 العميل بعت داتا</button><button class="btn sm" onclick="go('settings');ui.stab='clients';ui.sClient='${c.id}';render()">${ico("settings")} Settings</button>` : ""}</div>
  <div class="row" style="gap:6px;margin-bottom:10px">${plats(c).map(p => `<span class="chip grey pname" style="padding:3px 10px 3px 6px">${badge(p.name)} ${esc(p.name)}${p.cur !== c.currency ? ` <span class="tiny">(${p.cur})</span>` : ""}</span>`).join("")}${(c.depts||[]).length ? `<span class="tiny muted" style="margin-right:6px">الأقسام: ${c.depts.map(esc).join("، ")}</span>` : ""}</div>
  ${fileChips(c)}
  ${isAdmin() ? clientTeamLine(c) : ""}`;
  return h + clientBody(c, ym, see, mp);
}

/* ================= Entry ================= */
let E = {};
async function openEntry(cid, d, taskId, taskDay){
  const c = clientById(cid); if (!c) return;
  await loadMetrics(cid);
  E = { cid, d, taskId, taskDay }; renderEntry();
}
function renderEntry(){
  const c = clientById(E.cid), d = E.d, ex = (M[c.id]||[]).filter(r => r.d === d), rate = c.usdRate || c.usd_rate || 1;
  const allowed = myPlatforms(c), P = plats(c).filter(p => allowed.includes(p.name)), admin = isAdmin();
  const get = (p, dep, f) => { const r = ex.find(x => x.p === p && (x.dep||"") === (dep||"")); return r && r[f] ? r[f] : ""; };
  const sIn = (p, dep) => { const v = get(p.name, dep, "s"), usd = p.cur !== c.currency; return `<input class="inp n" data-p="${esc(p.name)}" data-dep="${esc(dep)}" data-f="s" data-cur="${usd?1:0}" type="number" step="0.01" min="0" value="${v && usd ? r2(v/rate) : v}" placeholder="${usd ? esc(p.cur) : ""}">`; };
  let body;
  if (!P.length && !admin) body = `<div class="note">مفيش منصات مسموحلك تسجّلها للعميل ده.</div>`;
  else if (c.type === "store") {
    body = `<h3 style="margin-bottom:4px">١- الإعلانات</h3><table class="t entry"><thead><tr><th>المنصة</th><th>الصرف</th><th>الأوردرات <span class="tiny muted">(حسب المنصة)</span></th></tr></thead><tbody>
      ${P.map(p => `<tr><td>${pname(p.name)} ${p.cur !== c.currency ? `<span class="tiny muted">(الصرف بالـ ${esc(p.cur)})</span>` : ""}</td><td>${sIn(p,"")}</td><td><input class="inp n" data-p="${esc(p.name)}" data-dep="" data-f="o" type="number" min="0" value="${get(p.name,"","o")}"></td></tr>`).join("")}</tbody></table>
      ${admin ? `<div class="section"><h3>٢- المتجر ${c.store_platform ? `(${esc(c.store_platform)})` : "(زد / سلة)"}</h3><div class="two">
        <div><label class="f">الـ Value — المبيعات (${esc(c.currency)})</label><input class="inp" data-p="_store" data-f="sl" type="number" step="0.01" min="0" value="${get("_store","","sl")}"></div>
        <div><label class="f">أوردرات المتجر الفعلية <span class="tiny">(اختياري)</span></label><input class="inp" data-p="_store" data-f="o" type="number" min="0" value="${get("_store","","o")}"></div></div>
        <div class="tiny muted" style="margin-top:6px">لو سبت أوردرات المتجر فاضية، السيستم هيحسب الأوردرات من مجموع أوردرات المنصات.</div></div>` : ""}`;
  } else {
    const D = (c.depts||[]).length ? c.depts : [""];
    body = `<div class="tscroll" style="border:0"><table class="t entry"><thead><tr><th>${D[0] ? "القسم" : ""}</th><th>صرف</th><th>مكالمات</th><th>رسائل</th><th>Leads</th></tr></thead><tbody>
      ${P.map(p => `<tr class="ph"><td colspan="5">${pname(p.name)} ${p.cur !== c.currency ? `<span class="tiny muted">(الصرف بالـ ${esc(p.cur)})</span>` : ""}</td></tr>` + D.map(dep => `<tr><td class="small">${esc(dep)}</td><td>${sIn(p, dep)}</td>
          <td><input class="inp n" data-p="${esc(p.name)}" data-dep="${esc(dep)}" data-f="ca" type="number" min="0" value="${get(p.name,dep,"ca")}"></td>
          <td><input class="inp n" data-p="${esc(p.name)}" data-dep="${esc(dep)}" data-f="ms" type="number" min="0" value="${get(p.name,dep,"ms")}"></td>
          <td><input class="inp n" data-p="${esc(p.name)}" data-dep="${esc(dep)}" data-f="ld" type="number" min="0" value="${get(p.name,dep,"ld")}"></td></tr>`).join("")).join("")}</tbody></table></div>
      ${admin ? `<div class="section"><h3 style="margin-bottom:6px">الحجوزات الفعلية <span class="tiny muted">(لو العميل بعتها)</span></h3><div class="row">
        ${D.map(dep => `<div><div class="tiny muted">${esc(dep || "الحجوزات")}</div><input class="inp n" data-p="_bk" data-dep="${esc(dep)}" data-f="bk" type="number" min="0" value="${get("_bk",dep,"bk")}"></div>`).join("")}
        <div><div class="tiny muted">قيمة الحجوزات (${esc(c.currency)})</div><input class="inp n" data-p="_bk" data-dep="${esc(D[0])}" data-f="bv" type="number" step="0.01" min="0" value="${get("_bk",D[0],"bv")}"></div></div></div>` : ""}`;
  }
  openModal(`<div class="row"><h2 style="margin:0">أرقام ${esc(c.name)}</h2><span class="spacer"></span>
      <button class="btn sm" onclick="E.d=addDaysK(E.d,1);renderEntry()" aria-label="اليوم اللي بعده">›</button><input type="date" class="inp" style="width:auto" value="${d}" onchange="E.d=this.value;renderEntry()"><button class="btn sm" onclick="E.d=addDaysK(E.d,-1);renderEntry()" aria-label="اليوم اللي قبله">‹</button></div>
    <div class="small muted" style="margin:6px 0 10px">${fmtDate(fromKey(d))} · العملة ${esc(c.currency)}${!admin ? " · زياد هيراجع الأرقام دي" : ""}</div>
    ${body}<div id="enErr" class="small" style="color:var(--danger)"></div>
    <div class="actions"><span class="spacer"></span><button class="btn" onclick="closeModal()">إلغاء</button><button class="btn primary" id="enBtn" onclick="saveEntry()">حفظ</button></div>`, true);
}
async function saveEntry(){
  const c = clientById(E.cid), rate = c.usd_rate || 1, map = {}, admin = isAdmin();
  document.querySelectorAll("#modal [data-f]").forEach(inp => {
    const v = parseFloat(inp.value); if (!isFinite(v) || v <= 0) return;
    const p = inp.dataset.p, dep = inp.dataset.dep || "", f = inp.dataset.f, k = p + "|" + dep;
    map[k] = map[k] || { client_id:c.id, d:E.d, p, dep, entered_by:me.id, reviewed: admin || me.job === "Media Buyer", updated_at:new Date().toISOString() };
    map[k][f === "in" ? "ins" : f] = inp.dataset.cur === "1" ? r2(v * rate) : v;
  });
  const editable = admin ? null : myPlatforms(c);
  $("#enBtn").disabled = true;
  try {
    let del = sb.from("metrics").delete().eq("client_id", c.id).eq("d", E.d);
    if (editable) del = del.in("p", editable);
    await q(del, "del");
    const rows = Object.values(map);
    if (rows.length) await q(sb.from("metrics").insert(rows), "ins");
    if (E.taskId) await setDone(E.taskId, E.taskDay, true);
    await loadMetrics(c.id, true); if (admin) loadUnreviewed();
    closeModal(); render(); toast(admin ? "اتحفظ ✓" : "اتحفظ ✓ — زياد هيراجعه");
  } catch(e){ const m = String(e.message || e); $("#enErr").textContent = /duplicate key/i.test(m) ? "اليوم ده فيه أرقام متسجلة لنفس المنصة. اعمل refresh للصفحة وافتح الفورم تاني، هتلاقي الأرقام القديمة تعدّل عليها." : /row-level security/i.test(m) ? "مش مسموحلك تسجّل أرقام المنصة دي. كلّم زياد." : "ماتحفظش: " + m; $("#enBtn").disabled = false; }
}
async function saveSalesTarget(cid, ym){
  const c = clientById(cid), v = parseFloat($("#stVal").value), val = isFinite(v) && v > 0 ? v : 0;
  const tg = Object.assign({}, c.targets || {}); tg.salesMonths = Object.assign({}, tg.salesMonths || {});
  if ($("#stDef").checked) { tg.sales = val || undefined; delete tg.salesMonths[ym]; } else tg.salesMonths[ym] = val;
  try { await q(sb.from("clients").update({ targets: tg }).eq("id", cid), "target"); c.targets = tg; closeModal(); render(); toast("اتحفظ ✓"); } catch(e){ toast("ماتحفظش"); }
}

/* ================= Client settings (admin) ================= */
let F = {};
function openSettings(id){
  const c = id ? clientById(id) : null;
  F = { id, type: c?.type || "leads", platforms: c ? JSON.parse(JSON.stringify(plats(c))) : [{name:"Meta",cur:"SAR"},{name:"TikTok",cur:"SAR"},{name:"Snapchat",cur:"SAR"}], depts: c ? (c.depts||[]).slice() : [], links: c ? JSON.parse(JSON.stringify(c.links||[])) : [], currency: c?.currency || "SAR" };
  const tg = c?.targets || {};
  openModal(`<h2>${c ? "إعدادات " + esc(c.name) : "عميل جديد"}</h2>
    <div class="two">
      <div><label class="f">اسم العميل</label><input class="inp" id="sName" value="${esc(c?.name||"")}" autofocus></div>
      <div><label class="f">نوع العميل</label><select class="inp" id="sType" onchange="F.type=this.value;drawSettingsDyn()"><option value="leads" ${F.type==="leads"?"selected":""}>📞 ليدز</option><option value="store" ${F.type==="store"?"selected":""}>🛒 متجر</option></select></div>
      <div><label class="f">عملة الحساب</label><select class="inp" id="sCur" onchange="F.currency=this.value;drawSettingsDyn()">${["SAR","USD","EGP","AED","KWD","QAR"].map(x => `<option ${F.currency===x?"selected":""}>${x}</option>`).join("")}</select></div>
      <div><label class="f">سعر الدولار بعملة الحساب</label><input class="inp" id="sRate" type="number" step="0.01" value="${c?.usd_rate ?? 3.75}"></div></div>
    <div id="sDyn"></div>
    <div class="section"><h3>التارجت <span class="tiny muted">(كله اختياري)</span></h3><div class="two">
      <div class="only-store"><label class="f">تارجت المبيعات الشهري</label><input class="inp" id="tSales" type="number" value="${tg.sales ?? ""}"></div>
      <div class="only-store"><label class="f">منصة المتجر</label><select class="inp" id="sStore"><option value="">—</option>${["سلة","زد","Shopify","WordPress"].map(x => `<option ${c?.store_platform===x?"selected":""}>${x}</option>`).join("")}</select></div>
      <div class="only-leads"><label class="f">أقصى تكلفة تحويل (CPA)</label><input class="inp" id="tCpl" type="number" step="0.01" value="${tg.cpl ?? ""}"></div>
      <div class="only-store"><label class="f">أقل ROAS (Breakeven)</label><input class="inp" id="tRoas" type="number" step="0.01" value="${tg.minRoas ?? ""}"></div>
      <div class="only-store"><label class="f">أقصى CPP</label><input class="inp" id="tCpp" type="number" step="0.01" value="${tg.maxCpp ?? ""}"></div></div></div>
    <div class="section"><h3>اللينكات</h3><p class="small muted" style="margin:4px 0 0">اللينكات بقت في «ملفات العميل» في صفحة العميل: تضيفها وتعدّل أسماءها من هناك، والفريق كمان.</p><div id="sLinks" hidden></div></div>
    <div class="section"><label class="f" style="margin-top:0">ملاحظات (انت بس اللي بتشوفها)</label><textarea class="inp" id="sNotes">${esc(c?.notes||"")}</textarea>
      <label class="f">الحالة</label><select class="inp" id="sStatus"><option value="active">شغال</option><option value="paused" ${c?.status==="paused"?"selected":""}>متوقف مؤقتاً</option></select>
      ${!c ? `<label class="check"><input type="checkbox" id="sDefaults" checked> ضيف المهام الأساسية</label>` : ""}</div>
    <div class="actions">${c ? `<button class="btn danger" onclick="deleteClient('${c.id}')">مسح العميل</button>` : ""}<span class="spacer"></span><button class="btn" onclick="closeModal()">إلغاء</button><button class="btn primary" onclick="saveSettings()">حفظ</button></div>`, true);
  drawSettingsDyn(); drawLinks();
}
function drawSettingsDyn(){
  $("#sDyn").innerHTML = `<div class="section"><h3>المنصات</h3>
    ${F.platforms.map((p,i) => `<div class="lrow">${badge(p.name)}<input class="inp" style="max-width:220px" value="${esc(p.name)}" oninput="F.platforms[${i}].name=this.value"><select class="inp" style="max-width:110px" onchange="F.platforms[${i}].cur=this.value"><option ${p.cur===F.currency?"selected":""}>${F.currency}</option>${F.currency!=="USD"?`<option ${p.cur==="USD"?"selected":""}>USD</option>`:""}</select><button class="btn ghost sm" onclick="F.platforms.splice(${i},1);drawSettingsDyn()" aria-label="شيل">✕</button></div>`).join("")}
    <div class="row" style="gap:4px;margin-top:4px">${PLATFORM_PRESETS.filter(n => !F.platforms.some(p => p.name.toLowerCase() === n.toLowerCase())).map(n => `<button class="btn xs" onclick="F.platforms.push({name:'${n}',cur:F.currency});drawSettingsDyn()">${badge(n)} ${n}</button>`).join("")}<button class="btn xs" onclick="F.platforms.push({name:'',cur:F.currency});drawSettingsDyn()">+ منصة تانية</button></div></div>
  ${F.type === "leads" ? `<div class="section"><h3>الأقسام</h3>${F.depts.map((d,i) => `<div class="lrow"><input class="inp" style="max-width:260px" value="${esc(d)}" oninput="F.depts[${i}]=this.value"><button class="btn ghost sm" onclick="F.depts.splice(${i},1);drawSettingsDyn()" aria-label="شيل">✕</button></div>`).join("")}<button class="btn xs" onclick="F.depts.push('');drawSettingsDyn()">+ قسم</button></div>` : ""}`;
  document.querySelectorAll("#modal .only-leads").forEach(x => x.style.display = F.type === "leads" ? "" : "none");
  document.querySelectorAll("#modal .only-store").forEach(x => x.style.display = F.type === "store" ? "" : "none");
}
function drawLinks(){ $("#sLinks").innerHTML = F.links.map((l,i) => `<div class="lrow"><input class="inp" style="max-width:160px" value="${esc(l.label)}" placeholder="الاسم" oninput="F.links[${i}].label=this.value"><input class="inp" value="${esc(l.url)}" placeholder="اللينك" dir="ltr" oninput="F.links[${i}].url=this.value"><button class="btn ghost sm" onclick="F.links.splice(${i},1);drawLinks()" aria-label="شيل">✕</button></div>`).join(""); }
async function saveSettings(){
  const name = $("#sName").value.trim(); if (!name) { toast("اكتب اسم العميل"); return; }
  const pn = sel => { const v = parseFloat($(sel)?.value); return isFinite(v) && v > 0 ? v : undefined; };
  const old = F.id ? clientById(F.id) : null;
  const data = { name, type: F.type, currency: $("#sCur").value, usd_rate: parseFloat($("#sRate").value) || 1,
    platforms: F.platforms.map(p => ({ name: p.name.trim(), cur: p.cur || F.currency })).filter(p => p.name),
    depts: F.type === "leads" ? F.depts.map(d => d.trim()).filter(Boolean) : [],
    targets: F.type === "store" ? { sales: pn("#tSales"), salesMonths: (old && old.targets && old.targets.salesMonths) || {}, minRoas: pn("#tRoas"), maxCpp: pn("#tCpp") } : { cpl: pn("#tCpl") },
    store_platform: F.type === "store" ? $("#sStore").value : null,
    notes: $("#sNotes").value, status: $("#sStatus").value };
  try {
    if (F.id) { await q(sb.from("clients").update(data).eq("id", F.id), "upd"); Object.assign(old, data); }
    else {
      const [row] = await q(sb.from("clients").insert(data).select(), "new"); clients.push(row);
      if ($("#sDefaults")?.checked) { const rows = DEFAULT_TASKS.map(d => taskToDb({ ...d, clientId: row.id })); const ins = await q(sb.from("tasks").insert(rows).select(), "deftasks"); tasks.push(...ins.map(mapTask)); }
      F.id = row.id;
    }
    closeModal(); go("client", F.id); toast("اتحفظ ✓");
  } catch(e){ toast("ماتحفظش: " + (e.message || e)); }
}
function deleteClient(id){ const c = clientById(id); openModal(`<h2>مسح ${esc(c.name)}؟</h2><p>العميل ومهامه وأرقامه هيتمسحوا من السيستم.</p><div class="actions"><span class="spacer"></span><button class="btn" onclick="openSettings('${id}')">رجوع</button><button class="btn primary" style="background:var(--danger);border-color:var(--danger)" onclick="confirmDelete('${id}')">امسح</button></div>`); }
async function confirmDelete(id){ try { await q(sb.from("clients").delete().eq("id", id), "del"); clients = clients.filter(c => c.id !== id); tasks = tasks.filter(t => t.clientId !== id); closeModal(); go("clients"); toast("اتمسح"); } catch(e){ toast("ماتمسحش"); } }

/* ================= Task form (admin) ================= */
let formDays = [];
function openTask(id, preset){
  const t = id ? tasks.find(x => x.id === id) : Object.assign({ repeat: preset && preset.assigneeId ? "once" : "daily", days:[], monthDay:1, every:2, date: todayK() }, preset||{});
  const presetJob = !id && t.assigneeId ? ((profileById(t.assigneeId)||{}).job || "") : "";
  formDays = (t.days||[]).slice();
  const team = profiles.filter(p => p.id !== me.id && p.active);
  openModal(`<h2>${id ? "تعديل مهمة" : "مهمة جديدة"}</h2>
    <label class="f">المهمة</label><input class="inp" id="tTitle" value="${esc(t.title||"")}" autofocus>
    <div class="two"><div><label class="f">العميل</label><select class="inp" id="tClient"><option value="">— مهمة عامة —</option>${clients.map(c => `<option value="${c.id}" ${t.clientId===c.id?"selected":""}>${esc(c.name)}</option>`).join("")}</select></div>
      <div><label class="f">مسنودة على</label><select class="inp" id="tAssignee" onchange="document.getElementById('tReview').checked=!!this.value && this.selectedOptions[0].dataset.job!=='Media Buyer'"><option value="">انت</option>${team.map(p => `<option value="${p.id}" data-job="${esc(p.job||"")}" ${t.assigneeId===p.id?"selected":""}>${esc(p.name || p.email)} · ${esc(p.job||"")}</option>`).join("")}</select></div></div>
    <label class="check"><input type="checkbox" id="tReview" ${t.needsReview || (!id && t.assigneeId && presetJob !== "Media Buyer") ? "checked" : ""}> محتاجة تسليم ومراجعة (العضو يدوس "سلّم" ويحط لينك أو ملف)</label>
    <label class="f">البريف / التفاصيل (اختياري)</label><textarea class="inp" id="tBrief" placeholder="مثلاً: فيديو 15 ثانية عمودي، الخصم 5% باين في أول 3 ثواني">${esc(t.brief||"")}</textarea>
    <label class="f">بتتكرر إمتى؟</label><select class="inp" id="tRepeat" onchange="repeatFields()">${Object.entries(REPEAT_LABEL).map(([k,v]) => `<option value="${k}" ${t.repeat===k?"selected":""}>${v}</option>`).join("")}</select><div id="tRF"></div>
    <div class="two"><div><label class="f">الوقت (اختياري)</label><input class="inp" id="tTime" value="${esc(t.time||"")}"></div><div><label class="f">ملاحظة (اختياري)</label><input class="inp" id="tNote" value="${esc(t.note||"")}"></div></div>
    ${id ? `<label class="check"><input type="checkbox" id="tPaused" ${t.paused?"checked":""}> وقّف المهمة دي مؤقتاً</label>` : ""}
    <div class="actions">${id ? `<button class="btn danger" onclick="deleteTask('${id}')">مسح</button>` : ""}<span class="spacer"></span><button class="btn" onclick="closeModal()">إلغاء</button><button class="btn primary" onclick="saveTask('${id||""}')">حفظ</button></div>`);
  openTask._t = t; repeatFields();
}
function repeatFields(){
  const r = $("#tRepeat").value, t = openTask._t, box = $("#tRF");
  if (r === "days" || r === "weekly") box.innerHTML = `<label class="f">${r==="weekly"?"يوم الأسبوع":"الأيام"}</label><div class="daypick">${DAY_ORDER.map(d => `<button type="button" class="${formDays.includes(d)?"on":""}" onclick="toggleDay(${d},this,'${r}')">${DAYS[d]}</button>`).join("")}</div>`;
  else if (r === "monthly") box.innerHTML = `<label class="f">يوم كام في الشهر؟</label><input class="inp" id="tMonthDay" type="number" min="1" max="31" value="${t.monthDay||1}">`;
  else if (r === "once") box.innerHTML = `<label class="f">التاريخ</label><input class="inp" id="tDate" type="date" value="${t.date||todayK()}">`;
  else if (r === "interval") box.innerHTML = `<label class="f">كل كام يوم؟</label><input class="inp" id="tEvery" type="number" min="2" max="30" value="${t.every||2}">`;
  else box.innerHTML = `<label class="check"><input type="checkbox" id="tSkipFri" ${t.skipFriday?"checked":""}> ما عدا الجمعة</label>`;
}
function toggleDay(d, el, r){ if (r === "weekly") { formDays = [d]; el.parentNode.querySelectorAll("button").forEach(b => b.classList.remove("on")); el.classList.add("on"); return; } const i = formDays.indexOf(d); if (i>=0) formDays.splice(i,1); else formDays.push(d); el.classList.toggle("on"); }
async function saveTask(id){
  const title = $("#tTitle").value.trim(); if (!title) { toast("اكتب اسم المهمة"); return; }
  const repeat = $("#tRepeat").value; if ((repeat === "days" || repeat === "weekly") && !formDays.length) { toast("اختار يوم"); return; }
  const base = id ? tasks.find(t => t.id === id) : {};
  const t = Object.assign({}, base, { title, clientId: $("#tClient").value || null, assigneeId: $("#tAssignee").value || null, needsReview: $("#tReview").checked, brief: $("#tBrief").value.trim(), repeat, time: $("#tTime").value.trim(), note: $("#tNote").value.trim(),
    days: (repeat==="days"||repeat==="weekly") ? formDays.slice() : [], monthDay: repeat==="monthly" ? Math.max(1, Math.min(31, parseInt($("#tMonthDay").value)||1)) : null,
    every: repeat==="interval" ? Math.max(2, parseInt($("#tEvery").value)||2) : null, date: repeat==="once" ? $("#tDate").value : null,
    skipFriday: repeat==="daily" ? !!$("#tSkipFri")?.checked : false, paused: id ? !!$("#tPaused")?.checked : false });
  try {
    if (id) { await q(sb.from("tasks").update(taskToDb(t)).eq("id", id), "task"); Object.assign(base, t); }
    else { const [row] = await q(sb.from("tasks").insert({ ...taskToDb(t), created_by: me.id }).select(), "task"); tasks.push(mapTask(row)); }
    if (t.assigneeId && t.clientId && !members.some(m => m.client_id === t.clientId && m.user_id === t.assigneeId)) {
      try { await q(sb.from("client_members").insert({ client_id:t.clientId, user_id:t.assigneeId, platforms:[], see_numbers:false, see_files:false }), "automember"); await loadAll(); } catch(e){}
    }
    closeModal(); render(); toast(t.assigneeId ? `اتحفظت ✓ — هتظهر عند ${String(personName(t.assigneeId)).split(" ")[0]}` : "اتحفظت ✓");
  } catch(e){ toast("ماتحفظتش: " + (e.message || e)); }
}
async function deleteTask(id){ try { await q(sb.from("tasks").delete().eq("id", id), "deltask"); tasks = tasks.filter(t => t.id !== id); closeModal(); render(); toast("اتمسحت"); } catch(e){ toast("ماتمسحتش"); } }
function openDataReceived(cid){ const c = clientById(cid);
  openModal(`<h2>📥 ${esc(c.name)} بعت داتا جديدة</h2><label class="f">إيه اللي بعته؟ (اختياري)</label><input class="inp" id="drNote" autofocus>
    <label class="f">هتراجعها إمتى؟</label><select class="inp" id="drWhen"><option value="0">النهارده</option><option value="1">بكرة</option></select>
    <div class="actions"><span class="spacer"></span><button class="btn" onclick="closeModal()">إلغاء</button><button class="btn primary" onclick="saveDataReceived('${cid}')">اعمل تاسك</button></div>`); }
async function saveDataReceived(cid){ const t = { clientId: cid, title: "راجع الداتا الجديدة اللي العميل بعتها", repeat: "once", date: addDaysK(todayK(), +$("#drWhen").value), note: $("#drNote").value.trim(), kind: "data" };
  try { const [row] = await q(sb.from("tasks").insert({ ...taskToDb(t), created_by: me.id }).select(), "data"); tasks.push(mapTask(row)); closeModal(); render(); toast("اتعمل التاسك ✓"); } catch(e){ toast("ماتعملش"); } }
function openMeeting(cid, taskId, dk){ const c = clientById(cid);
  openModal(`<h2>📅 ميتينج الريبورت الشهري — ${esc(c.name)}</h2><div class="two"><div><label class="f">اليوم</label><input class="inp" type="date" id="mtDate" value="${dk}"></div><div><label class="f">الساعة</label><input class="inp" id="mtTime" placeholder="مثلاً: 8 بالليل"></div></div>
    <div class="row" style="margin-top:8px"><button class="btn xs" onclick="$('#mtDate').value='${dk}'">يوم التقرير</button><button class="btn xs" onclick="$('#mtDate').value='${addDaysK(dk,1)}'">تاني يوم</button></div>
    <div class="actions"><span class="spacer"></span><button class="btn" onclick="closeModal()">إلغاء</button><button class="btn primary" onclick="saveMeeting('${cid}','${taskId}','${dk}')">حفظ</button></div>`); }
async function saveMeeting(cid, taskId, dk){ const t = { clientId: cid, title: "ميتينج الريبورت الشهري", repeat: "once", date: $("#mtDate").value || dk, time: $("#mtTime").value.trim(), kind: "meetingEvent" };
  try { const [row] = await q(sb.from("tasks").insert({ ...taskToDb(t), created_by: me.id }).select(), "meet"); tasks.push(mapTask(row)); await setDone(taskId, dk, true); closeModal(); render(); toast("الميعاد اتحط ✓"); } catch(e){ toast("ماتحفظش"); } }

/* ================= Modals ================= */
function openModal(html, wide){ const m = $("#modal"); m.className = "modal" + (wide ? " wide" : ""); m.innerHTML = html; $("#modalBg").classList.add("show"); const f = m.querySelector("[autofocus]"); if (f) f.focus(); }
function closeModal(){ $("#modalBg").classList.remove("show"); }

/* ================= Account ================= */
function openAccount(){
  openModal(`<h2>حسابك</h2><div class="row">${avatar(me.id, 40)}<div><b>${esc(me.name || "")}</b><div class="tiny muted" dir="ltr">${esc(me.email || "")}</div></div></div>
    <label class="f">اسمك</label><input class="inp" id="acName" value="${esc(me.name||"")}">
    <label class="f">باسورد جديد (اختياري)</label><input class="inp" id="acPass" type="password" autocomplete="new-password" placeholder="8 حروف على الأقل">
    <div class="actions"><button class="btn danger sm" onclick="signOut()">تسجيل خروج</button><span class="spacer"></span><button class="btn" onclick="closeModal()">إلغاء</button><button class="btn primary" onclick="saveAccount()">حفظ</button></div>`);
}
async function saveAccount(){ const name = $("#acName").value.trim(), pass = $("#acPass").value;
  try { if (name && name !== me.name) { await q(sb.from("profiles").update({ name }).eq("id", me.id), "name"); me.name = name; const p = profileById(me.id); if (p) p.name = name; }
    if (pass) { if (pass.length < 8) { toast("الباسورد لازم 8 حروف على الأقل"); return; } const { error } = await sb.auth.updateUser({ password: pass }); if (error) throw error; }
    closeModal(); render(); toast("اتحفظ ✓"); } catch(e){ toast("ماتحفظش: " + (e.message || e)); } }
async function signOut(){ await sb.auth.signOut(); location.reload(); }

/* ================= Auth screens ================= */
function authScreen(mode, msg){
  document.body.classList.add("auth");
  const titles = { login:"تسجيل الدخول", signup:"إنشاء حساب الأدمن", forgot:"نسيت الباسورد", setpass:"اعمل باسورد لحسابك" };
  $("#app").innerHTML = `<div class="authbox">
    <div class="brand" style="margin-bottom:22px"><svg width="34" height="34" viewBox="0 0 48 48" aria-hidden="true"><rect class="zm-ink" x="0" y="28" width="12" height="20" rx="2"/><rect class="zm-brand" x="18" y="16" width="12" height="32" rx="2"/><rect class="zm-signal" x="36" y="0" width="12" height="12" rx="2"/><rect class="zm-brand" x="36" y="15" width="12" height="33" rx="2"/></svg><span class="nm" style="font-size:22px">زياد إبراهيم</span><span class="sub">· سيستم الشغل</span></div>
    <h2 style="margin-bottom:4px">${titles[mode]}</h2>
    ${mode === "setpass" ? `<p class="small muted">اعمل باسورد جديد تدخل بيه بعد كده.</p>` : mode === "signup" ? `<p class="small muted">أول حساب بيتعمل بيبقى الأدمن (زياد). أعضاء الفريق بيدخلوا باليوزر والباسورد اللي زياد بيعملهوملهم.</p>` : mode === "forgot" ? `<p class="small muted">ده للأدمن بس. لو انت في الفريق ونسيت الباسورد، كلّم زياد يعملك واحد جديد.</p>` : ""}
    ${mode !== "setpass" ? `<label class="f">${mode === "login" ? "اليوزر أو الإيميل" : "الإيميل"}</label><input class="inp" id="auEmail" type="${mode === "login" ? "text" : "email"}" dir="ltr" autocomplete="username" autocapitalize="none">` : ""}
    ${mode === "signup" ? `<label class="f">اسمك</label><input class="inp" id="auName">` : ""}
    ${mode !== "forgot" ? `<label class="f">الباسورد</label><input class="inp" id="auPass" type="password" dir="ltr" autocomplete="${mode === "login" ? "current-password" : "new-password"}">` : ""}
    <div id="auMsg" class="small" style="margin-top:10px;color:${msg && msg.ok ? "var(--ok)" : "var(--danger)"}">${msg ? esc(msg.t) : ""}</div>
    <button class="btn primary" style="width:100%;margin-top:14px;height:42px" id="auBtn" onclick="authSubmit('${mode}')">${{ login:"دخول", signup:"اعمل الحساب", forgot:"ابعتلي لينك", setpass:"احفظ الباسورد وادخل" }[mode]}</button>
    <div class="row small" style="margin-top:14px;justify-content:center;gap:16px">
      ${mode === "login" ? `<a href="#" onclick="authScreen('forgot');return false" title="للأدمن. أعضاء الفريق يكلموا زياد">نسيت الباسورد؟</a>` : mode !== "setpass" ? `<a href="#" onclick="authScreen('login');return false">رجوع لتسجيل الدخول</a>` : ""}
    </div></div>`;
  const f = $("#auEmail") || $("#auPass"); if (f) f.focus();
  document.querySelectorAll(".authbox input").forEach(i => i.addEventListener("keydown", e => { if (e.key === "Enter") authSubmit(mode); }));
}
async function authSubmit(mode){
  const email = ($("#auEmail")||{}).value?.trim(), pass = ($("#auPass")||{}).value, btn = $("#auBtn"), msg = t => { $("#auMsg").style.color = "var(--danger)"; $("#auMsg").textContent = t; };
  btn.disabled = true;
  try {
    if (mode === "login") { const login = email && !email.includes("@") ? email.toLowerCase() + "@team.ziad-system.app" : email; const { error } = await sb.auth.signInWithPassword({ email: login, password: pass }); if (error) throw new Error(/invalid/i.test(error.message) ? "اليوزر أو الباسورد غلط" : error.message); btn.textContent = "⏳ بيفتح…"; await boot(); return; }
    else if (mode === "signup") { if (!pass || pass.length < 8) throw new Error("الباسورد لازم 8 حروف على الأقل"); const { data, error } = await sb.auth.signUp({ email, password: pass, options: { data: { name: $("#auName").value.trim() }, emailRedirectTo: location.origin + location.pathname } }); if (error) throw error; if (!data.session) { $("#auMsg").style.color = "var(--ok)"; $("#auMsg").textContent = "اتبعتلك إيميل تأكيد. دوس على اللينك اللي فيه وبعدين ادخل."; btn.disabled = false; return; } }
    else if (mode === "forgot") { const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: location.origin + location.pathname }); if (error) throw error; $("#auMsg").style.color = "var(--ok)"; $("#auMsg").textContent = "لو الإيميل متسجل، هيوصلك لينك تعمل منه باسورد جديد."; btn.disabled = false; return; }
    else if (mode === "setpass") { if (!pass || pass.length < 8) throw new Error("الباسورد لازم 8 حروف على الأقل"); const { error } = await sb.auth.updateUser({ password: pass }); if (error) throw error; history.replaceState(null, "", location.pathname); needPass = false; await boot(); }
  } catch(e){ msg(e.message || String(e)); btn.disabled = false; }
}

/* ================= Boot ================= */
let needPass = /type=(invite|recovery)/.test(location.hash);
let booting = false;
async function boot(){
  if (booting) return; booting = true;
  try { await bootInner(); } finally { booting = false; }
}
async function bootInner(){
  const { data: { session } } = await sb.auth.getSession();
  if (!session) { authScreen("login"); return; }
  if (needPass) { authScreen("setpass"); return; }
  me = { id: session.user.id, email: session.user.email };
  document.body.classList.remove("auth");
  $("#app").innerHTML = SHELL2;
  try { await loadAll(); } catch(e){ $("#view").innerHTML = `<div class="alert">مقدرش يحمّل الداتا: ${esc(e.message || e)}</div>`; return; }
  if (!me.active) { $("#view").innerHTML = `<div class="card empty">حسابك متوقف. كلّم زياد.</div>`; return; }
  render();
  for (const c of clients) if (canSeeNumbers(c.id) || myPlatforms(c).length) loadMetrics(c.id);
  loadUnreviewed();
  try {
    sb.channel("live").on("postgres_changes", { event: "*", schema: "public", table: "task_status" }, () => refreshStatus())
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, () => refreshAll(true)).subscribe();
  } catch(e){}
}
let rsT = null;
function refreshStatus(){ clearTimeout(rsT); rsT = setTimeout(async () => { try { const s = await q(sb.from("task_status").select("*").gte("day", addDaysK(todayK(), -120)), "st"); ST = {}; for (const r of s) ST[r.task_id + "|" + r.day] = r; render(); } catch(e){} }, 400); }
async function refreshAll(silent){ try { await loadAll(); loadUnreviewed(); render(); if (!silent) toast("اتحدث ✓"); } catch(e){} }
window.addEventListener("focus", () => { if (me && me.role) refreshStatus(); });
document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });
let lastDay = todayK();
setInterval(() => { const k = todayK(); if (k !== lastDay) { if (ui.date === lastDay) ui.date = k; lastDay = k; render(); } }, 60000);

function start(){
  if (!window.supabase) { document.getElementById("app").innerHTML = `<div class="authbox"><h2>مقدرش يحمّل السيستم</h2><p class="small muted">اتأكد من النت وجرب تاني.</p></div>`; return; }
  sb = window.supabase.createClient(SB_URL, SB_KEY, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
  sb.auth.onAuthStateChange((ev) => { if (ev === "PASSWORD_RECOVERY") { needPass = true; authScreen("setpass"); } if (ev === "SIGNED_OUT") { me = null; authScreen("login"); } if (ev === "SIGNED_IN" && !me && !needPass && document.body.classList.contains("auth")) setTimeout(boot, 0); });
  boot();
  checkVersion(); setInterval(checkVersion, 60000);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) checkVersion(); });
  window.addEventListener("focus", checkVersion);
}

/* ================= Auto update (beats GitHub Pages cache) ================= */
let pendingVersion = null;
async function checkVersion(){
  const cur = window.__APP_VERSION; if (!cur || cur === "dev") return;
  try {
    const r = await fetch("version.json?t=" + Date.now(), { cache: "no-store" }); if (!r.ok) return;
    const j = await r.json(); if (!j.v || j.v === cur) return;
    applyUpdate(j.v);
  } catch(e){}
}
function applyUpdate(v){
  let tried = ""; try { tried = sessionStorage.getItem("upd_" + v) || ""; } catch(e){}
  if (tried) return; // already reloaded once for this version; CDN may still be catching up
  const busy = $("#modalBg") && $("#modalBg").classList.contains("show");
  if (busy) { pendingVersion = v; showUpdateBar(); return; }
  try { sessionStorage.setItem("upd_" + v, "1"); } catch(e){}
  location.replace(location.pathname + "?v=" + encodeURIComponent(v) + location.hash);
}
function showUpdateBar(){
  if (document.getElementById("updBar")) return;
  const d = document.createElement("div"); d.id = "updBar";
  d.style.cssText = "position:fixed;bottom:16px;left:50%;transform:translateX(-50%);z-index:9999;background:var(--accent);color:#fff;padding:10px 16px;border-radius:var(--radius);display:flex;gap:12px;align-items:center;box-shadow:0 6px 24px rgba(0,0,0,.25);font-size:14px";
  d.innerHTML = `فيه نسخة جديدة من السيستم <button class="btn xs" onclick="applyUpdate(pendingVersion)">حدّث دلوقتي</button>`;
  document.body.appendChild(d);
}
const _closeModal0 = closeModal;
closeModal = function(){ _closeModal0(); if (pendingVersion) setTimeout(() => applyUpdate(pendingVersion), 300); };

/* ================= Platform comparison (best platform) ================= */
function platformRank(c, rows){
  const ad = adRows(rows), isStore = c.type === "store";
  const list = platformsInUse(c, ad).map(n => { const a = agg(ad.filter(r => r.p === n)); const res = isStore ? a.po : a.conv; return { name:n, s:a.s, res, cost: res ? a.s / res : null, a }; }).filter(x => x.s > 0 || x.res > 0);
  const ranked = list.filter(x => x.cost != null && x.s > 0).sort((a,b) => a.cost - b.cost);
  const total = list.reduce((t,x) => t + x.s, 0);
  const n = ranked.length, near = (a, b) => Math.abs(a - b) <= Math.max(a, b) * 0.02; // within 2% = same price
  const allSame = n > 1 && near(ranked[0].cost, ranked[n-1].cost);
  const lows = n > 1 && !allSame ? ranked.filter(x => near(x.cost, ranked[0].cost)) : [];
  const highs = n > 1 && !allSame ? ranked.filter(x => near(x.cost, ranked[n-1].cost)) : [];
  return { list, ranked, total, lows, highs, allSame, best: lows.length === 1 ? lows[0] : null, worst: highs.length === 1 ? highs[0] : null, unit: isStore ? "CPP" : "CPA", resName: isStore ? "أوردر" : "تحويل" };
}
function platformAdvice(c, rows, when){
  const R = platformRank(c, rows), cu = cur(c), zero = R.list.filter(x => x.s > 0 && !x.res);
  const res0 = R.resName === "أوردر" ? "أوردرات" : "تحويلات";
  const names = L => L.map(x => `<b>${esc(x.name)}</b>`).join(" و ");
  let t = "";
  if (R.allSame) t = `كل المنصات ${when} نفس الـ ${R.unit} تقريبًا: <b class="num">${fmt2(R.ranked[0].cost)}</b> ${cu}`;
  else if (R.lows.length) {
    const lo = R.lows[0], hi = R.highs[0], one = R.lows.length === 1;
    t = one ? `${names(R.lows)} أرخص منصة ${when}: ${R.unit} <b class="num">${fmt2(lo.cost)}</b> ${cu} (${fmt(lo.res)} ${R.resName})`
            : `${names(R.lows)} الأرخص ${when}، بنفس الـ ${R.unit} تقريبًا: <b class="num">${fmt2(lo.cost)}</b> ${cu}`;
    if (hi && hi.cost > lo.cost * 1.3) {
      const x = hi.cost / lo.cost, many = R.highs.length > 1;
      t += ` · ${names(R.highs)} ${many ? "الأغلى" : "الأغلى"}: ${R.unit} <b class="num">${fmt2(hi.cost)}</b> ${cu} (${x >= 2 ? `أغلى ${fmt(x,1)} مرة` : `أغلى بـ ${fmt((x-1)*100)}%`})`;
      const hiSpend = R.highs.reduce((a, h) => a + h.s, 0);
      if (hiSpend / R.total >= 0.15) t += `. فكّر تنقل جزء من ميزانية ${R.highs.map(h => esc(h.name)).join(" و ")} لـ ${R.lows.map(l => esc(l.name)).join(" أو ")}.`;
    }
  }
  if (zero.length) t += `${t ? " · " : ""}${names(zero)} صرفت ${fmt(zero.reduce((s,z) => s + z.s, 0))} ${cu} من غير ${res0}.`;
  if (!t) return null;
  const tg = c.targets || {}, T = c.type === "store" ? tg.maxCpp : tg.cpl;
  const lo = R.lows[0], hi = R.highs[0], ratio = lo && hi ? hi.cost / lo.cost : 1;
  const hiShare = R.highs.reduce((a, h) => a + h.s, 0) / (R.total || 1);
  let level = "good";
  if (zero.length || (T && ((hi && hi.cost > T && hiShare >= 0.1) || (lo && lo.cost > T) || (R.allSame && R.ranked[0].cost > T))) || (ratio >= 2.5 && hiShare >= 0.15)) level = "bad";
  else if (ratio >= 1.3 || (T && hi && hi.cost > T)) level = "warn";
  return { html: t, best: R.best, worst: R.worst, R, level, lows: R.lows, highs: R.highs, ratio, zero, T, suggest: hi && ratio >= 1.3 && hiShare >= 0.15 };
}
function adviceBox(c, items){
  items = items.filter(x => x.adv); if (!items.length) return "";
  const rank = { good:0, warn:1, bad:2 }, top = items.reduce((m, x) => rank[x.adv.level] > rank[m] ? x.adv.level : m, "good");
  const cu = cur(c);
  const plat = x => `<span class="adv-p">${badge(x.name)}${esc(x.name)}</span>`;
  const row = ({ label, adv: a }) => { const R = a.R, unit = R.unit, rn = R.resName;
    let b = "";
    if (R.allSame) b += `<div class="adv-line"><span class="adv-k ${a.level === "bad" ? "bad" : "ok"}">نفس السعر</span>${R.ranked.map(plat).join("")}<span class="adv-v">${money(unit, R.ranked[0].cost, cu)}</span></div>`;
    else if (a.lows.length) {
      const lo = a.lows[0];
      b += `<div class="adv-line"><span class="adv-k ok">الأرخص</span>${a.lows.map(plat).join("")}<span class="adv-v">${money(unit, lo.cost, cu)}${a.lows.length === 1 ? `<span class="sep">·</span><bdi><b class="num">${fmt(lo.res)}</b> ${rn}</bdi>` : ""}</span></div>`;
      if (a.highs.length && a.ratio >= 1.3) { const hi = a.highs[0];
        b += `<div class="adv-line"><span class="adv-k ${a.ratio >= 2.5 ? "bad" : "warn"}">الأغلى</span>${a.highs.map(plat).join("")}<span class="adv-v">${money(unit, hi.cost, cu)}<span class="sep">·</span><bdi><b>${a.ratio >= 2 ? `أغلى ${fmt(a.ratio,1)} مرة` : `أغلى بـ ${fmt((a.ratio-1)*100)}%`}</b></bdi></span></div>`; }
    }
    if (a.zero.length) b += `<div class="adv-line"><span class="adv-k bad">من غير نتيجة</span>${a.zero.map(plat).join("")}<span class="adv-v">صرفت ${money("", a.zero.reduce((s2,z) => s2 + z.s, 0), cu, 0)} من غير ${rn === "أوردر" ? "أوردرات" : "تحويلات"}</span></div>`;
    if (a.T && a.lows[0] && a.lows[0].cost > a.T) b += `<div class="adv-tip bad">حتى أرخص منصة فوق التارجت (${money(unit, a.T, cu)})</div>`;
    else if (a.T && a.highs[0] && a.highs[0].cost > a.T) b += `<div class="adv-tip">${a.highs.map(h => esc(h.name)).join(" و ")} فوق التارجت (${money(unit, a.T, cu)})</div>`;
    if (a.suggest) b += `<div class="adv-tip">← فكّر تنقل جزء من ميزانية <b>${a.highs.map(h => esc(h.name)).join(" و ")}</b> لـ <b>${a.lows.map(l => esc(l.name)).join(" أو ")}</b></div>`;
    return `<div class="adv-row lv-${a.level}"><div class="adv-when"><span class="adv-dot"></span>${label}</div><div class="adv-body">${b}</div></div>`; };
  return `<div class="adv-box lv-${top}">${items.map(row).join("")}</div>`;
}
function bestYesterday(c){ if (!M[c.id] || !canSeeNumbers(c.id)) return null; const y = addDaysK(todayK(), -1); return platformAdvice(c, M[c.id].filter(r => r.d === y), "امبارح"); }
function platformCards(c, rows){
  const R = platformRank(c, rows); if (!R.list.length) return "";
  const cu = cur(c), order = R.list.slice().sort((a,b) => (a.cost == null) - (b.cost == null) || (a.cost ?? 0) - (b.cost ?? 0) || b.s - a.s);
  return `<div class="pgrid">${order.map(x => { const isB = R.lows.includes(x), isW = R.highs.includes(x);
    return `<div class="pcard${isB ? " best" : ""}${isW ? " worst" : ""}">
      <div class="pc-top">${badge(x.name)}<b>${esc(x.name)}</b><span class="spacer"></span>${isB ? `<span class="chip ok">الأرخص</span>` : isW ? `<span class="chip warn">الأغلى</span>` : ""}</div>
      ${isAdmin() && !window.__noOwner && platformOwner(c, x.name) ? `<div class="pc-own">${avatar(platformOwner(c, x.name), 16)} ${esc(String(personName(platformOwner(c, x.name))).split(" ")[0])}</div>` : ""}
      <div class="pc-main"><span class="pc-l">${R.unit}</span><span class="pc-v num">${x.cost != null ? fmt2(x.cost) : x.s ? "مفيش " + R.resName : "—"}</span>${x.cost != null ? `<span class="pc-u">${cu}</span>` : ""}</div>
      <div class="pc-kv"><div><span>الصرف</span><b class="num">${fmt(x.s)}</b></div><div><span>${R.resName === "أوردر" ? "أوردرات" : "تحويلات"}</span><b class="num">${fmt(x.res)}</b></div><div><span>من الصرف</span><b class="num">${R.total ? fmt(x.s/R.total*100) : 0}%</b></div></div>
    </div>`; }).join("")}</div>`;
}
function dayDetail(c, d, dr){
  const date = fmtDate(fromKey(d));
  if (!dr.length) return `<div class="det"><div class="row"><h3>${date}</h3></div><div class="small muted" style="margin-top:4px">لسه مفيش أرقام لليوم ده.</div><button class="btn primary sm" style="margin-top:10px" onclick="openEntry('${c.id}','${d}')">✍️ سجّل أرقام اليوم ده</button></div>`;
  const ad = adRows(dr), a = agg(c.type === "store" ? dr : ad), adv = platformAdvice(c, dr, "في اليوم ده");
  let h = `<div class="det"><div class="row"><h3>تفاصيل ${date}</h3><span class="spacer"></span><button class="btn sm" onclick="openEntry('${c.id}','${d}')">✏️ تعديل الأرقام</button></div>`;
  if (c.type === "store" && window.__slice) h += `<div class="kv"><div>الصرف<b>${fmt(a.s)} ${cur(c)}</b></div><div>الأوردرات (حسب المنصات)<b>${fmt(a.po)}</b></div><div>CPP<b>${a.po ? fmt2(a.s/a.po) + " " + cur(c) : "—"}</b></div></div>`;
  else if (c.type === "store") h += `<div class="kv"><div>الصرف<b>${fmt(a.s)} ${cur(c)}</b></div><div>المبيعات<b>${fmt(a.sl)} ${cur(c)}</b></div><div>ROAS<b>${a.sl ? fmt2(a.roas) : "—"}</b></div><div>الأوردرات<b>${fmt(a.o)}</b></div><div>CPP<b>${a.cpp != null ? fmt2(a.cpp) + " " + cur(c) : "—"}</b></div><div>AOV<b>${a.aov != null ? fmt(a.aov) + " " + cur(c) : "—"}</b></div></div>`;
  else { const bk = agg(dr.filter(r => r.p === "_bk")); h += `<div class="kv"><div>الصرف<b>${fmt(a.s)} ${cur(c)}</b></div><div>التحويلات<b>${fmt(a.conv)}</b></div><div>تكلفة التحويل<b>${a.cpl != null ? fmt2(a.cpl) + " " + cur(c) : "—"}</b></div><div>ليدز / رسائل / مكالمات<b>${fmt(a.ld)} / ${fmt(a.ms)} / ${fmt(a.ca)}</b></div>${bk.bk ? `<div>حجوزات فعلية<b>${fmt(bk.bk)}</b></div>` : ""}</div>`; }
  if (adv) h += adviceBox(c, [{ label:"اليوم ده", adv }]);
  h += `<div class="small muted" style="margin:14px 0 8px">المنصات في اليوم ده</div>` + platformCards(c, dr);
  if (c.type !== "store") { const D = deptsInUse(c, ad); if (D.length) { const DS = D.map(dp => ({ name:dp, color:"var(--accent)", ...agg(ad.filter(r => r.dep === dp)) })).filter(x => x.s > 0 || x.conv > 0); if (DS.length) h += `<div class="small muted" style="margin-top:14px">حسب القسم</div>` + bars(DS.sort((x,y) => y.s - x.s), a.s, c, x => ` · <b>${fmt(x.conv)}</b> تحويل · CPA <b>${x.cpl != null ? fmt2(x.cpl) : "—"}</b>`); } }
  return h + `</div>`;
}
function weekAdvice(c){
  if (!M[c.id]) return ""; const t = todayK(), rows = M[c.id].filter(r => r.d >= addDaysK(t,-7) && r.d <= addDaysK(t,-1));
  return adviceBox(c, [{ label:"امبارح", adv: bestYesterday(c) }, { label:"آخر 7 أيام", adv: platformAdvice(c, rows, "آخر 7 أيام") }]);
}

/* ================= Team results on client dashboard ================= */
function platformOwner(c, p){ const m = members.find(m => m.client_id === c.id && (m.platforms||[]).includes(p)); return m ? m.user_id : null; }
function teamSlices(c){
  const ms = members.filter(m => m.client_id === c.id && (m.platforms||[]).length);
  if (!ms.length) return [];
  const taken = new Set(ms.flatMap(m => m.platforms));
  const mine = plats(c).map(p => p.name).filter(p => !taken.has(p));
  const out = ms.map(m => ({ id:m.user_id, name:personName(m.user_id), platforms:m.platforms }));
  if (mine.length) out.unshift({ id:me.id, name:"انت", platforms:mine, self:true });
  return out;
}
const sliceRows = (rows, sl) => adRows(rows).filter(r => sl.platforms.includes(r.p));
function teamBlock(c, ym, rows, prev){
  const S = teamSlices(c); if (!S.length) return "";
  const store = c.type === "store", cu = cur(c), total = agg(adRows(rows)).s;
  const L = S.map(sl => { const R = sliceRows(rows, sl), x = agg(R), px = agg(sliceRows(prev, sl));
    const res = store ? x.po : x.conv, cost = res ? x.s / res : null, pres = store ? px.po : px.conv, pcost = pres ? px.s / pres : null;
    const byDays = new Set(R.filter(r => r.by === sl.id).map(r => r.d)), last = R.filter(r => r.by === sl.id).map(r => r.d).sort().pop();
    const pend = R.filter(r => r.reviewed === false).length;
    return { ...sl, x, res, cost, pcost, byDays:byDays.size, last, pend }; });
  const ranked = L.filter(l => l.cost != null), best = ranked.length > 1 ? ranked.reduce((a,b) => b.cost < a.cost ? b : a) : null;
  const unit = store ? "CPP" : "CPA", resName = store ? "أوردر" : "تحويل", sel = (ui.pf||{})[c.id] || "";
  let h = `<div class="section-title" style="margin-bottom:0"><h3>نتايج الفريق</h3><span class="tiny muted">كل واحد على المنصات اللي ماسكها، الشهر ده</span><span class="spacer"></span>
    <span class="tiny muted">الداشبورد تعرض:</span><div class="seg"><button class="${!sel?"on":""}" onclick="setPf('${c.id}','')">الكل</button>${S.map(s => `<button class="${sel===s.id?"on":""}" onclick="setPf('${c.id}','${s.id}')">${esc(s.self ? "انت" : String(s.name).split(" ")[0])}</button>`).join("")}</div></div>
  <div class="pgrid" style="margin-bottom:16px">${L.map(l => { const isB = best && best.id === l.id;
    const dl = l.cost != null && l.pcost ? (l.cost - l.pcost) / l.pcost * 100 : null;
    return `<div class="pcard tm${isB ? " best" : ""}${sel === l.id ? " sel" : ""}" onclick="setPf('${c.id}','${sel === l.id ? "" : l.id}')" style="cursor:pointer">
      <div class="pc-top">${avatar(l.id, 26)}<b>${esc(l.name)}</b><span class="spacer"></span>${isB ? `<span class="chip ok">🏆 أرخص ${unit}</span>` : ""}</div>
      <div class="tiny muted" style="margin:2px 0 8px">${l.platforms.map(p => `<span class="pname" style="margin-left:8px">${badge(p)} ${esc(p)}</span>`).join("")}</div>
      <div class="pc-main"><span class="pc-l">${unit}</span><span class="pc-v num">${l.cost != null ? fmt2(l.cost) : l.x.s ? "مفيش " + resName : "—"}</span>${l.cost != null ? `<span class="pc-u">${cu}</span>` : ""}</div>
      ${dl != null ? `<div class="d ${dl <= 0 ? "up" : "down"}" style="font-size:12px">${dl <= 0 ? "▼" : "▲"} ${fmt(Math.abs(dl))}% عن الشهر اللي فات</div>` : ""}
      <div class="pc-kv"><div><span>الصرف</span><b class="num">${fmt(l.x.s)}</b></div><div><span>${store ? "أوردرات" : "تحويلات"}</span><b class="num">${fmt(l.res)}</b></div><div><span>من الصرف</span><b class="num">${total ? fmt(l.x.s/total*100) : 0}%</b></div></div>
      <div class="tiny muted" style="margin-top:8px">${l.self ? "" : l.byDays ? `سجّل ${fmt(l.byDays)} يوم الشهر ده · آخر مرة ${fmtDate(fromKey(l.last))}` : "لسه ماسجّلش أرقام الشهر ده"}${l.pend ? ` · <span style="color:var(--warn)">${l.pend} محتاجة مراجعة</span>` : ""}</div>
    </div>`; }).join("")}</div>`;
  return h;
}
function setPf(cid, pid){ ui.pf = ui.pf || {}; if (pid) ui.pf[cid] = pid; else delete ui.pf[cid]; ui.selDay = null; saveUi(); render(); }
function personDash(c, ym, rows, prev, sl, opt){
  opt = opt || {};
  const R = sliceRows(rows, sl), PR = sliceRows(prev, sl), x = agg(R), px = agg(PR), store = c.type === "store", cu = cur(c);
  const total = agg(adRows(rows)).s, res = store ? x.po : x.conv, pres = store ? px.po : px.conv, cost = res ? x.s/res : null, pcost = pres ? px.s/pres : null;
  let h = `<div class="stats">`; h += `
    <div class="stat"><div class="l">الصرف${opt.noShare ? "" : ` · ${total ? fmt(x.s/total*100) : 0}% من صرف العميل`}</div><div class="n">${fmt(x.s)} <span class="small muted">${cu}</span></div>${deltaHtml(x.s, px.s, true)}</div>
    <div class="stat"><div class="l">${store ? "الأوردرات (حسب المنصات)" : `التحويلات · ليدز ${fmt(x.ld)} · رسائل ${fmt(x.ms)} · مكالمات ${fmt(x.ca)}`}</div><div class="n">${fmt(res)}</div>${deltaHtml(res, pres, true)}</div>
    <div class="stat"><div class="l">${store ? "CPP" : "تكلفة التحويل"}</div><div class="n">${cost != null ? `<span class="hl">${fmt2(cost)}</span>` : "—"} <span class="small muted">${cu}</span></div>${deltaHtml(cost, pcost, false)}</div></div>`;
  h += `<div class="section-title" style="margin-bottom:8px"><h3>المنصات في الشهر</h3></div>` + (window.__noOwner = true, platformCards(c, R)); window.__noOwner = false;
  const key = store ? "metricS" : "metricL", keep = ui[key];
  if (store && (!ui[key] || ui[key] === "roas" || ui[key] === "sl")) ui[key] = "cpp";
  window.__slicePl = sl.platforms; window.__slice = true; window.__noOwner = true; try { if (!opt.noCal) h += calendar(c, ym, R); } finally { window.__slice = false; window.__noOwner = false; } ui[key] = keep;
  return h;
}


/* ================= Member client view ================= */
function memberClientView(c, ym, see, mp){
  const myT = tasks.filter(t => t.clientId === c.id && t.assigneeId === me.id);
  const tasksHtml = `<div class="section-title"><h3>تاسكاتك على العميل ده (${myT.length})</h3></div><div class="card">${myT.map(t => `<div class="task"><div class="t"><div class="title">${esc(t.title)}</div><div class="meta">${esc(repeatText(t))}</div></div></div>`).join("") || `<div class="small muted">مفيش.</div>`}</div>`;
  if (!see && !mp.length) return filesBlock(c) + tasksHtml;
  let h = `<div class="row" style="margin:6px 0 12px"><div class="monthnav"><button class="btn sm" onclick="ui.month=ymAdd(ui.month,1);ui.selDay=null;saveUi();render()" aria-label="الشهر اللي بعده">›</button><div class="m">${monthLabel(ym)}</div><button class="btn sm" onclick="ui.month=ymAdd(ui.month,-1);ui.selDay=null;saveUi();render()" aria-label="الشهر اللي قبله">‹</button></div><span class="spacer"></span><button class="btn xs" onclick="loadMetrics('${c.id}',true)">↻ تحديث</button></div>`;
  if (!M[c.id]) return h + `<div class="card empty">بيحمّل الأرقام…</div>`;
  const rows = monthRows(c.id, ym), prev = monthRows(c.id, ymAdd(ym,-1));
  if (!ui.selDay || !ui.selDay.startsWith(ym)) { const dd = rows.map(r => r.d).sort(); ui.selDay = dd.length ? dd[dd.length-1] : null; }
  if (mp.length) {
    const sl = { id:me.id, name:me.name || "انت", platforms:mp };
    if (!sliceRows(rows, sl).length) h += `<div class="section-title" style="margin-top:4px"><h3>${avatar(me.id, 24)} نتايجك</h3></div><div class="card small muted">لسه مفيش أرقام لـ ${mp.map(esc).join(" و ")} في ${monthLabel(ym)}. سجّلها من زرار "سجّل أرقام" فوق.</div>`;
    else h += personDash(c, ym, rows, prev, sl, { member:true, see, noCal:see });
  }
  if (see) {
    const adm = profiles.find(p => p.role === "admin");
    h += `<div class="section-title" style="margin-top:26px;padding-top:18px;border-top:1px solid var(--line)"><h3>${adm ? avatar(adm.id, 24) : ""} نتايج العميل كلها</h3><span class="tiny muted">من داشبورد ${esc(adm ? (adm.name || "زياد") : "زياد")}: كل المنصات والمبيعات والتوتال</span></div>`;
    const a = agg(rows);
    let full = c.type === "store" ? storeDash2(c, ym, rows, a, agg(prev)) : leadsDash2(c, ym, rows, agg(adRows(rows)), agg(adRows(prev)));
    if (mp.length) full = full.replace('<span class="hl">', '<span>');
    full = full.replace(/<button class="btn xs ghost" style="padding:0 4px" onclick="openSalesTarget\([^)]*\)">[^<]*<\/button>/g, "");
    h += full;
  }
  return h + filesBlock(c) + tasksHtml;
}

/* ================= Client files ================= */
const FILES = {};
async function loadFiles(cid){ try { FILES[cid] = await q(sb.from("client_files").select("*").eq("client_id", cid).order("created_at", { ascending:false }), "files"); } catch(e){ FILES[cid] = []; } render(); }
const fileIcon = n => { const e = String(n).split(".").pop().toLowerCase(); return /^(png|jpe?g|gif|webp|svg|heic)$/.test(e) ? "🖼️" : /^(mp4|mov|avi|webm|mkv)$/.test(e) ? "🎬" : e === "pdf" ? "📕" : /^(xlsx?|csv)$/.test(e) ? "📊" : /^(docx?|txt)$/.test(e) ? "📄" : /^(pptx?|key)$/.test(e) ? "📽️" : /^(zip|rar|7z)$/.test(e) ? "🗜️" : "📎"; };
const fsize = b => !b ? "" : b > 1048576 ? fmt(b/1048576, 1) + " MB" : fmt(Math.max(1, b/1024)) + " KB";
function filesBlock(c){
  if (!canFiles(c.id)) return "";
  if (!(c.id in FILES)) { FILES[c.id] = null; loadFiles(c.id); }
  const L = FILES[c.id];
  let h = `<div class="section-title"><h3>ملفات العميل${L && L.length ? ` (${L.length})` : ""}</h3><span class="tiny muted">لينكات درايف واسم كل ملف. أي حد على العميل يقدر يضيف ويعدّل، والتعديل بيتحفظ لوحده.</span></div>`;
  if (L === null) return h + `<div class="card empty">بيحمّل…</div>`;
  const row = f => `<div class="flink">
      <span class="fl-ic">${f.url ? "🔗" : fileIcon(f.name)}</span>
      <input class="inp fl-name" value="${esc(f.name)}" placeholder="اسم الملف (مثلاً: لوجو المتجر)" onchange="editFile('${f.id}','name',this)">
      ${f.url != null || !f.path ? `<input class="inp fl-url" dir="ltr" value="${esc(f.url || "")}" placeholder="https://drive.google.com/..." onchange="editFile('${f.id}','url',this)">` : `<span class="fl-url tiny muted">ملف مرفوع</span>`}
      ${f.url ? `<a class="btn xs" href="${esc(normUrl(f.url))}" target="_blank" rel="noopener">افتح ↗</a>` : f.path ? `<button class="btn xs" onclick="openClientFile('${f.id}')">⬇️ تحميل</button>` : ""}
      ${isAdmin() || f.uploaded_by === me.id ? `<button class="btn xs ghost" onclick="delFile('${f.id}')" aria-label="امسح">🗑</button>` : `<span style="width:30px"></span>`}
      <span class="fl-who tiny muted">${avatar(f.updated_by || f.uploaded_by, 16)} ${esc(personName(f.updated_by || f.uploaded_by))}${(f.updated_at || f.created_at) ? " · " + fmtDate(new Date(f.updated_at || f.created_at)) : ""}${f.updated_by ? " (آخر تعديل)" : ""}</span>
    </div>`;
  return h + `<div class="card" style="padding:10px 16px">${L.map(row).join("") || `<div class="small muted" style="padding:4px 0 10px">مفيش ملفات لسه. حط لينك الدرايف واسمه تحت.</div>`}
    <div class="flink fl-new"><span class="fl-ic">➕</span>
      <input class="inp fl-name" id="nfName_${c.id}" placeholder="اسم الملف (مثلاً: صور المنتجات)">
      <input class="inp fl-url" id="nfUrl_${c.id}" dir="ltr" placeholder="حط لينك الدرايف هنا" onkeydown="if(event.key==='Enter')addFileLink('${c.id}')">
      <button class="btn xs primary" onclick="addFileLink('${c.id}')">ضيف</button></div></div>`;
}
async function addFileLink(cid){
  const n = $("#nfName_" + cid), u = $("#nfUrl_" + cid), url = u.value.trim(); let name = n.value.trim();
  if (!url) { u.focus(); return toast("حط اللينك الأول"); }
  if (!name) name = /drive\.google|docs\.google/.test(url) ? "ملف درايف" : "لينك";
  try { await q(sb.from("client_files").insert({ client_id:cid, name, url, uploaded_by:me.id }), "addlink"); toast("اتضاف ✓"); loadFiles(cid); }
  catch(e){ toast("ماتضافش: " + (e.message || e)); }
}
async function editFile(id, field, el){
  const f = Object.values(FILES).flat().find(x => x && x.id === id); if (!f) return;
  const v = el.value.trim(); if (field === "name" && !v) { el.value = f.name; return; }
  const patch = { [field]: v, updated_by: me.id, updated_at: new Date().toISOString() };
  try { await q(sb.from("client_files").update(patch).eq("id", id), "editfile"); Object.assign(f, patch); toast("اتحفظ ✓"); render(); }
  catch(e){ el.value = f[field] || ""; toast("ماتحفظش: " + (e.message || e)); }
}
async function uploadFiles(cid, input){
  const fs = [...(input.files || [])]; if (!fs.length) return;
  let ok = 0;
  for (const f of fs) {
    toast(`بيرفع ${f.name}…`);
    const ext = (f.name.includes(".") ? f.name.split(".").pop() : "bin").replace(/[^a-z0-9]/gi, "").slice(0, 8) || "bin";
    const path = `${cid}/${crypto.randomUUID()}.${ext}`;
    try {
      const { error } = await sb.storage.from("client-files").upload(path, f, { contentType: f.type || undefined });
      if (error) throw error;
      await q(sb.from("client_files").insert({ client_id:cid, name:f.name, path, size:f.size, uploaded_by:me.id }), "fileins");
      ok++;
    } catch(e){ toast(`${f.name} ماترفعش: ${/exceeded|too large|413/i.test(String(e.message)) ? "الملف كبير أوي (الحد 50 ميجا)" : e.message}`); }
  }
  input.value = ""; if (ok) toast(`اترفع ${ok} ${ok === 1 ? "ملف" : "ملفات"} ✓`);
  loadFiles(cid);
}
async function openClientFile(id){
  const f = Object.values(FILES).flat().find(x => x && x.id === id); if (!f) return;
  const { data, error } = await sb.storage.from("client-files").createSignedUrl(f.path, 120, { download: f.name });
  if (error) return toast("مش عارف أفتحه: " + error.message);
  const a = document.createElement("a"); a.href = data.signedUrl; a.rel = "noopener"; document.body.appendChild(a); a.click(); a.remove();
}
function delFile(id){ const f = Object.values(FILES).flat().find(x => x && x.id === id); if (!f) return;
  openModal(`<h2>تمسح «${esc(f.name)}»؟</h2><p class="small muted">هيتمسح من عند الكل.</p><div class="actions"><span class="spacer"></span><button class="btn" onclick="closeModal()">لا</button><button class="btn primary" style="background:var(--danger);border-color:var(--danger)" onclick="doDelFile('${id}')">امسح</button></div>`); }
async function doDelFile(id){ const f = Object.values(FILES).flat().find(x => x && x.id === id); if (!f) return;
  try { await sb.storage.from("client-files").remove([f.path]); await q(sb.from("client_files").delete().eq("id", id), "filedel"); closeModal(); toast("اتمسح"); loadFiles(f.client_id); } catch(e){ toast("ماتمسحش: " + e.message); } }


/* ================= Inline permissions ================= */
const PERM_HELP = { plat:"المنصات اللي يسجّل أرقامها", nums:"يشوف نتايج العميل كلها (المبيعات والتوتال وكل المنصات)", files:"يشوف لينكات وملفات العميل ويرفع ملفات" };
function permRow(m, c, label){
  const head = label === "client" ? `<b>${esc(c.name)}</b>` : `${avatar(m.user_id, 22)} <b>${esc(personName(m.user_id))}</b> <span class="tiny muted">${esc((profileById(m.user_id)||{}).job || "")}</span>`;
  const P = plats(c);
  return `<div class="perm">
    <div class="perm-h">${head}</div>
    <div class="perm-o">
      ${P.length && (((profileById(m.user_id)||{}).job === "Media Buyer") || (m.platforms||[]).length) ? `<span class="perm-g" title="${PERM_HELP.plat}"><span class="tiny muted">يسجّل أرقام:</span>${P.map(pp => { const on = (m.platforms||[]).includes(pp.name); return `<button class="ptog${on ? " on" : ""}" title="${esc(pp.name)}" onclick="togPerm('${c.id}','${m.user_id}','plat','${jsq(pp.name)}')">${badge(pp.name)}</button>`; }).join("")}</span>` : ""}
      <label class="perm-c" title="${PERM_HELP.nums}"><input type="checkbox" ${m.see_numbers ? "checked" : ""} onchange="togPerm('${c.id}','${m.user_id}','see_numbers')"> يشوف نتايج العميل كلها</label>
      <label class="perm-c" title="${PERM_HELP.files}"><input type="checkbox" ${m.see_files ? "checked" : ""} onchange="togPerm('${c.id}','${m.user_id}','see_files')"> الملفات</label>
      ${label !== "client" ? `<button class="btn xs ghost" title="شيله من العميل ده" onclick="unassign('${c.id}','${m.user_id}')">✕</button>` : ""}
    </div></div>`;
}
async function togPerm(cid, uid, what, val){
  const m = members.find(x => x.client_id === cid && x.user_id === uid); if (!m) return;
  const patch = {};
  if (what === "plat") { const ps = (m.platforms||[]).includes(val) ? m.platforms.filter(x => x !== val) : [...(m.platforms||[]), val]; patch.platforms = ps; }
  else patch[what] = !m[what];
  const old = { ...m }; Object.assign(m, patch); render();
  try { await q(sb.from("client_members").update(patch).eq("client_id", cid).eq("user_id", uid), "perm"); toast("اتحفظ ✓"); }
  catch(e){ Object.assign(m, old); render(); toast("ماتحفظش: " + (e.message || e)); }
}
async function assign(cid, sel){
  const uid = sel.value; if (!uid) return;
  try { await q(sb.from("client_members").upsert({ client_id:cid, user_id:uid, platforms:[], see_numbers:false, see_files:false }), "assign"); await loadAll(); render(); toast("اتضاف ✓ — اختار هو يعمل إيه"); }
  catch(e){ toast("ماتضافش: " + (e.message || e)); }
}
async function unassign(cid, uid){
  try { await q(sb.from("client_members").delete().eq("client_id", cid).eq("user_id", uid), "unassign"); await loadAll(); render(); toast("اتشال من العميل"); }
  catch(e){ toast("ماتشالش: " + (e.message || e)); }
}
function clientTeamCard(c){
  const ms = members.filter(m => m.client_id === c.id), free = profiles.filter(p => p.id !== me.id && p.active && !ms.some(m => m.user_id === p.id));
  return `<div class="card perm-card" style="margin-bottom:12px"><div class="row" style="margin-bottom:${ms.length ? 6 : 0}px"><h3 style="margin:0;font-size:15px">الفريق على العميل ده</h3><span class="tiny muted">مين شغال، وبيعمل إيه ويشوف إيه. التغيير بيتحفظ على طول.</span><span class="spacer"></span>
    ${free.length ? `<select class="inp" style="width:auto;padding:4px 8px;font-size:13px" onchange="assign('${c.id}', this)"><option value="">+ ضيف حد من الفريق</option>${free.map(p => `<option value="${p.id}">${esc(p.name || p.email)} · ${esc(p.job || "")}</option>`).join("")}</select>` : ""}</div>
    ${ms.length ? ms.map(m => permRow(m, c, "member")).join("") : `<div class="small muted" style="margin-top:6px">انت بس اللي شغال عليه.</div>`}</div>`;
}

function fileChips(c){
  if (!canFiles(c.id)) return "";
  if (!(c.id in FILES)) { FILES[c.id] = null; loadFiles(c.id); }
  const L = (FILES[c.id] || []).filter(f => f.url);
  if (!L.length) return "";
  return `<div class="links" style="margin-bottom:10px">${L.slice(0, 8).map(f => `<a class="link" href="${esc(normUrl(f.url))}" target="_blank" rel="noopener" onclick="event.stopPropagation()">${esc(f.name)}</a>`).join("")}${L.length > 8 ? `<span class="tiny muted">+${L.length - 8}</span>` : ""}</div>`;
}


/* ================= Settings ================= */
function clientTeamLine(c){
  const ms = members.filter(m => m.client_id === c.id);
  return `<div class="row small muted" style="gap:8px;margin-bottom:12px">الفريق: ${ms.length ? ms.map(m => `<span class="pname">${avatar(m.user_id, 22)} ${esc(String(personName(m.user_id)).split(" ")[0])}${m.platforms.length ? ` <span class="tiny">(${m.platforms.map(esc).join("، ")})</span>` : ""}</span>`).join("") : "انت بس"}
    <a href="#" class="tiny" onclick="go('settings');ui.stab='clients';ui.sClient='${c.id}';render();return false">الصلاحيات ←</a></div>`;
}
function viewSettings(){
  const tabs = isAdmin() ? [["team","Team & Permissions"],["clients","Clients"],["sync","Backup & Sheets"],["account","Account"]] : [["account","Account"]];
  if (!tabs.some(t => t[0] === ui.stab)) ui.stab = tabs[0][0];
  let h = pageHead("Settings", isAdmin() ? "الفريق والصلاحيات، وإعدادات كل عميل، وحسابك" : "حسابك") +
    `<div class="stabs">${tabs.map(([k,l]) => `<button class="${ui.stab === k ? "on" : ""}" onclick="ui.stab='${k}';saveUi();render()">${l}</button>`).join("")}</div>`;
  if (ui.stab === "team") h += viewTeam();
  else if (ui.stab === "clients") h += settingsClients();
  else if (ui.stab === "sync") h += settingsSync();
  else h += settingsAccount();
  return h;
}
function settingsClients(){
  const list = clients.slice().sort((a,b) => (a.is_test - b.is_test) || (a.status === "paused") - (b.status === "paused") || a.name.localeCompare(b.name, "ar"));
  let h = `<div class="row" style="margin-bottom:12px"><h2>العملاء</h2><span class="small muted">العملة، والمنصات، والتارجت، ومين شغال على كل عميل</span><span class="spacer"></span><button class="btn primary sm" onclick="openSettings()">+ عميل جديد</button></div>`;
  h += list.map(c => { const open = ui.sClient === c.id, ms = members.filter(m => m.client_id === c.id);
    return `<div class="card scl${open ? " open" : ""}" id="scl_${c.id}">
      <div class="scl-h" onclick="ui.sClient=${open ? "null" : `'${c.id}'`};render()">
        ${clientLogo(c, 30)}<b>${esc(c.name)}</b>
        <span class="chip grey">${c.type === "store" ? "متجر" : "ليدز"}</span><span class="chip grey">${esc(c.currency || "SAR")}</span>
        ${c.status === "paused" ? `<span class="chip warn">متوقف</span>` : ""}
        <span class="scl-p">${plats(c).map(p => badge(p.name)).join("")}</span>
        <span class="spacer"></span>
        <span class="scl-av">${ms.map(m => avatar(m.user_id, 22)).join("")}</span>
        <span class="tiny muted">${open ? "▲" : "▼"}</span></div>
      ${open ? `<div class="scl-b">
        <div class="kvs">
          <div><span>العملة</span><b>${esc(c.currency || "SAR")}${(c.usd_rate && c.usd_rate !== 1) ? ` · الدولار = ${fmt2(c.usd_rate)}` : ""}</b></div>
          <div><span>المنصات</span><b>${plats(c).map(p => esc(p.name) + (p.cur !== c.currency ? ` (${esc(p.cur)})` : "")).join("، ") || "—"}</b></div>
          ${c.type === "store" ? `<div><span>التارجت</span><b>${[c.targets?.sales ? "مبيعات " + fmt(c.targets.sales) : "", c.targets?.minRoas ? "ROAS " + fmt2(c.targets.minRoas) : "", c.targets?.maxCpp ? "CPP " + fmt2(c.targets.maxCpp) : ""].filter(Boolean).join(" · ") || "—"}</b></div>` : `<div><span>الأقسام</span><b>${(c.depts||[]).map(esc).join("، ") || "—"}</b></div><div><span>التارجت</span><b>${c.targets?.cpl ? "CPA " + fmt2(c.targets.cpl) : "—"}</b></div>`}
        </div>
        <div class="row" style="margin:12px 0 4px;gap:10px">${clientLogo(c, 56, true)}<div><b>لوجو العميل</b><div class="row" style="gap:6px;margin-top:4px"><button class="btn xs" onclick="pickClientLogo('${c.id}')">${c.logo_url ? "غيّر اللوجو" : "+ ارفع لوجو"}</button>${c.logo_url ? `<button class="btn xs ghost" onclick="removeLogo('${c.id}')">شيله</button>` : ""}</div></div></div>
        <div class="row" style="margin:10px 0 4px"><button class="btn sm primary" onclick="openSettings('${c.id}')">✏️ عدّل العميل (العملة، المنصات، التارجت…)</button><button class="btn sm" onclick="go('client','${c.id}')">افتح الداشبورد</button></div>
        ${c.type === "leads" ? leadSheetEditor(c) : ""}
        ${clientTeamCard(c)}
      </div>` : ""}
    </div>`; }).join("");
  return h;
}
function settingsAccount(){
  return `<div class="card" style="max-width:520px">
    <div class="row" style="margin-bottom:6px">${avatar(me.id, 44)}<div><b>${esc(me.name || "")}</b><div class="tiny muted" dir="ltr">${esc(me.email || "")}</div></div></div>
    <label class="f">اسمك</label><input class="inp" id="acName" value="${esc(me.name||"")}">
    <label class="f">باسورد جديد (اختياري)</label><input class="inp" id="acPass" type="password" autocomplete="new-password" placeholder="8 حروف على الأقل">
    <div class="actions"><button class="btn danger sm" onclick="signOut()">تسجيل خروج</button><span class="spacer"></span><button class="btn primary" onclick="saveAccount()">حفظ</button></div></div>`;
}


/* ================= Client page: side views (Total / each person / files / tasks) ================= */
function clientViews(c, see, mp){
  const R = [], O = [];
  if (isAdmin()) {
    R.push({ k:"total", l:"Total", sub:"العميل كله" });
    for (const sl of teamSlices(c)) R.push({ k:sl.id, l: sl.self ? "انت" : String(sl.name).split(" ")[0], sub: sl.platforms.join("، "), sl, av:sl.id });
  } else {
    if (mp.length) R.push({ k:"me", l:"نتايجي", sub: mp.join("، "), sl:{ id:me.id, name:me.name || "انت", platforms:mp, self:true }, av:me.id });
    if (see) R.push({ k:"total", l:"Total", sub:"العميل كله" });
  }
  if (canFiles(c.id)) O.push({ k:"files", l:"Files", sub:"لينكات وملفات العميل" });
  O.push({ k:"deliv", l:"Deliveries", sub: isAdmin() ? "التسليمات اللي اتعملت" : "تسليماتك على العميل" });
  O.push({ k:"tasks", l:"Tasks", sub: isAdmin() ? "كل مهام العميل" : "تاسكاتك على العميل" });
  return { R, O };
}
function sliceMetric(c, sl, ym){
  if (!M[c.id]) return "";
  const x = agg(sl ? sliceRows(monthRows(c.id, ym), sl) : adRows(monthRows(c.id, ym)));
  if (c.type === "store" && !sl) { const a = agg(monthRows(c.id, ym)); return a.sl ? `ROAS ${fmt2(a.roas)}` : ""; }
  const res = c.type === "store" ? x.po : x.conv; return res ? `${c.type === "store" ? "CPP" : "CPA"} ${fmt2(x.s/res)}` : "";
}
function clientBody(c, ym, see, mp){
  const { R, O } = clientViews(c, see, mp), all = [...R, ...O];
  ui.cv = ui.cv || {};
  let k = ui.cv[c.id]; if (!all.some(v => v.k === k)) k = (R[0] || O[0]).k;
  const v = all.find(x => x.k === k);
  const item = x => `<button class="${x.k === k ? "on" : ""}" onclick="ui.cv=ui.cv||{};ui.cv['${c.id}']='${x.k}';ui.selDay=null;saveUi();render()">
      ${x.av ? avatar(x.av, 22) : `<span class="cv-ic">${x.k === "total" ? "Σ" : x.k === "files" ? "⌗" : x.k === "deliv" ? "↗" : "✓"}</span>`}
      <span class="cv-t"><b>${esc(x.l)}</b><span>${esc(x.sub)}</span></span>
      ${R.includes(x) ? `<span class="cv-m">${sliceMetric(c, x.sl, ym)}</span>` : ""}</button>`;
  const nav = `<nav class="cnav">${R.length ? `<div class="cnav-l">Results</div>${R.map(item).join("")}` : ""}<div class="cnav-l">Client</div>${O.map(item).join("")}</nav>`;
  return `<div class="cvw">${nav}<div class="cvbody">${clientPanel(c, ym, v, see, mp)}</div></div>`;
}
function pickDay(v){ if (!v) return; ui.month = v.slice(0,7); ui.selDay = v; saveUi(); render(); const c = clientById(ui.clientId); if (c) { const v2 = (ui.cv || {})[c.id]; openDay(c.id, v, v2 && v2 !== "total" ? 1 : 0); } }
function monthNav(c, ym){ return `<div class="row" style="margin:0 0 12px"><label class="daypick-btn" title="اختار يوم">📅 ${ui.selDay && ui.selDay.startsWith(ym) ? fmtDate(fromKey(ui.selDay)) : "اختار يوم"}<input type="date" value="${ui.selDay || ""}" max="${todayK()}" onclick="try{this.showPicker()}catch(e){}" onchange="pickDay(this.value)"></label><div class="monthnav"><button class="btn sm" onclick="ui.month=ymAdd(ui.month,1);ui.selDay=null;saveUi();render()" aria-label="الشهر اللي بعده">›</button><div class="m">${monthLabel(ym)}</div><button class="btn sm" onclick="ui.month=ymAdd(ui.month,-1);ui.selDay=null;saveUi();render()" aria-label="الشهر اللي قبله">‹</button></div><span class="spacer"></span><button class="btn xs" onclick="loadMetrics('${c.id}',true)">↻ تحديث</button></div>`; }
function sliceAdvice(c, sl){
  if (!M[c.id] || sl.platforms.length < 2) return "";
  const t = todayK(), r7 = sliceRows(M[c.id].filter(r => r.d >= addDaysK(t,-7) && r.d <= addDaysK(t,-1)), sl), ry = sliceRows(M[c.id].filter(r => r.d === addDaysK(t,-1)), sl);
  return adviceBox(c, [{ label:"امبارح", adv: platformAdvice(c, ry, "امبارح") }, { label:"آخر 7 أيام", adv: platformAdvice(c, r7, "آخر 7 أيام") }]);
}
function clientPanel(c, ym, v, see, mp){
  const head = (t, sub, av) => `<div class="cv-head">${av ? avatar(av, 30) : ""}<div><h2>${t}</h2>${sub ? `<div class="ph-sub">${sub}</div>` : ""}</div></div>`;
  if (v.k === "files") return head("Files", "لينكات درايف وملفات العميل، وأي حد على العميل يقدر يضيف ويعدّل") + filesBlock(c).replace(/^<div class="section-title">[\s\S]*?<\/div>/, "");
  if (v.k === "deliv") return head("Deliveries", "كل اللي اتسلّم على العميل ده: اللينكات والملفات، مين سلّمها وإمتى") + delivBlock(c);
  if (v.k === "tasks") {
    const ct = isAdmin() ? tasks.filter(t => t.clientId === c.id) : tasks.filter(t => t.clientId === c.id && t.assigneeId === me.id);
    let h = head("Tasks", isAdmin() ? `${ct.length} مهمة على العميل ده` : "التاسكات المسنودة عليك") + (isAdmin() ? `<div class="row" style="margin-bottom:10px"><span class="spacer"></span><button class="btn sm primary" onclick="openTask(null,{clientId:'${c.id}'})">+ مهمة</button></div>` : "");
    h += `<div class="card">${ct.map(t => `<div class="task"><div class="t"><div class="title">${esc(t.title)} ${t.paused ? `<span class="chip grey">متوقفة</span>` : ""}</div><div class="meta">${isAdmin() ? (t.assigneeId && t.assigneeId !== me.id ? `${avatar(t.assigneeId, 16)} ${esc(personName(t.assigneeId))} · ` : "انت · ") : ""}${esc(repeatText(t))}${t.needsReview ? " · محتاجة مراجعة" : ""}</div></div>${isAdmin() ? `<button class="btn ghost sm" onclick="openTask('${t.id}')">تعديل</button>` : ""}</div>`).join("") || `<div class="small muted">مفيش مهام.</div>`}</div>`;
    if (c.notes && isAdmin()) h += `<div class="section-title"><h3>ملاحظات</h3></div><div class="card small" style="white-space:pre-wrap">${esc(c.notes)}</div>`;
    return h;
  }
  if (!M[c.id]) return monthNav(c, ym) + `<div class="card empty">بيحمّل الأرقام…</div>`;
  const rows = monthRows(c.id, ym), prev = monthRows(c.id, ymAdd(ym,-1));
  if (!ui.selDay || !ui.selDay.startsWith(ym)) { const dd = rows.map(r => r.d).sort(); ui.selDay = dd.length ? dd[dd.length-1] : null; }
  const isCurMonth = ym === ymOf(addDaysK(todayK(), -1));
  if (v.k === "total") {
    let h = head("Total", `نتايج العميل كلها: كل المنصات${c.type === "store" ? " والمبيعات" : ""}`);
    if (isAdmin()) h += clientAlerts(c).map(x => `<div class="alert">⚠️ ${x}</div>`).join("");
    h += monthNav(c, ym);
    if (isCurMonth) h += weekAdvice(c);
    const a = agg(rows);
    let full = c.type === "store" ? storeDash2(c, ym, rows, a, agg(prev)) : leadsDash2(c, ym, rows, agg(adRows(rows)), agg(adRows(prev)));
    if (!isAdmin()) full = full.replace(/<button class="btn xs ghost" style="padding:0 4px" onclick="openSalesTarget\([^)]*\)">[^<]*<\/button>/g, "");
    return h + full;
  }
  const sl = v.sl;
  let h = head(esc(sl.self ? (isAdmin() ? "نتايجك انت" : "نتايجي") : sl.name), `${sl.platforms.map(esc).join("، ")} بس${c.type === "store" ? " · المبيعات والـ ROAS في Total" : ""}`, sl.id);
  h += monthNav(c, ym);
  if (!sliceRows(rows, sl).length) return h + `<div class="card small muted">لسه مفيش أرقام لـ ${sl.platforms.map(esc).join(" و ")} في ${monthLabel(ym)}.${(isAdmin() || mp.length) ? ` سجّلها من زرار "سجّل أرقام" فوق.` : ""}</div>`;
  if (isCurMonth) h += alertsHtml(sliceAlerts(c, sl)) + sliceAdvice(c, sl);
  if (isAdmin() && !sl.self) { const pend = sliceRows(rows, sl).filter(r => r.reviewed === false).length, byD = new Set(sliceRows(rows, sl).filter(r => r.by === sl.id).map(r => r.d)).size;
    h += `<div class="small muted" style="margin:-4px 0 10px">${byD ? `سجّل ${daysAr(byD)} في ${monthLabel(ym)}` : "لسه ماسجّلش أرقام الشهر ده"}${pend ? ` · <span style="color:var(--warn)">فيه أرقام مستنية مراجعتك</span>` : ""}</div>`; }
  return h + personDash(c, ym, rows, prev, sl, { noShare: !isAdmin() && !see });
}

const _metricDefs0 = metricDefs;
metricDefs = function(c, ad, rows){ const d = _metricDefs0(c, ad, rows); if (window.__slice && c.type === "store") { delete d.roas; delete d.sl; } return d; };

const _deltaHtml0 = deltaHtml;
deltaHtml = function(cur, prev, goodUp){ if (cur == null || prev == null || !prev) return ""; return _deltaHtml0(cur, prev, goodUp); };

const daysAr = n => n === 1 ? "يوم واحد" : n === 2 ? "يومين" : n <= 10 ? `${n} أيام` : `${n} يوم`;


/* ================= Deliveries archive per client ================= */
let DELIV = {};
async function loadDeliv(cid){
  const ids = tasks.filter(t => t.clientId === cid).map(t => t.id);
  if (!ids.length) { DELIV[cid] = []; return render(); }
  try { DELIV[cid] = await q(sb.from("task_status").select("*").in("task_id", ids).in("state", ["approved","submitted","returned"]).order("updated_at", { ascending:false }), "deliv"); }
  catch(e){ DELIV[cid] = []; }
  render();
}
function delivBlock(c){
  if (!(c.id in DELIV)) { DELIV[c.id] = null; loadDeliv(c.id); }
  const L = DELIV[c.id];
  if (L === null) return `<div class="card empty">بيحمّل…</div>`;
  const rows = L.filter(s => s.link || s.file_path || s.note);
  if (!rows.length) return `<div class="card small muted">لسه مفيش تسليمات على العميل ده. لما حد يسلّم تاسك هتلاقيه هنا، ولما تعتمده بيفضل محفوظ.</div>`;
  const ui2 = ui.dv = ui.dv || "all", f = ui2 === "all" ? rows : rows.filter(s => s.state === ui2);
  const cnt = st => rows.filter(s => s.state === st).length;
  const tag = st => st === "approved" ? `<span class="chip ok">اتعتمد</span>` : st === "submitted" ? `<span class="chip amb">مستني مراجعة</span>` : `<span class="chip warn">اترجع للتعديل</span>`;
  let h = `<div class="seg" style="margin-bottom:12px">${[["all",`الكل (${rows.length})`],["approved",`اتعتمد (${cnt("approved")})`],["submitted",`مستني (${cnt("submitted")})`],["returned",`اترجع (${cnt("returned")})`]].map(([k,l]) => `<button class="${ui2===k?"on":""}" onclick="ui.dv='${k}';render()">${l}</button>`).join("")}</div>`;
  h += `<div class="card" style="padding:4px 16px">${f.map(s => { const t = tasks.find(x => x.id === s.task_id) || {};
    return `<div class="dlv">
      <div class="row" style="gap:8px">${avatar(s.by_user, 24)}<b>${esc(t.title || "تاسك")}</b>${tag(s.state)}<span class="spacer"></span><span class="tiny muted">${esc(personName(s.by_user))} · ${fmtDate(fromKey(String(s.day).slice(0,10)))}</span></div>
      ${s.note ? `<div class="small" style="margin:6px 0 0;white-space:pre-wrap">${esc(s.note)}</div>` : ""}
      ${s.review_note && s.state === "returned" ? `<div class="small" style="margin-top:6px;color:var(--warn)">تعليقك: ${esc(s.review_note)}</div>` : ""}
      <div class="row" style="margin-top:8px;gap:8px">${s.link ? `<a class="btn xs" href="${esc(normUrl(s.link))}" target="_blank" rel="noopener">🔗 افتح اللينك</a><span class="tiny muted dlv-url" dir="ltr">${esc(s.link)}</span>` : ""}${s.file_path ? `<button class="btn xs" onclick="openFile('${esc(s.file_path)}')">📎 ${esc(s.file_name || "الملف")}</button>` : ""}
      ${isAdmin() && s.state === "submitted" ? `<span class="spacer"></span><button class="btn xs primary" onclick="approve('${s.task_id}','${String(s.day).slice(0,10)}')">✓ اعتمد</button>` : ""}</div>
    </div>`; }).join("") || `<div class="small muted" style="padding:12px 0">مفيش حاجة هنا.</div>`}</div>`;
  return h;
}


/* ================= My Tasks (team members) ================= */
function myTaskCard(t, dk, extra){
  const st = stOf(t, dk), state = st ? st.state : null, c = t.clientId ? clientById(t.clientId) : null;
  const closed = state === "done" || state === "approved";
  let action = "";
  if (t.kind === "metrics" && c && !closed) action = `<button class="btn sm primary" onclick="openEntry('${c.id}','${addDaysK(dk,-1)}','${t.id}','${dk}')">✍️ سجّل الأرقام</button>`;
  else if (t.needsReview && !closed && state !== "submitted") action = `<button class="btn sm primary" onclick="openSubmit('${t.id}','${dk}')">${state === "returned" ? "↩︎ سلّم تاني" : "سلّم ↑"}</button>`;
  else if (!t.needsReview) action = `<button class="btn sm ${closed ? "" : "primary"}" onclick="toggleDone('${t.id}','${dk}')">${closed ? "↺ رجّعها" : "✓ خلصت"}</button>`;
  const tag = state === "submitted" ? `<span class="chip amb">مستني مراجعة زياد</span>` : state === "approved" ? `<span class="chip ok">اتعتمد ✓</span>` : state === "done" ? `<span class="chip ok">خلصت ✓</span>` : state === "returned" ? `<span class="chip warn">اترجعتلك</span>` : "";
  return `<div class="mt${closed ? " done" : ""}${state === "returned" ? " ret" : ""}">
    <div class="mt-main">
      <div class="mt-top">${c ? `<span class="mt-client"><span class="cdot ${c.type}"></span>${esc(c.name)}</span>` : `<span class="mt-client">عام</span>`}${extra ? `<span class="tiny muted">${extra}</span>` : ""}${tag}</div>
      <div class="mt-title">${esc(t.title)}</div>
      ${t.brief ? `<div class="mt-brief">${esc(t.brief)}</div>` : ""}
      ${state === "returned" && st.review_note ? `<div class="mt-note">↩︎ تعليق زياد: ${esc(st.review_note)}</div>` : ""}
      ${(t.time || t.note) ? `<div class="tiny muted" style="margin-top:4px">${[t.time, t.note].filter(Boolean).map(esc).join(" · ")}</div>` : ""}
    </div>
    <div class="mt-act">${action}</div></div>`;
}
function viewMyTasks(){
  const tk = todayK(), dk = ui.date, VT = visibleTasks();
  const due = VT.filter(t => isDueOn(t, dk));
  const overdue = dk === tk ? overdueOnce(tk).filter(t => VT.includes(t)) : [];
  const returned = VT.filter(t => Object.values(ST).some(s => s.task_id === t.id && s.state === "returned"));
  const stateIn = t => stateOf(t, dk);
  const todo = due.filter(t => !isDone(t.id, dk) && stateIn(t) !== "returned" && !returned.includes(t));
  const waiting = due.filter(t => stateIn(t) === "submitted");
  const done = due.filter(t => stateIn(t) === "done" || stateIn(t) === "approved");
  const doneN = due.filter(t => isDone(t.id, dk)).length, pct = due.length ? Math.round(doneN / due.length * 100) : 0;
  const rel = dk === tk ? "النهارده" : dk === addDaysK(tk,1) ? "بكرة" : dk === addDaysK(tk,-1) ? "امبارح" : "";
  let h = pageHead("My Tasks", `أهلاً ${esc(String(me.name || "").split(" ")[0])} 👋`);
  h += `<div class="mt-bar">
    <div class="daynav"><button class="btn xs" onclick="ui.date=addDaysK(ui.date,1);render()" aria-label="اليوم اللي بعده">›</button><b>${rel ? rel + " · " : ""}${fmtDate(fromKey(dk))}</b><button class="btn xs" onclick="ui.date=addDaysK(ui.date,-1);render()" aria-label="اليوم اللي قبله">‹</button>${dk !== tk ? `<button class="btn xs ghost" onclick="ui.date=todayK();render()">النهارده</button>` : ""}</div>
    <span class="spacer"></span>
    ${due.length ? `<span class="st-prog"><b class="num">${doneN}</b><span class="muted">/${due.length}</span> خلصت<span class="st-bar"><i style="width:${pct}%"></i></span></span>` : ""}</div>`;
  const sec = (title, list, opt) => list.length ? `<div class="mt-sec"><div class="mt-h">${title} <span class="muted num">${list.length}</span></div>${list.map(t => myTaskCard(t, opt && opt.day ? opt.day(t) : dk, opt && opt.extra ? opt.extra(t) : "")).join("")}</div>` : "";
  h += sec("↩︎ اترجعتلك للتعديل", returned, { day: t => returnedDay(t) });
  h += sec("⚠️ متأخرة", overdue.filter(t => !returned.includes(t)), { day: t => t.date, extra: t => `كانت يوم ${fmtDate(fromKey(t.date))}` });
  h += sec(dk === tk ? "المطلوب النهارده" : "المطلوب في اليوم ده", todo);
  if (!todo.length && !returned.length && !overdue.length) h += `<div class="mt-empty">${due.length ? "خلّصت كل اللي عليك في اليوم ده 🎉" : "مفيش تاسكات عليك في اليوم ده"}</div>`;
  h += sec("مستني مراجعة زياد", waiting);
  h += sec("خلصت", done);
  // upcoming 7 days
  if (dk === tk) {
    const up = [];
    for (let i = 1; i <= 7; i++) { const d2 = addDaysK(tk, i); for (const t of VT) if (isDueOn(t, d2) && t.repeat !== "daily") up.push({ t, d2 }); }
    if (up.length) h += `<div class="mt-sec"><div class="mt-h">الجاي في الأسبوع ده <span class="muted num">${up.length}</span></div><div class="card" style="padding:4px 14px">${up.slice(0, 12).map(({ t, d2 }) => { const c = clientById(t.clientId); return `<div class="up-row"><span class="up-d">${d2 === addDaysK(tk,1) ? "بكرة" : fmtDate(fromKey(d2)).replace(/^\S+\s/, "")}</span><span class="up-t">${esc(t.title)}</span>${c ? `<span class="mt-client"><span class="cdot ${c.type}"></span>${esc(c.name)}</span>` : ""}</div>`; }).join("")}</div></div>`;
  }
  return h;
}


/* ================= Bidi: keep Latin/numbers readable inside Arabic ================= */
// "CPP 75 ر.س" as one readable unit: [unit][number][currency], each isolated
function money(unit, v, cu, dec){
  const n = dec === 0 ? fmt(v) : fmt2(v);
  return `<bdi class="money" dir="rtl">${unit ? `<bdi class="mu">${unit}</bdi> ` : ""}<bdi><b class="num">${n}</b></bdi> <bdi class="mc">${cu}</bdi></bdi>`;
}
const LATIN_RUN = /[A-Za-z0-9$€£][A-Za-z0-9.,%×:+\-\/_@#&$€£]*(?:[  ]+(?:[&+\-–|][  ]+)?[A-Za-z0-9$€£][A-Za-z0-9.,%×:+\-\/_@#&$€£]*)*/g;
const BIDI_SKIP = new Set(["SCRIPT","STYLE","TEXTAREA","INPUT","SELECT","OPTION","BDI","SVG","CODE","PRE"]);
function isolateLatin(root){
  if (!root) return;
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode(n){
    if (!/[A-Za-z0-9]/.test(n.nodeValue)) return NodeFilter.FILTER_REJECT;
    for (let p = n.parentNode; p && p !== root; p = p.parentNode) { if (BIDI_SKIP.has(p.nodeName.toUpperCase()) || (p.classList && (p.classList.contains("pb") || p.classList.contains("nob")))) return NodeFilter.FILTER_REJECT; if (p.getAttribute && p.getAttribute("dir") === "ltr") return NodeFilter.FILTER_REJECT; }
    return NodeFilter.FILTER_ACCEPT; } });
  const nodes = []; while (w.nextNode()) nodes.push(w.currentNode);
  for (const n of nodes) {
    const t = n.nodeValue; LATIN_RUN.lastIndex = 0; if (!LATIN_RUN.test(t)) continue; LATIN_RUN.lastIndex = 0;
    // whole text node is Latin -> isolate the parent element instead of splitting
    const frag = document.createDocumentFragment(); let last = 0, m;
    while ((m = LATIN_RUN.exec(t))) { if (m.index > last) frag.appendChild(document.createTextNode(t.slice(last, m.index))); const b = document.createElement("bdi"); b.dir = "ltr"; b.textContent = m[0]; frag.appendChild(b); last = m.index + m[0].length; }
    if (last < t.length) frag.appendChild(document.createTextNode(t.slice(last)));
    n.parentNode.replaceChild(frag, n);
  }
}
const _render0 = render;
render = function(){ _render0(); try { isolateLatin(document.getElementById("view")); isolateLatin(document.getElementById("tabs")); } catch(e){} };
const _openModal0 = openModal;
openModal = function(html, wide){ _openModal0(html, wide); try { isolateLatin(document.getElementById("modal")); } catch(e){} };


/* ================= Lead sheet block on leads dashboards ================= */
function leadSheetBlock(c, ls){
  if (!c.leadSheet) return "";
  const meta = c.lead_meta || {}, cu = cur(c);
  const sync = meta.last_sync ? `آخر قراية للشيت: ${fmtDate(new Date(meta.last_sync))} ${new Date(meta.last_sync).toLocaleTimeString("ar-EG", { hour:"numeric", minute:"2-digit" })}` : "الشيت لسه ماتقراش";
  let h = `<div class="section-title"><h3>من شيت الليدز</h3><span class="tiny muted">${sync}${meta.partial ? " · قراية تجريبية لحد ما السكريبت يشتغل" : ""}</span><span class="spacer"></span><a class="btn xs" href="${esc(normUrl(c.leadSheet.url))}" target="_blank" rel="noopener">افتح الشيت ↗</a></div>`;
  if (!ls) return h + `<div class="card empty">بيحمّل…</div>`;
  if (ls.empty) return h + `<div class="card small muted">مفيش ليدز في الشيت في الشهر ده.</div>`;
  const ym = ls.rows[0].d.slice(0,7), M0 = adRows(monthRows(c.id, ym)), A = agg(M0);
  const n = ls.n, b = ls.b, rate = n ? b / n * 100 : 0;
  h += `<div class="stats">
    <div class="stat"><div class="l">ليدز في الشيت</div><div class="n">${fmt(n)}</div>${A.conv ? `<div class="d muted">المنصات قالت ${fmt(A.conv)} تحويل</div>` : ""}</div>
    <div class="stat"><div class="l">حجوزات (من حالة الاتصال)</div><div class="n">${fmt(b)}</div><div class="d muted">${fmt(rate,1)}% من الليدز</div></div>
    <div class="stat"><div class="l">تكلفة الليد الحقيقية</div><div class="n">${A.s && n ? `${fmt2(A.s / n)} <span class="small muted">${cu}</span>` : "—"}</div><div class="d muted">الصرف ÷ ليدز الشيت</div></div>
    <div class="stat"><div class="l">تكلفة الحجز</div><div class="n">${A.s && b ? `${fmt2(A.s / b)} <span class="small muted">${cu}</span>` : "—"}</div><div class="d muted">الصرف ÷ الحجوزات</div></div></div>`;
  const grp = (key, list) => { const m = new Map(); for (const r of ls.rows) { const k = r[key] || "—"; const x = m.get(k) || { k, n:0, b:0 }; x.n += r.leads; x.b += r.booked; m.set(k, x); } return [...m.values()].sort((a2, b2) => b2.n - a2.n); };
  const spendOf = (key, k) => agg(M0.filter(r => (key === "p" ? r.p : r.dep) === k)).s;
  const table = (key, title) => { const G = grp(key); if (G.length < 1) return "";
    return `<div class="small muted" style="margin:14px 0 6px">${title}</div><div class="tscroll"><table class="t"><thead><tr><th>${key === "p" ? "المنصة" : "القسم"}</th><th>ليدز الشيت</th><th>حجوزات</th><th>نسبة الحجز</th><th>الصرف</th><th>تكلفة الليد</th><th>تكلفة الحجز</th></tr></thead><tbody>${G.map(x => { const sp = x.k === "—" ? 0 : spendOf(key, x.k);
      return `<tr><td>${key === "p" && x.k !== "—" ? pname(x.k) : esc(x.k === "—" ? "مش معروف" : x.k)}</td><td>${fmt(x.n)}</td><td>${fmt(x.b)}</td><td>${x.n ? fmt(x.b / x.n * 100, 1) + "%" : "—"}</td><td>${sp ? fmt(sp) : "—"}</td><td>${sp && x.n ? fmt2(sp / x.n) : "—"}</td><td>${sp && x.b ? fmt2(sp / x.b) : "—"}</td></tr>`; }).join("")}</tbody></table></div>`; };
  h += `<div class="card">${table("p", "حسب المنصة")}${table("dep", "حسب القسم")}<div class="tiny muted" style="margin-top:10px">الحجز = أي ليد مكتوب في حالة الاتصال بتاعته «حجز». الصرف من الأرقام المتسجلة في السيستم.</div></div>`;
  return h;
}


/* ================= Lead sheet settings + sync status ================= */
const BACKUP_SHEET = "https://docs.google.com/spreadsheets/d/14RWLxzTDLvRGDl-I94iph64yBl2OS39N74M8LVYzaf8/edit";
function leadSheetEditor(c){
  const ls = c.lead_sheet || {}, meta = c.lead_meta || {}, over = ls.tabs || {}, P = plats(c).map(p => p.name), D = c.depts || [];
  const tabs = meta.tabs || [];
  let h = `<div class="lsh"><div class="row" style="margin-bottom:6px"><h4 style="margin:0">شيت الليدز</h4><span class="tiny muted">السيستم بيقراه كل ساعة ويحسب الليدز والحجوزات لكل يوم</span></div>
    <div class="row" style="gap:8px"><input class="inp" id="lsUrl_${c.id}" dir="ltr" style="flex:1;min-width:240px" value="${esc(ls.url || "")}" placeholder="https://docs.google.com/spreadsheets/d/..."><button class="btn sm primary" onclick="saveLeadUrl('${c.id}')">حفظ اللينك</button>${ls.url ? `<a class="btn sm" href="${esc(normUrl(ls.url))}" target="_blank" rel="noopener">افتح ↗</a>` : ""}</div>`;
  if (!ls.url) return h + `</div>`;
  if (!tabs.length) return h + `<div class="small muted" style="margin-top:8px">لسه ماتقراش. هيتقري أول ما السكريبت يشتغل (شوف Backup & Sheets).</div></div>`;
  h += `<div class="small muted" style="margin:12px 0 6px">التابات اللي في الشيت: السيستم بيخمّن المنصة والقسم من اسم التاب واسم الكامبين. لو غلط عدّله هنا، وهيتطبق في القراية الجاية.</div>
    <div class="tscroll"><table class="t lsh-t"><thead><tr><th>التاب</th><th>المنصة</th><th>القسم</th><th>ليدز</th><th>حجوزات</th><th>اتجاهله</th></tr></thead><tbody>${tabs.map(t => { const o = over[t.name] || {}, n = jsq(t.name);
      return `<tr class="${o.skip ? "off" : ""}"><td><b>${esc(t.name)}</b></td>
        <td><select class="inp sm" onchange="saveLeadTab('${c.id}','${n}','p',this.value)"><option value="">تلقائي${t.p && !o.p ? ` (${esc(t.p)})` : ""}</option>${P.map(p => `<option ${o.p === p ? "selected" : ""}>${esc(p)}</option>`).join("")}</select></td>
        <td><select class="inp sm" onchange="saveLeadTab('${c.id}','${n}','dep',this.value)"><option value="">تلقائي (من الكامبين)</option>${D.map(d => `<option ${o.dep === d ? "selected" : ""}>${esc(d)}</option>`).join("")}</select></td>
        <td class="num">${fmt(t.leads || 0)}</td><td class="num">${fmt(t.booked || 0)}</td>
        <td><input type="checkbox" ${o.skip ? "checked" : ""} onchange="saveLeadTab('${c.id}','${n}','skip',this.checked)"></td></tr>`; }).join("")}</tbody></table></div></div>`;
  return h;
}
async function saveLeadUrl(cid){
  const c = clientById(cid), url = $("#lsUrl_" + cid).value.trim();
  if (url && !/docs\.google\.com\/spreadsheets\/d\//.test(url)) return toast("ده مش لينك جوجل شيت");
  const ls = Object.assign({}, c.lead_sheet || {}, { url, tabs: (c.lead_sheet && c.lead_sheet.tabs) || {} });
  try { await q(sb.from("clients").update({ lead_sheet: url ? ls : null }).eq("id", cid), "lsurl"); c.lead_sheet = url ? ls : null; c.leadSheet = url ? ls : null; toast("اتحفظ ✓ — هيتقري في خلال ساعة"); render(); }
  catch(e){ toast("ماتحفظش: " + (e.message || e)); }
}
async function saveLeadTab(cid, tab, field, val){
  const c = clientById(cid), ls = JSON.parse(JSON.stringify(c.lead_sheet || {})); ls.tabs = ls.tabs || {};
  const o = ls.tabs[tab] = ls.tabs[tab] || {}; if (val === "" || val === false) delete o[field]; else o[field] = val;
  if (!Object.keys(o).length) delete ls.tabs[tab];
  try { await q(sb.from("clients").update({ lead_sheet: ls }).eq("id", cid), "lstab"); c.lead_sheet = ls; c.leadSheet = ls; toast("اتحفظ ✓ — هيتطبق في القراية الجاية"); render(); }
  catch(e){ toast("ماتحفظش: " + (e.message || e)); }
}
function settingsSync(){
  const L = clients.filter(c => c.type === "leads");
  return `<div class="card" style="margin-bottom:14px"><div class="row"><h2 style="font-size:17px">النسخة الاحتياطية</h2><span class="spacer"></span><a class="btn sm primary" href="${BACKUP_SHEET}" target="_blank" rel="noopener">افتح الشيت ↗</a></div>
      <p class="small muted" style="margin:8px 0 0">كل الأرقام اللي بتتسجل في السيستم بتنزل كل ساعة في شيت «Zyad System — Backup» على الدرايف بتاعك: تاب «الأرقام» فيه كل رقم، وتاب «ملخص يومي» فيه توتال كل عميل في كل يوم، وتاب «حالة المزامنة» فيه آخر مرة اتحدّث.</p></div>
    <div class="card"><h2 style="font-size:17px;margin-bottom:8px">شيتات الليدز</h2>
      ${L.map(c => { const m = c.lead_meta || {}; return `<div class="trow"><span class="cdot leads"></span><div style="flex:1"><b>${esc(c.name)}</b><div class="tiny muted">${c.leadSheet ? (m.last_sync ? `آخر قراية: ${fmtDate(new Date(m.last_sync))} · ${(m.tabs||[]).length} تاب · ${fmt((m.tabs||[]).reduce((a,t) => a + (t.leads||0), 0))} ليد${m.partial ? " (تجريبي)" : ""}` : "لسه ماتقراش") : "مفيش شيت ليدز متحدد"}</div></div><button class="btn sm" onclick="ui.stab='clients';ui.sClient='${c.id}';render()">${c.leadSheet ? "التابات والإعدادات" : "حط لينك الشيت"}</button></div>`; }).join("") || `<div class="small muted">مفيش عملاء ليدز.</div>`}
    </div>`;
}


/* ================= Calendar v2: every cell shows all key numbers ================= */
function calendar(c, ym, rows){
  const store = c.type === "store", slice = !!window.__slice;
  const defs = metricDefs(c, adRows(rows), rows);
  const mainK = store ? (slice ? "cpp" : "roas") : "cpl", D = defs[mainK] || defs[Object.keys(defs)[0]];
  const days = daysOfMonth(ym), tk = todayK(), cu = cur(c);
  const off = (fromKey(days[0]).getDay() + 1) % 7;
  const mname = MONTHS[+ym.slice(5)-1];
  const K = v => v >= 10000 ? fmt(v/1000, 1) + "K" : fmt(v);
  const line = (l, v, main) => `<div class="cl${main ? " mn" : ""}"><span>${l}</span><b class="num">${v}</b></div>`;
  let h = `<div class="section-title"><h3>الشهر يوم بيوم</h3><span class="tiny muted">دوس على أي يوم تشوف تفاصيله</span></div>
  <div class="tiny muted" style="margin:-4px 0 10px">لون المربع على ${store ? (slice ? "الـ CPP" : "الـ ROAS") : "تكلفة التحويل"}: ${D.lg}</div>
  <div class="cal calh">${["سبت","أحد","اثنين","تلات","أربع","خميس","جمعة"].map(x => `<div>${x}</div>`).join("")}</div>
  <div class="cal cal2">${"<div></div>".repeat(off)}`;
  for (const d of days) {
    const dr = rows.filter(r => r.d === d), x = agg(store ? dr : adRows(dr)); if (!store) x.bk = agg(dr.filter(r => r.p === "_bk")).bk;
    const dn = `${fromKey(d).getDate()} ${mname}`, sel = ui.selDay === d ? " sel" : "";
    if (d > tk) { h += `<div class="cd fut"><span class="dn">${dn}</span></div>`; continue; }
    if (!dr.length) { h += `<div class="cd e${sel}" onclick="openDay('${c.id}','${d}',${slice ? 1 : 0})"><span class="dn">${dn}</span><span class="ml">لسه ماتسجلش</span><span class="mv">+ سجّل</span></div>`; continue; }
    let body;
    if (store && slice) body = line("الصرف", fmt(x.s)) + line("أوردرات", fmt(x.po)) + line("CPP", x.po ? fmt2(x.s / x.po) : "—", true);
    else if (store) body = line("الصرف", fmt(x.s)) + line("المبيعات", x.sl ? K(x.sl) : "—") + line("ROAS", x.sl && x.s ? fmt2(x.roas) : "—", true) + line("أوردرات", fmt(x.o)) + line("CPP", x.cpp != null ? fmt2(x.cpp) : "—");
    else body = line("الصرف", fmt(x.s)) + line("تحويلات", fmt(x.conv)) + line("CPA", x.conv ? fmt2(x.cpl) : x.s ? "مفيش" : "—", true) + (x.bk ? line("حجوزات", fmt(x.bk)) : "");
    h += `<div class="cd c2 ${D.cls(x)}${sel}" onclick="openDay('${c.id}','${d}',${slice ? 1 : 0})"><span class="dn">${dn}</span><div class="cls">${body}</div></div>`;
  }
  h += `</div><div class="tiny muted" style="margin-top:6px">الأرقام بالـ ${cu}.</div>`;
  if (slice) window.__calSlicePl = (window.__slicePl || []).slice();
  return h;
}
function openDay(cid, d, isSlice){
  const c = clientById(cid); if (!c || !M[cid]) return;
  ui.selDay = d;
  let dr = M[cid].filter(r => r.d === d);
  const pl = isSlice ? (window.__calSlicePl || []) : null;
  if (pl) dr = adRows(dr).filter(r => pl.includes(r.p));
  window.__slice = !!pl; window.__noOwner = !!pl;
  let html; try { html = dayDetail(c, d, dr); } finally { window.__slice = false; window.__noOwner = false; }
  openModal(`<div class="row" style="margin-bottom:-6px"><span class="spacer"></span><button class="btn ghost sm" onclick="closeModal()" aria-label="اقفل">✕</button></div>` + html.replace('<div class="det">', '<div class="det inmodal">'), true);
  document.querySelectorAll(".cd.sel").forEach(e => e.classList.remove("sel"));
}

/* ================= Alerts for one person's platforms ================= */
function sliceAlerts(c, sl){
  const out = []; if (!M[c.id]) return out;
  const t = todayK(), y = addDaysK(t,-1), f3 = addDaysK(t,-3), store = c.type === "store", tg = c.targets || {};
  const all = sliceRows(M[c.id], sl), r3 = all.filter(r => r.d >= f3 && r.d <= y), ym = ymOf(y), mon = all.filter(r => r.d.startsWith(ym));
  const res = x => store ? x.po : x.conv, unit = store ? "CPP" : "تكلفة التحويل", T = store ? tg.maxCpp : tg.cpl;
  const missing = sl.platforms.filter(p => !all.some(r => r.d === y && r.p === p));
  if (missing.length && all.length) out.push({ lv:"warn", t:`مسجلتش أرقام امبارح (${fmtShort(y)}) لـ ${missing.map(esc).join(" و ")}` });
  for (const p of sl.platforms) {
    const a = agg(r3.filter(r => r.p === p)), m = agg(mon.filter(r => r.p === p)), rn = res(a), rm = res(m);
    if (a.s > 0 && !rn) out.push({ lv:"bad", t:`<b>${esc(p)}</b> صرفت ${money("", a.s, cur(c), 0)} آخر 3 أيام من غير ولا ${store ? "أوردر" : "تحويل"}` });
    else if (rn && rm) { const c3 = a.s / rn, cm = m.s / rm;
      if (T && c3 > T) out.push({ lv:"bad", t:`<b>${esc(p)}</b>: ${unit} آخر 3 أيام ${money("", c3, cur(c))} فوق التارجت (${fmt2(T)})` });
      else if (c3 > cm * 1.3) out.push({ lv:"warn", t:`<b>${esc(p)}</b>: ${unit} آخر 3 أيام ${money("", c3, cur(c))}، أغلى من متوسط الشهر (${fmt2(cm)}) بـ ${fmt((c3/cm - 1) * 100)}%` });
      else if (c3 < cm * 0.8) out.push({ lv:"good", t:`<b>${esc(p)}</b>: ${unit} آخر 3 أيام ${money("", c3, cur(c))}، أرخص من متوسط الشهر (${fmt2(cm)}) بـ ${fmt((1 - c3/cm) * 100)}% 👌` }); }
  }
  return out;
}
function alertsHtml(list){ return list.map(a => `<div class="alert lv-${a.lv}">${a.lv === "good" ? "✓" : "⚠️"} ${a.t}</div>`).join(""); }

/* ================= Member account: logout only ================= */
const _settingsAccount0 = settingsAccount;
const photoRow = () => `<div class="row" style="gap:14px;margin-bottom:14px"><button class="photo-btn" onclick="pickMyPhoto()" title="غيّر الصورة">${avatar(me.id, 72)}<span>📷</span></button><div><b style="font-size:16px">${esc(me.name || "")}</b><div class="tiny muted">${esc(isAdmin() ? "Admin" : (me.job || ""))}</div><div class="row" style="gap:6px;margin-top:8px"><button class="btn xs" onclick="pickMyPhoto()">${me.avatar_url ? "غيّر الصورة" : "+ حط صورة"}</button>${me.avatar_url ? `<button class="btn xs ghost" onclick="removeMyPhoto()">شيلها</button>` : ""}</div></div></div>`;
settingsAccount = function(){
  if (isAdmin()) return _settingsAccount0().replace(/<div class="row" style="margin-bottom:6px">[\s\S]*?<\/div><\/div><\/div>/, "").replace('<div class="card" style="max-width:520px">', '<div class="card" style="max-width:520px">' + photoRow());
  return `<div class="card" style="max-width:520px">${photoRow()}<div class="row"><span class="spacer"></span><button class="btn danger sm" onclick="signOut()">تسجيل خروج</button></div>
    <p class="small muted" style="margin:12px 0 0">لو محتاج تغيّر الباسورد أو الاسم، كلّم زياد.</p></div>`;
};


/* ================= Photos & logos ================= */
const _avatar0 = avatar;
avatar = function(pid, size){
  const p = profileById(pid);
  if (p && p.avatar_url) { const z = size || 26; return `<img class="av avimg" src="${esc(p.avatar_url)}" alt="${esc(p.name || "")}" title="${esc(p.name || p.email || "")}" style="width:${z}px;height:${z}px" loading="lazy">`; }
  return _avatar0(pid, size);
};
function clientLogo(c, size, editable){
  const z = size || 32, ed = editable ? ` onclick="event.stopPropagation();pickClientLogo('${c.id}')" title="غيّر اللوجو" style="width:${z}px;height:${z}px;cursor:pointer"` : ` style="width:${z}px;height:${z}px"`;
  if (c.logo_url) return `<span class="clogo"${ed}><img src="${esc(c.logo_url)}" alt="${esc(c.name)}" loading="lazy"></span>`;
  const ch = String(c.name || "?").replace(/[^\p{L}\p{N}]/gu, "").slice(0, 1) || "?";
  return `<span class="clogo ph ${c.type}"${ed}>${editable && z >= 36 ? `<span class="clogo-add">+ لوجو</span>` : esc(ch)}</span>`;
}
function pickImage(cb){ const i = document.createElement("input"); i.type = "file"; i.accept = "image/png,image/jpeg,image/webp"; i.onchange = () => { const f = i.files && i.files[0]; if (f) cb(f); }; i.click(); }
function pickClientLogo(cid){ pickImage(f => openCropper(f, { kind:"logo", title:"لوجو العميل", onDone: blob => uploadImage(blob, `clients/${cid}`, "png", url => saveLogo(cid, url)) })); }
function pickMyPhoto(){ pickImage(f => openCropper(f, { kind:"avatar", title:"صورتك", onDone: blob => uploadImage(blob, `users/${me.id}`, "jpg", url => saveMyPhoto(url)) })); }
async function uploadImage(blob, folder, ext, done){
  const path = `${folder}/${Date.now()}.${ext}`;
  toast("بيرفع الصورة…");
  const { error } = await sb.storage.from("avatars").upload(path, blob, { contentType: ext === "png" ? "image/png" : "image/jpeg", upsert: true, cacheControl: "31536000" });
  if (error) return toast("ماترفعتش: " + error.message);
  const { data } = sb.storage.from("avatars").getPublicUrl(path);
  done(data.publicUrl);
}
async function saveLogo(cid, url){ try { await q(sb.from("clients").update({ logo_url: url }).eq("id", cid), "logo"); const c = clientById(cid); if (c) c.logo_url = url; closeModal(); toast("اتحفظ اللوجو ✓"); render(); } catch(e){ toast("ماتحفظش: " + (e.message || e)); } }
async function saveMyPhoto(url){ try { await q(sb.from("profiles").update({ avatar_url: url }).eq("id", me.id), "photo"); me.avatar_url = url; const p = profileById(me.id); if (p) p.avatar_url = url; closeModal(); toast("اتحفظت الصورة ✓"); render(); } catch(e){ toast("ماتحفظتش: " + (e.message || e)); } }
async function removeLogo(cid){ try { await q(sb.from("clients").update({ logo_url: null }).eq("id", cid), "logo"); const c = clientById(cid); if (c) c.logo_url = null; render(); toast("اتشال"); } catch(e){ toast("ماتشالش"); } }
async function removeMyPhoto(){ try { await q(sb.from("profiles").update({ avatar_url: null }).eq("id", me.id), "photo"); me.avatar_url = null; const p = profileById(me.id); if (p) p.avatar_url = null; render(); toast("اتشالت"); } catch(e){ toast("ماتشالتش"); } }

/* cropper: drag to move, slider/wheel to zoom; logos can show the whole image with a background */
let CR = null;
function openCropper(file, opt){
  if (file.size > 15 * 1024 * 1024) return toast("الصورة كبيرة أوي");
  const img = new Image(), url = URL.createObjectURL(file);
  img.onload = () => {
    const V = 280, logo = opt.kind === "logo";
    const cover = Math.max(V / img.width, V / img.height), contain = Math.min(V / img.width, V / img.height);
    CR = { img, opt, V, logo, min: logo ? contain * 0.6 : cover, max: cover * 4, s: logo ? contain * 0.9 : cover, x: 0, y: 0, bg: logo ? "#ffffff" : null };
    openModal(`<h2>${esc(opt.title)}</h2><p class="small muted" style="margin:4px 0 12px">اسحب الصورة عشان تحرّكها، وكبّر أو صغّر من الشريط.${logo ? " اللوجو بيبان كامل جوه المربع." : ""}</p>
      <div class="crop-wrap"><canvas id="crCv" width="${V * 2}" height="${V * 2}" class="crop-cv ${logo ? "sq" : "circ"}" style="width:${V}px;height:${V}px"></canvas></div>
      <div class="row" style="margin-top:12px;gap:10px"><span class="tiny muted">صغّر</span><input type="range" id="crZoom" min="0" max="1000" value="${Math.round((CR.s - CR.min) / (CR.max - CR.min) * 1000)}" style="flex:1" oninput="crZoom(this.value)"><span class="tiny muted">كبّر</span></div>
      ${logo ? `<div class="row" style="margin-top:10px;gap:6px"><span class="tiny muted">الخلفية:</span>${[["#ffffff","أبيض"],["#0e1418","غامق"],["transparent","شفافة"]].map(([v,l]) => `<button class="btn xs crbg" data-bg="${v}" onclick="crBg('${v}')">${l}</button>`).join("")}<span class="spacer"></span><button class="btn xs" onclick="crFit()">اللوجو كامل</button></div>` : ""}
      <div class="actions"><span class="spacer"></span><button class="btn" onclick="closeModal()">إلغاء</button><button class="btn primary" onclick="crSave()">احفظ</button></div>`);
    const cv = $("#crCv"); let drag = null;
    cv.addEventListener("pointerdown", e => { drag = { x: e.clientX, y: e.clientY, ox: CR.x, oy: CR.y }; cv.setPointerCapture(e.pointerId); });
    cv.addEventListener("pointermove", e => { if (!drag) return; CR.x = drag.ox + (e.clientX - drag.x); CR.y = drag.oy + (e.clientY - drag.y); crClamp(); crDraw(); });
    cv.addEventListener("pointerup", () => drag = null);
    cv.addEventListener("wheel", e => { e.preventDefault(); const r = $("#crZoom"); r.value = Math.max(0, Math.min(1000, +r.value - e.deltaY)); crZoom(r.value); }, { passive:false });
    crDraw(); crMarkBg();
  };
  img.onerror = () => toast("مقدرش يفتح الصورة");
  img.src = url;
}
function crZoom(v){ CR.s = CR.min + (CR.max - CR.min) * (+v / 1000); crClamp(); crDraw(); }
function crBg(v){ CR.bg = v; crDraw(); crMarkBg(); }
function crMarkBg(){ document.querySelectorAll(".crbg").forEach(b => b.classList.toggle("primary", b.dataset.bg === CR.bg)); }
function crFit(){ CR.s = Math.min(CR.V / CR.img.width, CR.V / CR.img.height) * 0.9; CR.x = 0; CR.y = 0; const r = $("#crZoom"); if (r) r.value = Math.round((CR.s - CR.min) / (CR.max - CR.min) * 1000); crDraw(); }
function crClamp(){
  const w = CR.img.width * CR.s, h = CR.img.height * CR.s, V = CR.V;
  if (!CR.logo) { const mx = Math.max(0, (w - V) / 2), my = Math.max(0, (h - V) / 2); CR.x = Math.max(-mx, Math.min(mx, CR.x)); CR.y = Math.max(-my, Math.min(my, CR.y)); }
  else { const mx = Math.abs(w - V) / 2 + V * 0.3, my = Math.abs(h - V) / 2 + V * 0.3; CR.x = Math.max(-mx, Math.min(mx, CR.x)); CR.y = Math.max(-my, Math.min(my, CR.y)); }
}
function crPaint(ctx, size){
  const k = size / CR.V; ctx.clearRect(0, 0, size, size);
  if (CR.bg && CR.bg !== "transparent") { ctx.fillStyle = CR.bg; ctx.fillRect(0, 0, size, size); }
  const w = CR.img.width * CR.s * k, h = CR.img.height * CR.s * k;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(CR.img, (size - w) / 2 + CR.x * k, (size - h) / 2 + CR.y * k, w, h);
}
function crDraw(){ const cv = $("#crCv"); if (!cv) return; const ctx = cv.getContext("2d"); crPaint(ctx, cv.width);
  if (CR.bg === "transparent") { cv.style.backgroundImage = "repeating-conic-gradient(#ddd 0 25%, #fff 0 50%)"; cv.style.backgroundSize = "16px 16px"; } else cv.style.backgroundImage = ""; }
function crSave(){
  const out = document.createElement("canvas"), size = CR.logo ? 512 : 400; out.width = out.height = size;
  crPaint(out.getContext("2d"), size);
  out.toBlob(b => { if (!b) return toast("ماتحفظتش"); CR.opt.onDone(b); }, CR.logo ? "image/png" : "image/jpeg", 0.9);
}

const APP_SHELL = "<div class=\"wrap\"><header class=\"top\"><span class=\"brand\" aria-label=\"\u0632\u064a\u0627\u062f \u0625\u0628\u0631\u0627\u0647\u064a\u0645\"><svg width=\"28\" height=\"28\" viewBox=\"0 0 48 48\" aria-hidden=\"true\"><rect class=\"zm-ink\" x=\"0\" y=\"28\" width=\"12\" height=\"20\" rx=\"2\"/><rect class=\"zm-brand\" x=\"18\" y=\"16\" width=\"12\" height=\"32\" rx=\"2\"/><rect class=\"zm-signal\" x=\"36\" y=\"0\" width=\"12\" height=\"12\" rx=\"2\"/><rect class=\"zm-brand\" x=\"36\" y=\"15\" width=\"12\" height=\"33\" rx=\"2\"/></svg><span class=\"nm\">\u0632\u064a\u0627\u062f \u0625\u0628\u0631\u0627\u0647\u064a\u0645</span><span class=\"sub\">\u00b7 \u0633\u064a\u0633\u062a\u0645 \u0627\u0644\u0634\u063a\u0644</span></span><nav class=\"tabs\" id=\"tabs\"></nav><span class=\"spacer\"></span><div id=\"who\"></div></header><main id=\"view\"><div class=\"card empty\">\u0628\u064a\u062d\u0645\u0651\u0644\u2026</div></main></div>";
start();
