/* ── SHARED UTILITIES ────────────────────────────── */
/* safeParse, sanitizeHtml, Crypto (AES-256-GCM), Store, constants */

window.__RMH = window.__RMH || {};

// ── Safe Parse ──────────────────────────────────────
__RMH.safeParse = function(str, fallback) {
  try { return JSON.parse(str); } catch { return fallback !== undefined ? fallback : null; }
};

// ── Html Sanitizer ──────────────────────────────────
__RMH.sanitizeHtml = function(str) {
  if (!str) return '';
  var d = document.createElement('div');
  d.textContent = str;
  var s = d.innerHTML;
  s = s.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  s = s.replace(/\son\w+\s*=\s*"[^"]*"/gi, '');
  s = s.replace(/\son\w+\s*=\s*'[^']*'/gi, '');
  s = s.replace(/\shref\s*=\s*"javascript:[^"]*"/gi, ' href="#"');
  s = s.replace(/\shref\s*=\s*'javascript:[^']*'/gi, " href='#'");
  s = s.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
  return s;
};

// ── Escape Html ─────────────────────────────────────
__RMH.escapeHtml = function(str) {
  if (!str) return '';
  var d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
};

// ── Simple Hash (SHA-256 substitute for password) ───
__RMH.hash = function(str) {
  var h = 0, i, chr;
  if (!str || str.length === 0) return h;
  for (i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i);
    h = ((h << 5) - h) + chr;
    h |= 0;
  }
  return (h >>> 0).toString(16);
};

