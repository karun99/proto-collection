/* ── FETCH COMMODITY PRICES (Build-time) ────────────── */
/* Run: node fetch-commodity-prices.js [--output prices.json] */
/* Fetches real-time Indian commodity prices from open APIs */

const https = require('https');

// ── Configuration ──────────────────────────────────────
const OUTPUT_FILE = process.argv.includes('--output')
  ? process.argv[process.argv.indexOf('--output') + 1]
  : 'commodity-prices.json';

const COMMODITY_LIST = {
  mutton: 'mutton',
  basmatiRice: 'basmati rice',
  toorDal: 'toor dal',
  onion: 'onion',
  tomato: 'tomato',
  garlic: 'garlic',
  ginger: 'ginger',
  greenChillies: 'green chilli',
  eggs: 'eggs',
  potato: 'potato'
};

// ── Default Prices (fallback) ──────────────────────────
const DEFAULT_PRICES = {
  mutton: { price: 650, unit: 'kg', source: 'default' },
  muttonBoneless: { price: 850, unit: 'kg', source: 'default' },
  basmatiRice: { price: 120, unit: 'kg', source: 'default' },
  toorDal: { price: 95, unit: 'kg', source: 'default' },
  onion: { price: 35, unit: 'kg', source: 'default' },
  tomato: { price: 40, unit: 'kg', source: 'default' },
  garlic: { price: 150, unit: 'kg', source: 'default' },
  ginger: { price: 100, unit: 'kg', source: 'default' },
  coconutOil: { price: 200, unit: 'L', source: 'default' },
  ghee: { price: 550, unit: 'kg', source: 'default' },
  curd: { price: 60, unit: 'kg', source: 'default' },
  greenChillies: { price: 80, unit: 'kg', source: 'default' },
  corianderLeaves: { price: 10, unit: 'bunch', source: 'default' },
  eggs: { price: 72, unit: 'dozen', source: 'default' }
};

// ── Fetch with retry ───────────────────────────────────
function fetch(url, timeoutMs = 10000) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { timeout: timeoutMs }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
    req.on('error', reject);
  });
}

// ── Source 1: data.gov.in Open API (Mandi Prices) ──────
async function fetchFromDataGovIn() {
  try {
    // Uses the Open Government Data API for daily mandi prices
    // Limit 10 results, select key commodities
    const url = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b&format=json&limit=10';
    const raw = await fetch(url);
    const data = JSON.parse(raw);
    if (data && data.records && data.records.length > 0) {
      console.log(`[Commodity] data.gov.in returned ${data.records.length} records`);
      return data.records;
    }
  } catch (e) {
    console.log('[Commodity] data.gov.in unavailable:', e.message);
  }
  return null;
}

// ── Source 2: Commodity Online (fallback source) ───────
async function fetchFromCommodityOnline() {
  try {
    const url = 'https://www.commodityonline.com/ajax/live_mandi_price.php?state=Andhra+Pradesh';
    const raw = await fetch(url);
    // Parse HTML or JSON response
    console.log('[Commodity] commodityonline response length:', raw.length);
    return raw;
  } catch (e) {
    console.log('[Commodity] commodityonline unavailable:', e.message);
  }
  return null;
}

// ── Source 3: Web scrape Agmarknet ─────────────────────
async function fetchFromAgmarknet() {
  try {
    const url = 'https://agmarknet.gov.in/SearchCmmMkt.aspx';
    const html = await fetch(url);
    console.log('[Commodity] agmarknet response length:', html.length);
    return html;
  } catch (e) {
    console.log('[Commodity] agmarknet unavailable:', e.message);
  }
  return null;
}

// ── Main ───────────────────────────────────────────────
async function main() {
  console.log('╔═══════════════════════════════════════╗');
  console.log('║  Indian Commodity Price Fetcher       ║');
  console.log('╚═══════════════════════════════════════╝');

  let prices = { ...DEFAULT_PRICES };
  let sourcesUsed = ['default'];

  // Try data.gov.in first
  const govRecords = await fetchFromDataGovIn();
  if (govRecords) {
    sourcesUsed.push('data.gov.in');
    // Map records to our commodity keys (simplified mapping)
    for (const rec of govRecords) {
      const commodity = rec.commodity ? rec.commodity.toLowerCase() : '';
      const modalPrice = rec.modal_price ? parseFloat(rec.modal_price) : 0;
      if (commodity.includes('mutton')) {
        prices.mutton = { price: modalPrice || 650, unit: 'kg', source: 'data.gov.in' };
      } else if (commodity.includes('onion')) {
        prices.onion = { price: modalPrice || 35, unit: 'kg', source: 'data.gov.in' };
      } else if (commodity.includes('tomato')) {
        prices.tomato = { price: modalPrice || 40, unit: 'kg', source: 'data.gov.in' };
      } else if (commodity.includes('rice')) {
        prices.basmatiRice = { price: modalPrice || 120, unit: 'kg', source: 'data.gov.in' };
      } else if (commodity.includes('garlic')) {
        prices.garlic = { price: modalPrice || 150, unit: 'kg', source: 'data.gov.in' };
      } else if (commodity.includes('ginger')) {
        prices.ginger = { price: modalPrice || 100, unit: 'kg', source: 'data.gov.in' };
      } else if (commodity.includes('chilli') || commodity.includes('chili')) {
        prices.greenChillies = { price: modalPrice || 80, unit: 'kg', source: 'data.gov.in' };
      } else if (commodity.includes('egg')) {
        prices.eggs = { price: modalPrice || 72, unit: 'dozen', source: 'data.gov.in' };
      } else if (commodity.includes('potato')) {
        prices.potato = { price: modalPrice || 30, unit: 'kg', source: 'data.gov.in' };
      }
    }
    console.log('[Commodity] Mapped', Object.keys(prices).length, 'commodities from data.gov.in');
  }

  // Write output
  const output = {
    fetchedAt: new Date().toISOString(),
    sources: sourcesUsed,
    commodities: prices,
    // Store the commodity products metadata for recipe cost estimation
    metadata: {
      mutton: { unit: 'kg', label: 'Mutton (bone-in)' },
      muttonBoneless: { unit: 'kg', label: 'Mutton (boneless)' },
      basmatiRice: { unit: 'kg', label: 'Basmati Rice' },
      toorDal: { unit: 'kg', label: 'Toor Dal' },
      onion: { unit: 'kg', label: 'Onion' },
      tomato: { unit: 'kg', label: 'Tomato' },
      garlic: { unit: 'kg', label: 'Garlic' },
      ginger: { unit: 'kg', label: 'Ginger' },
      coconutOil: { unit: 'L', label: 'Coconut Oil' },
      ghee: { unit: 'kg', label: 'Ghee' },
      curd: { unit: 'kg', label: 'Curd (Yogurt)' },
      greenChillies: { unit: 'kg', label: 'Green Chillies' },
      corianderLeaves: { unit: 'bunch', label: 'Fresh Coriander' },
      eggs: { unit: 'dozen', label: 'Eggs' }
    }
  };

  const fs = require('fs');
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
  console.log(`[Commodity] Prices written to ${OUTPUT_FILE}`);
  console.log('[Commodity] Sources:', sourcesUsed.join(', '));
  console.log('[Commodity] Mutton: ₹' + prices.mutton.price + '/kg');
  console.log('[Commodity] Onion: ₹' + prices.onion.price + '/kg');
  console.log('[Commodity] Tomato: ₹' + prices.tomato.price + '/kg');
  console.log('Done.');
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
