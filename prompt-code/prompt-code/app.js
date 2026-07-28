const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const { getSupabase, withRetry } = require('./db/supabase');

const isNetlify = !!process.env.NETLIFY;
const DB_DIR = path.join(__dirname, 'db');
if (!isNetlify && !fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

function dbPath(key) { return path.join(DB_DIR, key + '.json'); }

// ─── In-memory mutex per collection (prevents concurrent file read-modify-write) ──
const locks = {};
function acquireLock(key) {
  if (!locks[key]) locks[key] = Promise.resolve();
  let release;
  const wait = new Promise(r => { release = r; });
  locks[key] = locks[key].then(() => wait);
  return () => release();
}

// ─── Database Layer ───────────────────────────────────────────

async function readDB(key) {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await withRetry(() =>
        supabase.from('kv_store').select('value').eq('key', key).single()
      );
      if (error || !data) return null;
      return data.value;
    } catch (e) {
      console.error('Supabase read error:', key, e.message);
      return null;
    }
  }

  const p = dbPath(key);
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(await fs.promises.readFile(p, 'utf8'));
  } catch (e) {
    return null;
  }
}

async function writeDB(key, data) {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { error } = await withRetry(() =>
        supabase.from('kv_store').upsert({ key, value: data }, { onConflict: 'key' })
      );
      if (error) console.error('Supabase write error:', key, error.message);
    } catch (e) {
      console.error('Supabase write error:', key, e.message);
    }
    return;
  }

  const release = acquireLock(key);
  try {
    await fs.promises.writeFile(dbPath(key), JSON.stringify(data, null, 2), 'utf8');
  } finally {
    release();
  }
}

// ─── Targeted Supabase CRUD (avoids full-collection read/write) ──

async function addItemToCollection(collection, item) {
  const supabase = getSupabase();
  if (supabase) {
    const data = await readDB(collection);
    const list = Array.isArray(data) ? data : [];
    list.push(item);
    await writeDB(collection, list);
    return { ok: true, id: item.id };
  }
  // Local fallback with mutex
  const release = acquireLock(collection);
  try {
    const data = await readDB(collection);
    const list = Array.isArray(data) ? data : [];
    list.push(item);
    await writeDB(collection, list);
    return { ok: true, id: item.id };
  } finally {
    release();
  }
}

async function updateItemInCollection(collection, id, updates) {
  const supabase = getSupabase();
  if (supabase) {
    const data = await readDB(collection);
    const list = Array.isArray(data) ? data : [];
    const idx = list.findIndex(x => x.id === id);
    if (idx === -1) return { ok: false, notFound: true };
    list[idx] = { ...list[idx], ...updates };
    await writeDB(collection, list);
    return { ok: true };
  }
  const release = acquireLock(collection);
  try {
    const data = await readDB(collection);
    const list = Array.isArray(data) ? data : [];
    const idx = list.findIndex(x => x.id === id);
    if (idx === -1) return { ok: false, notFound: true };
    list[idx] = { ...list[idx], ...updates };
    await writeDB(collection, list);
    return { ok: true };
  } finally {
    release();
  }
}

async function deleteItemFromCollection(collection, id) {
  const supabase = getSupabase();
  if (supabase) {
    const data = await readDB(collection);
    let list = Array.isArray(data) ? data : [];
    list = list.filter(x => x.id !== id);
    await writeDB(collection, list);
    return { ok: true };
  }
  const release = acquireLock(collection);
  try {
    const data = await readDB(collection);
    let list = Array.isArray(data) ? data : [];
    list = list.filter(x => x.id !== id);
    await writeDB(collection, list);
    return { ok: true };
  } finally {
    release();
  }
}

const COLLECTIONS = ['students', 'challenges', 'results', 'prompts', 'faculty_packs', 'settings'];

async function checkDbConnection() {
  const supabase = getSupabase();
  if (!supabase) return { ok: true, type: 'local' };
  try {
    const { error } = await withRetry(() =>
      supabase.from('kv_store').select('key').limit(1)
    );
    if (error) throw error;
    return { ok: true, type: 'supabase' };
  } catch (e) {
    console.error('Database connection check failed:', e);
    return { ok: false, error: e.message, type: 'supabase' };
  }
}

// ─── Seed Logic ───────────────────────────────────────────────

async function seedDatabase() {
  const seeded = await readDB('_seeded');
  if (seeded) return { ok: true, seeded: true };

  const files = [
    { file: 'data/users.json', key: 'students' },
    { file: 'promptdb/prompts.json', key: 'prompts' },
    { file: 'promptdb/packs.json', key: 'faculty_packs' }
  ];

  for (const { file, key } of files) {
    try {
      if (fs.existsSync(file)) {
        const text = await fs.promises.readFile(file, 'utf8');
        let data = decryptLegacy(text);
        if (!data) {
          try {
            data = JSON.parse(text);
          } catch (e) {
            console.warn('Seed error: File is neither encrypted nor valid JSON', file);
          }
        }
        if (data && Array.isArray(data)) {
          await writeDB(key, data);
          console.log(`Seeded ${key}: ${data.length} items`);
        }
      }
    } catch (e) {
      console.warn('Seed error for', key, e.message);
    }
  }

  await writeDB('_seeded', true);
  return { ok: true, seeded: false };
}

