// in-memory supabase mock
window.__mockSetup = function(cfg){
  const T = cfg.tables; window.__T = T; let uidUser = cfg.user;
  const gen = () => crypto.randomUUID();
  function builder(table){
    let rows = null, op = 'select', payload = null, filters = [], single = false, sel = false, opts = {};
    const apply = list => list.filter(r => filters.every(f => f(r)));
    const api = {
      select(){ sel = true; return api; }, order(){ return api; }, limit(){ return api; }, single(){ single = true; return api; },
      eq(k,v){ filters.push(r => String(r[k]) === String(v)); return api; },
      in(k,vs){ filters.push(r => vs.map(String).includes(String(r[k]))); return api; },
      gte(k,v){ filters.push(r => r[k] >= v); return api; },
      insert(p){ op='insert'; payload = Array.isArray(p)?p:[p]; return api; },
      upsert(p, o){ op='upsert'; payload = Array.isArray(p)?p:[p]; opts=o||{}; return api; },
      update(p){ op='update'; payload = p; return api; },
      delete(){ op='delete'; return api; },
      then(res, rej){
        T[table] = T[table] || []; let data = null;
        if (op === 'select') { data = apply(T[table]); if (cfg.rls) data = cfg.rls(table, data); if (single) data = data[0]; }
        if (op === 'insert') { data = payload.map(p => { const r = { id: p.id || gen(), created: new Date().toISOString().slice(0,10), ...p }; T[table].push(r); return r; }); }
        if (op === 'upsert') { data = payload.map(p => { const keyf = table === 'task_status' ? (r => r.task_id === p.task_id && r.day === p.day) : table === 'client_members' ? (r => r.client_id === p.client_id && r.user_id === p.user_id) : table === 'payments' ? (r => r.client_id === p.client_id && r.ym === p.ym && r.part === p.part) : table === 'client_billing' ? (r => r.client_id === p.client_id) : table === 'plan_meta' ? (r => r.client_id === p.client_id && r.ym === p.ym) : (r => r.id === p.id); const ex = T[table].find(keyf); if (ex) { Object.assign(ex, p); return ex; } T[table].push({...p}); return p; }); }
        if (op === 'update') { data = apply(T[table]); data.forEach(r => Object.assign(r, payload)); }
        if (op === 'delete') { const del = apply(T[table]); T[table] = T[table].filter(r => !del.includes(r)); data = del; }
        return Promise.resolve({ data, error: null }).then(res, rej);
      }
    };
    return api;
  }
  window.supabase = { createClient(){ return {
    from: builder,
    auth: { getSession: async () => ({ data: { session: uidUser ? { user: { id: uidUser, email: 'x@y.com' } } : null } }),
      onAuthStateChange(){}, signInWithPassword: async ({email,password}) => { const p = T.profiles.find(x => (x.email+'@team.ziad-system.app') === email || x.email === email); if (!p || password !== 'goodpass1') return { error: { message: 'Invalid login credentials' } }; uidUser = p.id; return { data:{}, error: null }; }, signOut: async () => ({}), updateUser: async () => ({ error: null }) },
    storage: { from(){ return { getPublicUrl: (p) => ({ data: { publicUrl: 'data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2299%22 height=%2299%22><rect width=%2299%22 height=%2299%22 fill=%22%230b5d57%22/><text x=%2210%22 y=%2260%22 font-size=%2240%22 fill=%22white%22>FAZ</text></svg>' } }), remove: async () => ({}), upload: async () => ({ error: null }), createSignedUrl: async () => ({ data: { signedUrl: 'about:blank' } }) }; } },
    functions: { invoke: async (n, { body }) => { const id = gen(); T.profiles.push({ id, email: body.username, name: body.name, job: body.job, role: 'member', active: true }); return { data: { ok: true, id } }; } },
    channel(){ const c = { on(){ return c; }, subscribe(){ return c; } }; return c; }
  }; } };
};