// ── Business Constants ──────────────────────────────
__RMH.BUSINESS = {
  name: 'Royal Mutton Hub',
  tagline: 'No Refrigeration — Only Freshness',
  taglineTelugu: 'రిఫ్రిజిరేషన్ లేదు — తాజాదనం మాత్రమే',
  indigenousNote: 'An indigenous Vijayawada brand — homegrown, rooted in Andhra Pradesh culinary heritage since 2005. Supporting local farmers, traditional butchery, zero refrigeration.',
  address: '# 9-60-75, Ganapathi Rao Road, Kothapeta, Vijayawada - 520001',
  addressTelugu: '# 9-60-75, గణపతిరావు రోడ్, కొత్తపేట, విజయవాడ - 520001',
  phone: '+91 9849592429',
  whatsapp: '919849592429',
  email: 'rmhubrj18@gmail.com',
  districts: ['Krishna', 'NTR', 'Guntur'],
  mapSrc: 'https://www.openstreetmap.org/export/embed.html?bbox=80.60%2C16.49%2C80.64%2C16.53&layer=mapnik&marker=16.510%2C80.620',
  hours: [
    { day: 'Daily', time: '6:00 AM – 8:00 PM' }
  ],
  policies: [
    'Absolutely no refrigeration — ever. Fresh daily, never stored.',
    'B2B bulk supply available for hotels, restaurants, caterers & retailers.',
    'Same-day delivery across Krishna, NTR & Guntur districts.',
    'Custom cuts prepared as per your requirement.',
    'FSSAI licensed — food safety certified facility.',
    'Freshness guaranteed — not fresh? 100% refund.'
  ],
  services: [
    { icon: 'hotel', title: 'Hotels & Restaurants', desc: 'Daily fresh mutton supply — no frozen meat, consistent quality, on-time delivery.' },
    { icon: 'utensils', title: 'Catering Services', desc: 'Bulk orders for events & weddings — fresh tender meat prepared on order, never stored.' },
    { icon: 'store', title: 'Retail Chains', desc: 'FSSAI certified fresh mutton — no refrigeration means natural tenderness & superior taste.' },
    { icon: 'concierge-bell', title: 'Mess & Canteens', desc: 'Affordable daily supply — pure fresh mutton delivered every morning without fail.' },
    { icon: 'truck', title: 'Pan-District Delivery', desc: 'Fresh logistics covering Krishna, NTR & Guntur districts — same day, every day.' },
    { icon: 'handshake', title: 'Partnership Model', desc: 'Long-term contracts with daily fresh supply — no refrigeration, only freshness guaranteed.' }
  ],
  cuts: [
    'Boneless Mutton — Curry Cut & Chunks',
    'Bone-in Mutton — Curry Cut',
    'Mutton Keema (Minced)',
    'Mutton Liver',
    'Mutton Leg (Whole or Portion)',
    'Mutton Ribs / Chops',
    'Mutton Soup Bones',
    'Mutton Brain',
    'Mutton Fat (Tallow)',
    'Special Marinated Mutton'
  ],
  recipes: [
    { id:'r1', name:'Classic Mutton Biryani', author:'Royal Mutton Hub Kitchen', category:'Biryani', cuisine:'Hyderabadi', mealType:'Lunch/Dinner', diet:'non-veg', budget:'medium', costEstimate:'₹350-400', restrictions:[], image:'🍛', equipment:['Pressure cooker','Heavy bottom pan','Pot with tight lid','Mixing bowl'], prep:'30 min', cook:'1 hr', difficulty:'Medium', servings:4, ingredients:['500g mutton (bone-in curry cut)','2 cups basmati rice','2 onions (sliced)','2 tbsp ginger-garlic paste','1 cup yogurt','2 tsp biryani masala','1 tsp turmeric','1 tsp red chilli powder','4 tbsp ghee','Saffron soaked in 2 tbsp warm milk','Fresh coriander & mint leaves','Salt to taste'], steps:['Marinate mutton with yogurt, ginger-garlic paste, biryani masala, turmeric, chilli powder and salt for 2 hours.','Parboil rice until 70% done. Drain and set aside.','Fry sliced onions in ghee until golden brown. Remove half for garnish.','Add marinated mutton to remaining ghee and cook on high for 5 mins, then simmer covered for 20 mins.','Layer parboiled rice over the mutton. Sprinkle saffron milk, coriander, mint and fried onions.','Seal the pot with dough or foil. Cook on low flame for 25-30 mins.','Let it rest for 5 mins, then serve with raita or salan.'], tips:'Use aged basmati rice for best results. The marination time is key for tender meat.' },
    { id:'r2', name:'Andhra Mutton Curry', author:'Royal Mutton Hub Kitchen', category:'Curry', cuisine:'Andhra', mealType:'Lunch/Dinner', diet:'non-veg', budget:'medium', costEstimate:'₹250-300', restrictions:['gluten-free'], image:'🍛', equipment:['Pressure cooker','Pan','Mixing bowl'], prep:'20 min', cook:'45 min', difficulty:'Medium', servings:4, ingredients:['500g mutton (bone-in)','3 onions (finely chopped)','2 tbsp ginger-garlic paste','2 tbsp red chilli powder','1 tsp turmeric','1 tbsp coriander powder','1 tsp garam masala','1 cup thick coconut milk','5 dried red chillies','2 tbsp tamarind pulp','Curry leaves & mustard seeds for tempering','Salt to taste'], steps:['Pressure cook mutton with turmeric, salt and 1 cup water for 3 whistles.','In a pan, temper mustard seeds, curry leaves and dried red chillies in oil.','Add chopped onions and saute until golden. Add ginger-garlic paste and cook until raw smell goes.','Add red chilli powder, coriander powder and garam masala. Cook for 2 mins.','Add cooked mutton with its stock. Simmer for 15 mins.','Add coconut milk and tamarind pulp. Cook for 5 more mins. Do not boil after adding coconut milk.','Garnish with fresh coriander and serve with steamed rice or idli.'], tips:'Andhra style needs bold flavours — do not reduce the chilli. Coconut milk balances the heat.' },
    { id:'r3', name:'Mutton Keema Biryani', author:'Royal Mutton Hub Kitchen', category:'Biryani', cuisine:'Hyderabadi', mealType:'Lunch/Dinner', diet:'non-veg', budget:'medium', costEstimate:'₹300-350', restrictions:[], image:'🍛', equipment:['Pressure cooker','Pan','Pot with lid','Mixing bowl'], prep:'25 min', cook:'40 min', difficulty:'Easy', servings:3, ingredients:['400g mutton keema (minced)','1.5 cups basmati rice','2 onions (sliced)','1 tbsp ginger-garlic paste','1 cup yogurt','1 tsp red chilli powder','1 tsp biryani masala','2 tbsp ghee','1/2 cup green peas','Fresh mint & coriander','Salt to taste'], steps:['Wash and soak rice for 20 mins. Cook until 70% done and drain.','Heat ghee, fry sliced onions until golden. Remove half.','Add ginger-garlic paste, saute for 1 min. Add keema and cook until browned.','Add yogurt, chilli powder, biryani masala, salt and peas. Cook for 10 mins.','Layer rice over keema. Sprinkle mint, coriander and fried onions.','Cover and cook on low flame for 15-20 mins.','Mix gently before serving. Serve with raita.'], tips:'Keema biryani cooks faster than traditional biryani. Do not overcook the keema.' },
    { id:'r4', name:'Mutton Liver Fry (Kaleji)', author:'Royal Mutton Hub Kitchen', category:'Starter', cuisine:'Andhra', mealType:'Snacks', diet:'non-veg', budget:'low', costEstimate:'₹120-150', restrictions:['gluten-free','dairy-free'], image:'🍳', equipment:['Pan','Knife','Mixing bowl'], prep:'15 min', cook:'15 min', difficulty:'Easy', servings:2, ingredients:['300g mutton liver (cleaned)','2 onions (sliced)','1 tbsp ginger-garlic paste','1 tsp red chilli powder','1/2 tsp turmeric','1 tsp garam masala','1 tbsp lemon juice','Curry leaves','Fresh coriander','Salt to taste'], steps:['Clean liver thoroughly and cut into bite-sized pieces.','Marinate with turmeric, chilli powder, salt and lemon juice for 15 mins.','Heat oil in a pan. Add curry leaves and sliced onions. Fry until onions are golden.','Add ginger-garlic paste and saute for 1 min.','Add liver pieces and cook on high flame for 3-4 mins, stirring constantly.','Reduce flame, add garam masala and cook for another 3-4 mins.','Garnish with coriander and serve hot as a starter or with roti.'], tips:'Do not overcook liver — it becomes rubbery. High flame, quick cooking is the secret.' },
    { id:'r5', name:'Mutton Soup (Mutton Ka Shorba)', author:'Royal Mutton Hub Kitchen', category:'Soup', cuisine:'North Indian', mealType:'Snacks', diet:'non-veg', budget:'low', costEstimate:'₹100-150', restrictions:['gluten-free','dairy-free'], image:'🍜', equipment:['Pressure cooker','Strainer'], prep:'15 min', cook:'1 hr 30 min', difficulty:'Easy', servings:4, ingredients:['500g mutton soup bones','1 onion (chopped)','2 tbsp ginger-garlic paste','2 black cardamom','4 black peppercorns','2 bay leaves','1 cinnamon stick','1 tsp turmeric','1 tbsp ghee','Fresh coriander & lemon wedges','Salt to taste'], steps:['Wash soup bones thoroughly.','Heat ghee in a pressure cooker. Add cardamom, peppercorns, bay leaves and cinnamon.','Add chopped onion and ginger-garlic paste. Saute until fragrant.','Add soup bones and turmeric. Saute for 3-4 mins.','Add 6 cups of water and salt. Pressure cook for 30-35 mins (6-7 whistles).','Let pressure release naturally. Strain the broth.','Shred any meat from bones and add back to soup. Garnish with coriander and serve hot with lemon wedges.'], tips:'For richer flavour, roast the bones before pressure cooking. The longer it simmers, the better the taste.' },
    { id:'r6', name:'Mutton Kebab (Seekh Kebab)', author:'Royal Mutton Hub Kitchen', category:'Kebab', cuisine:'Mughlai', mealType:'Snacks', diet:'non-veg', budget:'medium', costEstimate:'₹300-350', restrictions:['gluten-free'], image:'🍢', equipment:['Grill or oven','Skewers','Mixing bowl','Refrigerator','Mincer'], prep:'40 min', cook:'20 min', difficulty:'Medium', servings:4, ingredients:['500g mutton keema (minced, ideally twice-ground)','1 onion (finely chopped)','2 tbsp ginger-garlic paste','2 green chillies (finely chopped)','1 tsp garam masala','1 tsp cumin powder','1/2 tsp chaat masala','2 tbsp roasted gram flour (besan)','2 tbsp fresh coriander','1 egg','Salt to taste','Melted butter for basting'], steps:['Mix keema with all ingredients except butter. Knead well for 5-7 mins.','Refrigerate the mixture for 30 mins.','Soak skewers in water for 20 mins (if using wooden ones).','Divide mixture into equal portions and shape around skewers in a cylindrical form.','Grill on a gas grill or bake at 200°C for 15-18 mins, turning occasionally.','Baste with melted butter and grill for 2 more mins.','Serve hot with mint chutney and onion rings.'], tips:'Twice-ground keema gives smoother texture. Adding a bit of raw papaya paste helps tenderise.' },
    { id:'r7', name:'Mutton Chops (Ribs Fry)', author:'Royal Mutton Hub Kitchen', category:'Starter', cuisine:'Andhra', mealType:'Snacks', diet:'non-veg', budget:'medium', costEstimate:'₹250-300', restrictions:['gluten-free','dairy-free'], image:'🍖', equipment:['Pan','Mixing bowl','Knife'], prep:'20 min', cook:'30 min', difficulty:'Easy', servings:3, ingredients:['500g mutton ribs/chops','2 tbsp ginger-garlic paste','1 tsp red chilli powder','1/2 tsp turmeric','1 tsp garam masala','2 tbsp lemon juice','2 tbsp oil','1 tbsp cornflour','Curry leaves','Salt to taste'], steps:['Make deep cuts on the chops for better marination.','Mix ginger-garlic paste, chilli powder, turmeric, garam masala, lemon juice, oil, cornflour and salt.','Apply marinade to chops and rest for 30 mins.','Shallow fry on medium flame for 6-8 mins per side until golden and cooked through.','Garnish with curry leaves and serve with onion salad and chutney.'], tips:'The cornflour gives a crispy exterior. Do not rush — cook on medium flame for juiciness.' },
    { id:'r8', name:'Andhra Mutton Pulusu', author:'Royal Mutton Hub Kitchen', category:'Curry', cuisine:'Andhra', mealType:'Lunch/Dinner', diet:'non-veg', budget:'low', costEstimate:'₹180-220', restrictions:['gluten-free','dairy-free'], image:'🍛', equipment:['Pressure cooker','Pan','Mixing bowl'], prep:'20 min', cook:'40 min', difficulty:'Medium', servings:4, ingredients:['500g mutton (bone-in)','2 cups tamarind extract (thin)','1 onion (sliced)','1 tbsp ginger-garlic paste','2 tsp red chilli powder','1 tsp turmeric','1 tsp fenugreek seeds','5 dried red chillies','2 tbsp rice flour (for slurry)','Curry leaves & mustard seeds','Salt to taste', 'ghee'], steps:['Pressure cook mutton with turmeric and salt for 3 whistles.','Heat ghee, add mustard seeds, fenugreek seeds, dried red chillies and curry leaves.','Add sliced onion and ginger-garlic paste. Saute until golden.','Add red chilli powder and cook for 1 min.','Add tamarind extract and cooked mutton with stock. Bring to a boil.','Simmer for 20 mins until gravy thickens.','Mix rice flour with water to make a slurry. Add to the curry and stir until thickened.','Serve with hot rice and a drizzle of ghee.'], tips:'Pulusu should have a tangy flavour. Adjust tamarind to your preference.' },
    { id:'r9', name:'Andhra Vegetable Biryani', author:'Royal Mutton Hub Kitchen', category:'Biryani', cuisine:'Andhra', mealType:'Lunch/Dinner', diet:'veg', budget:'low', costEstimate:'₹120-160', restrictions:['gluten-free'], image:'🍚', equipment:['Pressure cooker','Pan','Pot with lid'], prep:'20 min', cook:'30 min', difficulty:'Easy', servings:4, ingredients:['1.5 cups basmati rice','1 cup mixed vegetables (carrot, beans, peas, potato)','1 onion (sliced)','1 tbsp ginger-garlic paste','1 tsp biryani masala','1/2 tsp turmeric','1/2 tsp red chilli powder','2 tbsp ghee','1/2 cup yogurt','Fresh mint & coriander','Salt to taste','Saffron soaked in 2 tbsp warm milk'], steps:['Wash and soak rice for 20 mins. Cook until 70% done and drain.','Heat ghee, fry sliced onions until golden. Remove half for garnish.','Add ginger-garlic paste and saute for 1 min. Add mixed vegetables and cook for 3-4 mins.','Add yogurt, biryani masala, turmeric, chilli powder and salt. Cook for 2 mins.','Layer rice over vegetables. Sprinkle saffron milk, mint and fried onions.','Cover and cook on low flame for 15-20 mins.','Mix gently and serve with raita.'], tips:'Use whatever vegetables are in season. Add a spoon of ghee on top before serving for extra flavour.' },
    { id:'r10', name:'Gongura Pappu (Andhra Dal)', author:'Royal Mutton Hub Kitchen', category:'Dal', cuisine:'Andhra', mealType:'Lunch/Dinner', diet:'veg', budget:'low', costEstimate:'₹80-100', restrictions:['vegan','gluten-free','dairy-free','nut-free'], image:'🍲', equipment:['Pressure cooker','Pan'], prep:'10 min', cook:'20 min', difficulty:'Easy', servings:4, ingredients:['1 cup toor dal (pigeon pea lentils)','2 cups gongura leaves (sorrel leaves), chopped','2 dried red chillies','1 tsp mustard seeds','1/2 tsp turmeric','1 tbsp ghee','3 garlic cloves (crushed)','Salt to taste','Pinch of asafoetida'], steps:['Wash dal and pressure cook with turmeric, asafoetida and 2 cups water for 3 whistles.','While dal cooks, wash and chop gongura leaves.','Mash the cooked dal well and set aside.','In a pan, heat ghee. Add mustard seeds and dried red chillies. Let them splutter.','Add crushed garlic and saute until golden. Add gongura leaves and cook until they wilt (3-4 mins).','Add the cooked dal and salt. Mix well and simmer for 5 mins.','Serve hot with steamed rice and a drizzle of ghee.'], tips:'Gongura is naturally tangy — no need to add tamarind. Fresh gongura leaves give the best flavour.' },
    { id:'r11', name:'Andhra Tomato Pappu', author:'Royal Mutton Hub Kitchen', category:'Dal', cuisine:'Andhra', mealType:'Lunch/Dinner', diet:'veg', budget:'low', costEstimate:'₹60-80', restrictions:['vegan','gluten-free','dairy-free','nut-free'], image:'🍲', equipment:['Pressure cooker','Pan'], prep:'10 min', cook:'20 min', difficulty:'Easy', servings:4, ingredients:['1 cup toor dal','3 ripe tomatoes (chopped)','2 green chillies (slit)','1/2 tsp turmeric','1 tsp mustard seeds','2 dried red chillies','1 tbsp ghee','6 curry leaves','Salt to taste','Fresh coriander for garnish'], steps:['Wash dal and pressure cook with turmeric, tomatoes, green chillies and water for 3 whistles.','Mash the dal well. The tomatoes should be fully cooked into the dal.','In a pan, heat ghee. Add mustard seeds, dried red chillies and curry leaves.','Pour the tempering over the dal. Add salt and mix well.','Simmer for 3-4 mins. Garnish with fresh coriander.','Serve hot with steamed rice and papad.'], tips:'Ripe, red tomatoes give the best colour and flavour. This is the most budget-friendly Andhra meal.' },
    { id:'r12', name:'Gutti Vankaya (Stuffed Eggplant Curry)', author:'Royal Mutton Hub Kitchen', category:'Curry', cuisine:'Andhra', mealType:'Lunch/Dinner', diet:'veg', budget:'low', costEstimate:'₹100-140', restrictions:['vegan','gluten-free','dairy-free','nut-free'], image:'🍆', equipment:['Pan','Mixing bowl'], prep:'15 min', cook:'25 min', difficulty:'Medium', servings:4, ingredients:['6 small brinjals (eggplants), slit','1 onion (finely chopped)','2 tbsp peanuts (roasted & powdered)','1 tsp sesame seeds','1 tsp cumin seeds','1 tsp coriander powder','1/2 tsp red chilli powder','1/2 tsp turmeric','1 tbsp tamarind paste','2 tbsp oil','Curry leaves & mustard seeds','Salt to taste'], steps:['Mix peanut powder, sesame seeds, cumin, coriander powder, chilli powder, turmeric and salt into a stuffing.','Stuff each brinjal carefully with the spice mix.','Heat oil in a pan. Add mustard seeds and curry leaves.','Add chopped onion and saute until golden.','Place stuffed brinjals gently in the pan. Add 1/2 cup water and tamarind paste.','Cover and cook on low flame for 15-20 mins until brinjals are tender. Stir occasionally.','Serve hot with steamed rice or roti.'], tips:'Small, tender brinjals work best. Do not cut all the way through — keep the stem end intact.' }
  ]
};

