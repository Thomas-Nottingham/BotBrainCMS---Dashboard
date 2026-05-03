# BotBrain CMS

A full-stack content management system for your chatbot. Manage products,
knowledge entries, and widget appearance from a React dashboard. Your Python
chatbot fetches live data from the API instead of reading hardcoded dicts.

```
botbrain/
├── backend/
│   ├── main.py          ← FastAPI app (all CRUD endpoints)
│   ├── models.py        ← Pydantic schemas
│   ├── data_loader.py   ← Drop-in replacement for your Python dicts
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── api/client.js
│   │   ├── components/
│   │   │   ├── Sidebar.jsx
│   │   │   └── UI.jsx
│   │   └── pages/
│   │       ├── Products.jsx
│   │       ├── Knowledge.jsx
│   │       ├── Appearance.jsx
│   │       ├── Clients.jsx
│   │       └── Settings.jsx
│   ├── package.json
│   └── vite.config.js
└── scripts/
    └── seed.py          ← One-time migration of your existing data
```

---

## Step 1 — Set up MongoDB Atlas (free, ~5 minutes)

1. Go to https://cloud.mongodb.com and create a free account
2. Click **"Build a database"** → choose **M0 Free** tier → pick a region
3. Create a database user (remember the username + password)
4. Under **Network Access** → **Add IP Address** → **Allow Access from Anywhere**
   (you can lock this down to your server IP later)
5. Click **Connect** → **Drivers** → copy the connection string
   It looks like: `mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/`

---

## Step 2 — Set up the backend

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Create your .env file
cp .env.example .env
```

Edit `.env`:
```
MONGODB_URI=mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/
DB_NAME=botbrain
```

### Run the seed script (ONE TIME ONLY)

This migrates your existing Python dicts into MongoDB:

```bash
cd ../scripts
python seed.py
```

You should see output like:
```
📦 Seeding products...
  ✅ Inserted home001: Fruit Twig Circle 25cm
  ✅ Inserted home002: Fruit Organza Bag
  ...
🧠 Seeding knowledge entries...
  ✅ Inserted [general] company_overview
  ...
✨ Done! Products: 13 inserted, Knowledge: 16 inserted
```

### Start the backend API

```bash
cd backend
uvicorn main:app --reload --port 8001
```

Test it: open http://localhost:8001/api/products in your browser.
You should see your 13 products as JSON.

The full API docs are at: http://localhost:8001/docs

---

## Step 3 — Set up the frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000 — you'll see the CMS dashboard connected to your live data.

---

## Step 4 — Link your chatbot to the CMS (THE KEY STEP)

This is the only change you need to make to your existing chatbot code.

### In your chatbot's environment, add:

```
BOTBRAIN_API_URL=http://localhost:8001   # or your deployed backend URL
BOTBRAIN_CACHE_TTL=60                    # cache for 60 seconds
```

### In your tools.py (or wherever you use PRODUCT_KNOWLEDGE):

**Before:**
```python
from .products import PRODUCT_KNOWLEDGE
from .knowledge import GENERAL_KNOWLEDGE, SUPPORT_KNOWLEDGE
```

**After:**
```python
from .data_loader import get_product_knowledge, get_general_knowledge, get_support_knowledge
```

### Update your tool functions:

**Before (show_product_card tool):**
```python
product = PRODUCT_KNOWLEDGE.get(product_id)
```

**After:**
```python
product_knowledge = await get_product_knowledge()
product = product_knowledge.get(product_id)
```

**Before (any knowledge retrieval):**
```python
for entry in GENERAL_KNOWLEDGE:
    ...
```

**After:**
```python
for entry in await get_general_knowledge():
    ...
```

That's it. The data_loader.py file is a drop-in async replacement that:
- Fetches from your API
- Caches results for 60 seconds (configurable)
- Returns the exact same dict/list shape as your original Python dicts

---

## Step 5 — Deploy (when ready)

### Backend → Railway (easiest, free tier available)

1. Push your `backend/` folder to a GitHub repo
2. Go to https://railway.app → New Project → Deploy from GitHub
3. Add your environment variables (MONGODB_URI, DB_NAME) in the Railway dashboard
4. Railway auto-detects FastAPI and deploys it
5. You'll get a URL like `https://botbrain-api.up.railway.app`

### Frontend → Vercel (free)

1. Push your `frontend/` folder to GitHub
2. Go to https://vercel.com → New Project → import your repo
3. Add environment variable: `VITE_API_URL=https://your-railway-url.up.railway.app/api`
4. Deploy — you'll get a URL like `https://botbrain-cms.vercel.app`

### Update your chatbot's env var:
```
BOTBRAIN_API_URL=https://your-railway-url.up.railway.app
```

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/products | List all products (supports ?q= and ?category=) |
| POST | /api/products | Create a product |
| PUT | /api/products/{id} | Update a product |
| DELETE | /api/products/{id} | Delete a product |
| GET | /api/knowledge | List knowledge entries (supports ?category=) |
| POST | /api/knowledge | Create an entry |
| PUT | /api/knowledge/{key} | Update an entry |
| DELETE | /api/knowledge/{key} | Delete an entry |
| GET | /api/chatbot/products | Chatbot-optimised product dict (keyed by product_id) |
| GET | /api/chatbot/knowledge | Chatbot-optimised knowledge list |
| GET | /health | Health check |

---

## Adding a new product (the whole point)

1. Open the CMS at http://localhost:3000
2. Go to **Products** → click **+ Add product**
3. Fill in the form and click **Save**
4. Within 60 seconds (cache TTL), your chatbot will know about the new product

No code changes required.

---

## Troubleshooting

**"Cannot connect to MongoDB"**
→ Check your MONGODB_URI in .env — make sure you replaced `<password>` with your actual password
→ Check MongoDB Atlas Network Access — your IP must be whitelisted

**"Module not found: data_loader"**
→ Copy `backend/data_loader.py` into the same directory as your existing chatbot tools

**"Product not found" errors after migration**
→ Run `python scripts/seed.py` again — it skips existing entries so it's safe to re-run

**CORS errors in the browser**
→ The backend allows all origins by default. If you're deploying, replace `allow_origins=["*"]`
   in `main.py` with your specific frontend domain.
