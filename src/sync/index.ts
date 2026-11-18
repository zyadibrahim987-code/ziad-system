// sync: used by the Google Apps Script in Zyad's backup sheet.
//  GET  ?action=export          -> all metrics (with client + person names) and lead-sheet configs
//  POST {action:"leads", ...}   -> replace lead_stats for a client with counts read from its lead sheet
// Auth: header x-sync-token, checked against a sha256 hash stored in private.sync_config.
import { createClient } from "jsr:@supabase/supabase-js@2";

const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { "Content-Type": "application/json" } });

async function all(table: string, select: string, order: string) {
  const out: any[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await sb.from(table).select(select).order(order).range(from, from + 999);
    if (error) throw error;
    out.push(...(data || []));
    if (!data || data.length < 1000) break;
  }
  return out;
}

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const token = req.headers.get("x-sync-token") || "";
    const { data: ok } = await sb.rpc("sync_token_ok", { t: token });
    if (!ok) return json({ error: "unauthorized" }, 401);

    if (req.method === "GET" && url.searchParams.get("action") === "export") {
      const [clients, profiles, metrics] = await Promise.all([
        all("clients", "id,name,type,currency,usd_rate,platforms,depts,lead_sheet,status,is_test", "name"),
        all("profiles", "id,name,email", "created_at"),
        all("metrics", "client_id,d,p,dep,s,ca,ms,ld,ins,bk,bv,o,sl,entered_by,reviewed,updated_at", "d"),
      ]);
      return json({ generated_at: new Date().toISOString(), clients, profiles, metrics });
    }

    if (req.method === "POST") {
      const body = await req.json();
      if (body.action === "leads") {
        const cid = String(body.client_id || "");
        const { data: c } = await sb.from("clients").select("id").eq("id", cid).maybeSingle();
        if (!c) return json({ error: "client not found" }, 404);
        const stats = (body.stats || []).filter((r: any) => /^\d{4}-\d{2}-\d{2}$/.test(r.d)).map((r: any) => ({
          client_id: cid, d: r.d, tab: String(r.tab || "").slice(0, 120), p: String(r.p || ""), dep: String(r.dep || ""),
          leads: Math.max(0, parseInt(r.leads) || 0), booked: Math.max(0, parseInt(r.booked) || 0), updated_at: new Date().toISOString(),
        }));
        const del = await sb.from("lead_stats").delete().eq("client_id", cid);
        if (del.error) throw del.error;
        for (let i = 0; i < stats.length; i += 500) {
          const ins = await sb.from("lead_stats").insert(stats.slice(i, i + 500));
          if (ins.error) throw ins.error;
        }
        const meta = { last_sync: new Date().toISOString(), tabs: body.tabs || [], skipped_rows: body.skipped_rows || 0, error: body.error || null };
        await sb.from("clients").update({ lead_meta: meta }).eq("id", cid);
        return json({ ok: true, rows: stats.length });
      }
    }
    return json({ error: "bad request" }, 400);
  } catch (e) {
    return json({ error: String((e as any)?.message || e) }, 500);
  }
});