__RMH.ADMIN_EMAIL = 'rmhubrj18@gmail.com';
__RMH.PREFIX = 'rmh_admin_';
__RMH.SITE_PREFIX = 'rmh_site_';

// ── Crypto (AES-256-GCM via Web Crypto API) ─────────
(function() {
  var ALGO = 'AES-GCM', KEY_LEN = 256, ITERATIONS = 100000, HASH = 'SHA-256';

  async function deriveKey(password, salt) {
    if (!password || password.length < 1) throw new Error('Password required');
    var enc = new TextEncoder();
    var keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey({ name: 'PBKDF2', salt: salt, iterations: ITERATIONS, hash: HASH }, keyMaterial, { name: ALGO, length: KEY_LEN }, false, ['encrypt', 'decrypt']);
  }

  function toBase64(buf) {
    return btoa(String.fromCharCode.apply(null, new Uint8Array(buf)));
  }

  function fromBase64(str) {
    return Uint8Array.from(atob(str), function(c) { return c.charCodeAt(0); });
  }

  __RMH.Crypto = {
    encrypt: async function(password, data) {
      var salt = crypto.getRandomValues(new Uint8Array(16));
      var iv = crypto.getRandomValues(new Uint8Array(12));
      var key = await deriveKey(password, salt);
      var encoded = new TextEncoder().encode(JSON.stringify(data));
      var encrypted = await crypto.subtle.encrypt({ name: ALGO, iv: iv }, key, encoded);
      return toBase64(salt) + ':' + toBase64(iv) + ':' + toBase64(encrypted);
    },
    decrypt: async function(password, payload) {
      if (!payload || typeof payload !== 'string') return null;
      try {
        var parts = payload.split(':');
        if (parts.length !== 3) return null;
        var salt = fromBase64(parts[0]);
        var iv = fromBase64(parts[1]);
        var data = fromBase64(parts[2]);
        var key = await deriveKey(password, salt);
        var decrypted = await crypto.subtle.decrypt({ name: ALGO, iv: iv }, key, data);
        return JSON.parse(new TextDecoder().decode(decrypted));
      } catch(e) { return null; }
    }
  };
})();

