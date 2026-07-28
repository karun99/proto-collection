# Royal Mutton Hub

> Vijayawada-based B2B mutton distributor — fresh, pure, tender mutton delivered daily across Krishna, NTR & Guntur districts.

## Features

###  Website
- **Hero** — indigenous brand badges, CTA buttons (Enquire / WhatsApp / Call), district badges
- **How We Work** — 5-step B2B process
- **B2B Supply** — 6 service cards (Hotels, Restaurants, Caterers, Mess, Retail Chains, Bulk Supply)
- **Why Us** — indigenous highlight + 9 benefit cards
- **Testimonials** — 6 client reviews
- **Recipe Database** — 12 seed recipes + 9 chef-credited recipes with filters (diet, budget, cuisine, meal type), search, submission form, ratings, "I Cooked This!", reviews, sharing
- **Contact** — bilingual address (English/Telugu), OpenStreetMap, enquiry form
- **AI Chatbot** — OpenRouter-powered with canned fallback, lead capture, Quote/Order/Meeting/Policy tabs
- **Admin Dashboard** — password-protected dashboard with 9 tabs

###  RecipeDB (`RecipeDB/`)
- 22 static HTML pages (12 seed + 9 chef + index) with JSON-LD structured data, OG tags, share buttons, chef credit badges

###  AI Chatbot (`embed.js`)
- OpenRouter API integration with configurable model
- Canned response fallback when offline
- Prompt injection detection
- Lead capture to localStorage
- **Meeting scheduling** with date/time picker
- Rich message formatting (**bold**, bullet lists, paragraphs)

###  Admin Dashboard (`admin.html`)
| Tab | Description |
|-----|-------------|
| Overview | Stats cards, recent activity feed |
| API Keys | Encrypted OpenRouter key storage, test, rotate |
| Password | Change admin password |
| Branding | Edit name, tagline, address (EN/TE), phone, WhatsApp, email, mutton cuts, custom CSS |
| Theming | Dark/light toggle, accent color, font, border radius, 5 presets |
| RecipeDB | CRUD for user & chef recipes, export/import JSON |
| **Meetings** | Manage B2B meeting requests (confirm/complete/cancel) |
| Data Management | Encrypted backup/restore, local snapshots, danger zone |
| API Usage | Page views, API calls, leads table |

### Security
- AES-256-GCM encryption for API keys & backups
- DevTools detector (dimension delta)
- Right-click, copy, keyboard shortcut blocking
- Input sanitization, rate limiting on recipe submissions

---

## Project Structure

```
├── index.html              Main site (8 sections, recipe grid, filters, modal)
├── recipedb.html           Standalone recipe database page
├── admin.html              Admin dashboard (9 tabs)
├── utils.js                Shared constants, crypto, helpers
├── embed.js                AI chatbot widget (tabs: Chat, Quote, Order, Meeting, Policy)
├── chef-recipes.js         9 chef-credited recipes (Sanjeev Kapoor, Ranveer Brar, etc.)
├── generate-recipes.js     Build script — generates RecipeDB/*.html
├── fetch-commodity-prices.js  Build script — fetches mandi prices from data.gov.in
├── logo.png                Brand logo
├── netlify.toml            Netlify deployment config
├── vercel.json             Vercel deployment config
├── package.json            Project metadata
└── RecipeDB/               22 static recipe HTML pages
    ├── index.html
    ├── classic-mutton-biryani.html
    ├── andhra-mutton-curry.html
    └── ... (19 more)
```

---

## Setup

### 1. Clone & Serve Locally
```bash
npm install
npm start
# or: npx serve .
```