// Auto-seed on cold start (skip on Vercel — handled via /api/seed endpoint)
if (!process.env.VERCEL) {
  seedDatabase().then(res => {
    console.log(`Database seeding: ${res.seeded ? 'Already seeded' : 'Successfully seeded'}`);
  }).catch(err => {
    console.error('Automatic seeding failed:', err);
  });
}

// ─── API Routes ───────────────────────────────────────────────

app.get('/api', (req, res) => {
  res.json({
    message: 'Welcome to PromptPro Arena API',
    db: getSupabase() ? 'supabase' : 'local',
    endpoints: {
      health: '/api/health',
      seed: '/api/seed',
      collections: '/api/:collection',
      settings: '/api/settings'
    }
  });
});

app.get('/api/health', async (req, res) => {
  const dbStatus = await checkDbConnection();
  const counts = [];
  for (const c of COLLECTIONS) {
    const data = await readDB(c);
    counts.push({ name: c, count: (Array.isArray(data) ? data.length : (data ? 1 : 0)) });
  }
  res.json({
    ok: dbStatus.ok,
    db: dbStatus,
    collections: counts
  });
});

app.get('/api/seed', async (req, res) => {
  const result = await seedDatabase();
  res.json(result);
});

// ─── Generic CRUD Routes ──────────────────────────────────────

app.get('/api/:collection', async (req, res) => {
  const { collection } = req.params;
  if (!COLLECTIONS.includes(collection)) return res.status(400).json({ error: 'Invalid collection' });
  const data = await readDB(collection);
  res.json(data || []);
});

app.post('/api/:collection', async (req, res) => {
  const { collection } = req.params;
  if (!COLLECTIONS.includes(collection)) return res.status(400).json({ error: 'Invalid collection' });
  if (!Array.isArray(req.body)) return res.status(400).json({ error: 'Expected array' });
  await writeDB(collection, req.body);
  res.json({ ok: true, count: req.body.length });
});

app.get('/api/:collection/:id', async (req, res) => {
  const { collection, id } = req.params;
  if (!COLLECTIONS.includes(collection)) return res.status(400).json({ error: 'Invalid collection' });
  const data = await readDB(collection);
  const list = Array.isArray(data) ? data : [];
  const item = list.find(x => x.id === id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

app.post('/api/:collection/add', async (req, res) => {
  const { collection } = req.params;
  if (!COLLECTIONS.includes(collection)) return res.status(400).json({ error: 'Invalid collection' });
  const result = await addItemToCollection(collection, req.body);
  if (result.notFound) return res.status(404).json({ error: 'Not found' });
  res.json(result);
});

app.put('/api/:collection/:id', async (req, res) => {
  const { collection, id } = req.params;
  if (!COLLECTIONS.includes(collection)) return res.status(400).json({ error: 'Invalid collection' });
  const result = await updateItemInCollection(collection, id, req.body);
  if (result.notFound) return res.status(404).json({ error: 'Not found' });
  res.json(result);
});

app.delete('/api/:collection/:id', async (req, res) => {
  const { collection, id } = req.params;
  if (!COLLECTIONS.includes(collection)) return res.status(400).json({ error: 'Invalid collection' });
  const result = await deleteItemFromCollection(collection, id);
  res.json(result);
});

// ─── Settings Endpoints ───────────────────────────────────────

app.get('/api/settings/key/:name', async (req, res) => {
  const settings = await readDB('settings');
  res.json({ value: (settings && settings[req.params.name]) || '' });
});

app.post('/api/settings/key/:name', async (req, res) => {
  const settings = (await readDB('settings')) || {};
  settings[req.params.name] = req.body.value || '';
  await writeDB('settings', settings);
  res.json({ ok: true });
});

app.get('/api/settings/pin-hash', async (req, res) => {
  const settings = await readDB('settings');
  res.json({ hash: (settings && settings.pinHash) || 'd7294dee9c8358621723a7aab7d5dc3a2211c30573fe387f1ccfaf086a0faa51' });
});

app.post('/api/settings/pin-hash', async (req, res) => {
  const settings = (await readDB('settings')) || {};
  settings.pinHash = req.body.hash;
  await writeDB('settings', settings);
  res.json({ ok: true });
});

// ─── Utilities ────────────────────────────────────────────────

function decryptLegacy(ct) {
  try {
    const CryptoJS = require('crypto-js');
    const ENC_KEY = 'p3p-encryption-key-2024-secure';
    const bytes = CryptoJS.AES.decrypt(ct, ENC_KEY);
    const dec = bytes.toString(CryptoJS.enc.Utf8);
    if (!dec) return null;
    const parsed = JSON.parse(dec);
    if (parsed.d && parsed.h) return JSON.parse(parsed.d);
    return parsed;
  } catch (e) {
    return null;
  }
}

module.exports = { app, readDB, writeDB };