// ── Store (localStorage with schema validation + encryption) ──
(function() {
  __RMH.Store = {
    get: function(key, fallback) {
      try {
        var v = localStorage.getItem(__RMH.PREFIX + key);
        return v ? __RMH.safeParse(v, fallback) : (fallback !== undefined ? fallback : null);
      } catch(e) { return fallback !== undefined ? fallback : null; }
    },
    set: function(key, value) {
      localStorage.setItem(__RMH.PREFIX + key, JSON.stringify(value));
    },
    remove: function(key) {
      localStorage.removeItem(__RMH.PREFIX + key);
    },
    getEncrypted: async function(key, password, fallback) {
      try {
        var v = localStorage.getItem(__RMH.PREFIX + key);
        return v ? (await __RMH.Crypto.decrypt(password, v) || fallback) : (fallback !== undefined ? fallback : null);
      } catch(e) { return fallback !== undefined ? fallback : null; }
    },
    setEncrypted: async function(key, password, value) {
      var enc = await __RMH.Crypto.encrypt(password, value);
      localStorage.setItem(__RMH.PREFIX + key, enc);
    },
    importAll: async function(password, encryptedB64) {
      var dec = await __RMH.Crypto.decrypt(password, encryptedB64);
      if (!dec) return false;
      for (var key in dec) {
        if (dec.hasOwnProperty(key) && !key.startsWith('_')) {
          localStorage.setItem(__RMH.PREFIX + key, dec[key]);
        }
      }
      return true;
    },
    exportAll: async function(password) {
      var all = {};
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && k.startsWith(__RMH.PREFIX)) {
          all[k.slice(__RMH.PREFIX.length)] = localStorage.getItem(k);
        }
      }
      return __RMH.Crypto.encrypt(password, all);
    },
    siteGet: function(key, fallback) {
      return __RMH.safeParse(localStorage.getItem(__RMH.SITE_PREFIX + key), fallback !== undefined ? fallback : null);
    },
    siteSet: function(key, value) {
      localStorage.setItem(__RMH.SITE_PREFIX + key, JSON.stringify(value));
    }
  };
})();

// ── Bot API key from admin dashboard ──
window.__RMH.API_KEY = localStorage.getItem('rmh_bot_apikey') || '';

// ── Merge chef recipes if available ──────────
// chef-recipes.js is loaded via defer; merge happens in DOMContentLoaded
if (typeof __RMH !== 'undefined' && __RMH.mergeChefRecipes) {
  __RMH.BUSINESS.recipes = __RMH.mergeChefRecipes();
}