### 2. Configure API Key (for AI Chatbot)
1. Open `http://localhost:3000/admin.html` in your browser
2. Login with default password: `admin123`
3. Go to **API Keys** tab
4. Paste your [OpenRouter API key](https://openrouter.ai/keys)
5. Click **Save**
6. Select a model from the dropdown (e.g. `openrouter/free`)

### 3. Change Admin Password
- Go to **Password** tab in admin dashboard
- Enter current password (`admin123`), new password, confirm
- Click **Change Password**

### 4. Regenerate RecipeDB Pages (after recipe changes)
```bash
node generate-recipes.js
```

---

## Screenshots

> _Screenshots can be captured by opening each page in a browser and using browser dev tools or a screenshot extension. Below are the key pages to capture:_

### Main Site (`index.html`)

| Section | Description | Screenshot |
|---------|-------------|------------|
| **Hero** | Brand badges, CTA buttons, district badges at top | `screenshots/hero.png` |
| **How We Work** | 5-step process cards | `screenshots/how-we-work.png` |
| **B2B Supply** | 6 service cards for B2B clients | `screenshots/b2b-supply.png` |
| **Why Us** | Indigenous highlight + 9 benefit cards | `screenshots/why-us.png` |
| **Testimonials** | 6 client reviews | `screenshots/testimonials.png` |
| **Recipe Grid** | Recipe cards with filters and search | `screenshots/recipe-grid.png` |
| **Recipe Modal** | Full recipe view with ingredients, instructions, equipment, rating, reviews, share | `screenshots/recipe-modal.png` |
| **Contact** | Bilingual address, map, enquiry form | `screenshots/contact.png` |
| **Chatbot** | AI chatbot widget open with chat/message | `screenshots/chatbot.png` |
| **Meeting Tab** | Meeting scheduling form in chatbot | `screenshots/meeting-form.png` |

### RecipeDB (`recipedb.html`)

| Section | Description | Screenshot |
|---------|-------------|------------|
| **Recipe List** | Recipe cards with full filters | `screenshots/recipedb-list.png` |
| **Recipe Detail** | Static recipe page with JSON-LD | `screenshots/recipedb-detail.png` |

### Admin Dashboard (`admin.html`)

| Tab | Description | Screenshot |
|-----|-------------|------------|
| **Login** | Password login screen | `screenshots/admin-login.png` |
| **Overview** | Stats cards and recent activity | `screenshots/admin-overview.png` |
| **API Keys** | Encrypted API key management | `screenshots/admin-apikeys.png` |
| **Password** | Change admin password form | `screenshots/admin-password.png` |
| **Branding** | Business info, cuts, custom CSS | `screenshots/admin-branding.png` |
| **Theming** | Dark/light toggle, accent color, font, radius, presets | `screenshots/admin-theming.png` |
| **RecipeDB** | Recipe CRUD table with search | `screenshots/admin-recipedb.png` |
| **Meetings** | Meeting requests table with status actions | `screenshots/admin-meetings.png` |
| **Data Management** | Backup/restore, danger zone | `screenshots/admin-data.png` |
| **API Usage** | Analytics stats, leads table, API calls | `screenshots/admin-usage.png` |

---

## Deployment

###  Netlify (Recommended)

**One-click:**
1. Push this folder to a Git repository (GitHub/GitLab/Bitbucket)
2. Go to [Netlify](https://app.netlify.com) → **Add new site** → **Import from Git**
3. Select repo → **Deploy** (no build command needed — publish directory is `.`)

**Or drag-drop:**
1. Go to [Netlify](https://app.netlify.com) → **Sites** → **Drag and drop your site folder here**
2. Drop the entire `client` folder

**Custom domain (optional):**
- Netlify → Site settings → Domain management → Add custom domain

###  Vercel

**One-click:**
1. Push to Git repo
2. Go to [Vercel](https://vercel.com) → **Add New** → **Project**
3. Import repo → **Deploy** (Vercel auto-detects static config from `vercel.json`)

**Or using CLI:**
```bash
npx vercel --prod
```

### Post-Deployment Checklist

- [ ] Open `https://your-site.netlify.app` — Hero, cards, recipes render correctly
- [ ] Open `https://your-site.netlify.app/admin.html` — Login works (default: `admin123`)
- [ ] Go to **API Keys** → Paste OpenRouter key → Save → Test
- [ ] Go to **Password** → Change password
- [ ] Open chatbot → Type "Schedule Meeting" → Fill form → Submit
- [ ] Go to **Meetings** tab in admin → Verify meeting appears
- [ ] Open `https://your-site.netlify.app/RecipeDB/classic-mutton-biryani.html` — Static page renders
- [ ] Test on mobile — responsive layout, no false-positive anti-bot triggers
- [ ] Check CSP headers: `curl -I https://your-site.netlify.app/ | grep Content-Security-Policy`

---

## Configuration

### Changing the OpenRouter Model
- In admin dashboard → **API Keys** tab → Select model from dropdown
- Default: `openrouter/free`
- Options include: `google/gemini-2.5-pro-exp:free`, `anthropic/claude-3.5-haiku:free`, etc.

### API Key Storage
- Encrypted with AES-256-GCM using admin password
- Stored in `rmh_admin_apiKey` (encrypted) + `rmh_bot_apikey` (plaintext for the chatbot)
- Plaintext copy is only used for OpenRouter API calls from the browser

### localStorage Keys
| Key | Purpose |
|-----|---------|
| `rmh_admin_hash` | Admin password hash |
| `rmh_admin_apiKey` | Encrypted API key |
| `rmh_bot_apikey` | Plaintext API key for chatbot |
| `rmh_admin_model` | Selected AI model |
| `rmh_admin_branding` | Branding overrides |
| `rmh_admin_cuts` | Custom mutton cuts |
| `rmh_admin_theme` | Theme settings |
| `rmh_admin_customCss` | Custom CSS rules |
| `rmh_recipes` | User-submitted recipes |
| `rmh_ratelimit` | Recipe submission rate limiter |
| `rmh_appreciation` | Ratings & "I Cooked This" counts |
| `rmh_reviews` | User text reviews per recipe |
| `rmh_meetings` | B2B meeting requests |
| `rmh_analytics` | Page views, API calls, leads |

---

## Build Scripts

```bash
# Generate RecipeDB static pages (after recipe changes)
node generate-recipes.js

# Fetch live commodity prices from data.gov.in (requires API key)
node fetch-commodity-prices.js --output prices.json
```

---

## Tech Stack

- **Vanilla HTML/CSS/JS** — no frameworks, no build tools
- **Font Awesome 6.5.1** — icons (CDN)
- **Google Inter Font** — typography (CDN)
- **OpenStreetMap** — embedded map
- **OpenRouter** — AI chatbot API
- **AES-256-GCM** — client-side encryption (Web Crypto API)
- **Netlify / Vercel** — deployment

---

## License

Private — Royal Mutton Hub, Vijayawada.
