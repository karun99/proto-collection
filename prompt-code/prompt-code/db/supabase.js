const { createClient } = require('@supabase/supabase-js');

let supabase = null;
let lastHealthCheck = 0;
const HEALTH_CHECK_INTERVAL = 30_000;

async function withRetry(fn, retries = 3, delayMs = 300) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise(r => setTimeout(r, delayMs * Math.pow(2, i)));
    }
  }
}

function getSupabase() {
  if (supabase) return supabase;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.warn('Supabase not configured (SUPABASE_URL missing). Using local file storage.');
    return null;
  }

  supabase = createClient(url, key, {
    auth: { persistSession: false },
    db: { schema: 'public' },
    global: {
      headers: { 'x-client-info': 'promptpro-arena' },
    },
  });

  return supabase;
}

async function checkHealth() {
  const now = Date.now();
  if (now - lastHealthCheck < HEALTH_CHECK_INTERVAL) return { ok: true };
  lastHealthCheck = now;

  const client = getSupabase();
  if (!client) return { ok: true, type: 'local' };

  try {
    const { error } = await withRetry(() =>
      client.from('kv_store').select('key').limit(1)
    );
    if (error) throw error;
    return { ok: true, type: 'supabase' };
  } catch (e) {
    console.error('Supabase health check failed:', e.message);
    return { ok: false, error: e.message };
  }
}

module.exports = { getSupabase, withRetry, checkHealth };
