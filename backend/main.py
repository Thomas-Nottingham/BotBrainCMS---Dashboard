# from fastapi import FastAPI, HTTPException
# from fastapi.middleware.cors import CORSMiddleware
# from motor.motor_asyncio import AsyncIOMotorClient
# from contextlib import asynccontextmanager
# from bson import ObjectId
# from typing import Optional
# import os
# import httpx

# from openai import AsyncOpenAI
# from dotenv import load_dotenv

# load_dotenv()

# openai_client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# CHATBOT_URL = "http://localhost:8000"

# async def embed_text(text: str) -> list[float]:
#     response = await openai_client.embeddings.create(
#         model="text-embedding-ada-002",
#         input=text
#     )
#     return response.data[0].embedding


# async def notify_chatbot_reload():
#     try:
#         async with httpx.AsyncClient() as client:
#             await client.post(f"{CHATBOT_URL}/api/reload", timeout=5)
#             print("🔄 Chatbot reload triggered")
#     except Exception as e:
#         print(f"⚠️ Chatbot reload failed (non-critical): {e}")


# from models import (
#     Product, ProductCreate, ProductUpdate,
#     KnowledgeEntry, KnowledgeEntryCreate, KnowledgeEntryUpdate,
#     PyObjectId
# )

# MONGODB_URI = os.getenv("MONGODB_URI", "mongodb+srv://vitreongen_db_user:7I0TIyn3Ja21mFXN@vitreon-dashboard.rnn0q9b.mongodb.net/")
# DB_NAME = os.getenv("DB_NAME", "botbrain")

# client: AsyncIOMotorClient = None
# db = None

# @asynccontextmanager
# async def lifespan(app: FastAPI):
#     global client, db
#     client = AsyncIOMotorClient(MONGODB_URI)
#     db = client[DB_NAME]
#     await db.products.create_index("product_id", unique=True)
#     await db.knowledge.create_index([("key", 1), ("category", 1)], unique=True)
#     yield
#     client.close()

# app = FastAPI(title="BotBrain CMS API", lifespan=lifespan)

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# def fix_id(doc: dict) -> dict:
#     if doc and "_id" in doc:
#         doc["_id"] = str(doc["_id"])
#     return doc


# # ─── PRODUCTS ────────────────────────────────────────────────────────────────

# @app.get("/api/products")
# async def list_products(category: Optional[str] = None, q: Optional[str] = None):
#     query = {}
#     if category:
#         query["labels"] = category
#     if q:
#         query["$or"] = [
#             {"title": {"$regex": q, "$options": "i"}},
#             {"description": {"$regex": q, "$options": "i"}},
#             {"product_id": {"$regex": q, "$options": "i"}},
#         ]
#     cursor = db.products.find(query).sort("product_id", 1)
#     return [fix_id(p) async for p in cursor]


# @app.get("/api/products/{product_id}")
# async def get_product(product_id: str):
#     product = await db.products.find_one({"product_id": product_id})
#     if not product:
#         raise HTTPException(404, f"Product '{product_id}' not found")
#     return fix_id(product)


# @app.post("/api/products", status_code=201)
# async def create_product(product: ProductCreate):
#     existing = await db.products.find_one({"product_id": product.product_id})
#     if existing:
#         raise HTTPException(400, f"Product ID '{product.product_id}' already exists")
#     doc = product.model_dump()
#     text = f"{doc['title']} {doc['description']} {' '.join(doc.get('labels', []))}"
#     doc["embedding"] = await embed_text(text)
#     result = await db.products.insert_one(doc)
#     created = await db.products.find_one({"_id": result.inserted_id})
#     await notify_chatbot_reload()
#     return fix_id(created)


# @app.put("/api/products/{product_id}")
# async def update_product(product_id: str, update: ProductUpdate):
#     changes = {k: v for k, v in update.model_dump().items() if v is not None}
#     if not changes:
#         raise HTTPException(400, "No fields to update")

#     if any(k in changes for k in ("title", "description", "labels")):
#         current = await db.products.find_one({"product_id": product_id})
#         if current:
#             title = changes.get("title", current["title"])
#             description = changes.get("description", current["description"])
#             labels = changes.get("labels", current.get("labels", []))
#             text = f"{title} {description} {' '.join(labels)}"
#             changes["embedding"] = await embed_text(text)

#     result = await db.products.update_one(
#         {"product_id": product_id}, {"$set": changes}
#     )
#     if result.matched_count == 0:
#         raise HTTPException(404, f"Product '{product_id}' not found")
#     updated = await db.products.find_one({"product_id": product_id})
#     await notify_chatbot_reload()
#     return fix_id(updated)


# @app.delete("/api/products/{product_id}", status_code=204)
# async def delete_product(product_id: str):
#     result = await db.products.delete_one({"product_id": product_id})
#     if result.deleted_count == 0:
#         raise HTTPException(404, f"Product '{product_id}' not found")
#     await notify_chatbot_reload()


# # ─── KNOWLEDGE ───────────────────────────────────────────────────────────────

# @app.get("/api/knowledge")
# async def list_knowledge(category: Optional[str] = None):
#     query = {}
#     if category:
#         query["category"] = category
#     cursor = db.knowledge.find(query).sort("key", 1)
#     return [fix_id(k) async for k in cursor]


# @app.get("/api/knowledge/{key}")
# async def get_knowledge(key: str):
#     entry = await db.knowledge.find_one({"key": key})
#     if not entry:
#         raise HTTPException(404, f"Entry '{key}' not found")
#     return fix_id(entry)


# @app.post("/api/knowledge", status_code=201)
# async def create_knowledge(entry: KnowledgeEntryCreate):
#     existing = await db.knowledge.find_one({"key": entry.key})
#     if existing:
#         raise HTTPException(400, f"Key '{entry.key}' already exists")
#     doc = entry.model_dump()
#     doc["embedding"] = await embed_text(doc["text"])
#     result = await db.knowledge.insert_one(doc)
#     created = await db.knowledge.find_one({"_id": result.inserted_id})
#     await notify_chatbot_reload()
#     return fix_id(created)


# @app.put("/api/knowledge/{key}")
# async def update_knowledge(key: str, update: KnowledgeEntryUpdate):
#     changes = {k: v for k, v in update.model_dump().items() if v is not None}
#     if not changes:
#         raise HTTPException(400, "No fields to update")

#     if "text" in changes:
#         changes["embedding"] = await embed_text(changes["text"])

#     result = await db.knowledge.update_one({"key": key}, {"$set": changes})
#     if result.matched_count == 0:
#         raise HTTPException(404, f"Entry '{key}' not found")
#     updated = await db.knowledge.find_one({"key": key})
#     await notify_chatbot_reload()
#     return fix_id(updated)


# @app.delete("/api/knowledge/{key}", status_code=204)
# async def delete_knowledge(key: str):
#     result = await db.knowledge.delete_one({"key": key})
#     if result.deleted_count == 0:
#         raise HTTPException(404, f"Entry '{key}' not found")
#     await notify_chatbot_reload()


# # ─── CHATBOT RETRIEVAL ────────────────────────────────────────────────────────

# @app.get("/api/chatbot/products")
# async def chatbot_products():
#     cursor = db.products.find({}, {"_id": 0})
#     products = [p async for p in cursor]
#     return {p["product_id"]: p for p in products}


# @app.get("/api/chatbot/knowledge")
# async def chatbot_knowledge(category: Optional[str] = None):
#     cursor = db.knowledge.find({"category": category} if category else {}, {"_id": 0})
#     return [k async for k in cursor]


# @app.get("/api/appearance")
# async def get_appearance():
#     doc = await db.appearance.find_one({}, {"_id": 0})
#     if not doc:
#         return {
#             "accentColor": "#000000",
#             "colorScheme": "light",
#             "radius": "round",
#             "density": "spacious",
#             "hue": 210,
#             "tint": 5,
#             "shade": 3,
#             "botName": "Assistant",
#             "greeting": "Welcome! Ask me anything.",
#             "placeholder": "Type your question here..."
#         }
#     return doc

# @app.put("/api/appearance")
# async def update_appearance(data: dict):
#     await db.appearance.update_one({}, {"$set": data}, upsert=True)
#     return {"status": "saved"}


# @app.get("/health")
# async def health():
#     return {"status": "ok"}
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from contextlib import asynccontextmanager
from bson import ObjectId
from typing import Optional
import os
import httpx

from openai import AsyncOpenAI
from dotenv import load_dotenv
from apscheduler.schedulers.asyncio import AsyncIOScheduler

load_dotenv()

openai_client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

CHATBOT_URL = "http://localhost:8000"

async def embed_text(text: str) -> list[float]:
    response = await openai_client.embeddings.create(
        model="text-embedding-ada-002",
        input=text
    )
    return response.data[0].embedding


async def notify_chatbot_reload():
    try:
        async with httpx.AsyncClient() as client:
            await client.post(f"{CHATBOT_URL}/api/reload", timeout=5)
            print("🔄 Chatbot reload triggered")
    except Exception as e:
        print(f"⚠️ Chatbot reload failed (non-critical): {e}")



def map_product(p: dict) -> dict:
    def get_field(p, *keys):
        for key in keys:
            if p.get(key) is not None:
                return p[key]
        return None

    image_url = get_field(p, "image_url", "image", "thumbnail", "photo")
    if isinstance(image_url, list) and len(image_url) > 0:
        image_url = image_url[0].get("src", "")

    labels = get_field(p, "labels", "tags", "categories")
    if labels is None:
        cat = get_field(p, "category", "product_type", "type", "subcategory")
        labels = [cat] if cat else []
    if isinstance(labels, str):
        labels = [labels]

    return {
        "product_id": str(get_field(p, "product_id", "sku", "id")),
        "title": get_field(p, "title", "name", "product_name") or "Untitled",
        "description": get_field(p, "description", "body_html", "details", "summary") or "",
        "price": float(get_field(p, "price", "base_price", "cost", "amount") or 0),
        "currency": get_field(p, "currency") or "GBP",
        "image_url": image_url or "",
        "product_url": get_field(p, "product_url", "url", "link") or "",
        "labels": [l for l in labels if l],
        "quantity": int(get_field(p, "quantity", "stock", "stock_quantity") or 0),  # ← add this
    }

async def run_sync_job():
    config = await db.settings.find_one({}, {"_id": 0})
    if not config or not config.get("client_api_url"):
        print("⏭️ Sync skipped — no client API configured")
        return 0

    headers = {}
    if config.get("client_api_key"):
        headers["apikey"] = config["client_api_key"]
        headers["Authorization"] = f"Bearer {config['client_api_key']}"

    async with httpx.AsyncClient() as client:
        response = await client.get(config["client_api_url"], headers=headers, timeout=30)
        response.raise_for_status()
        raw_products = response.json()

    if isinstance(raw_products, dict):
        raw_products = (
            raw_products.get("products") or
            raw_products.get("data") or
            raw_products.get("items") or
            []
        )

    source_ids = set()
    inserted = updated = stock_updated = skipped = deleted = 0

    for p in raw_products:
        doc = map_product(p)
        source_ids.add(doc["product_id"])

        existing = await db.products.find_one({"product_id": doc["product_id"]})

        content_changed = (
            not existing or
            existing.get("title") != doc["title"] or
            existing.get("description") != doc["description"] or
            existing.get("price") != doc["price"] or
            existing.get("labels") != doc["labels"]
        )

        stock_changed = existing and existing.get("quantity") != doc["quantity"]

        if content_changed:
            # Full re-embed needed
            text = f"{doc['title']} {doc['description']} {' '.join(doc.get('labels', []))}"
            doc["embedding"] = await embed_text(text)
            if existing:
                updated += 1
            else:
                inserted += 1
        elif stock_changed:
            # Only stock changed — just update quantity, no re-embed
            doc["embedding"] = existing["embedding"]
            stock_updated += 1
        else:
            doc["embedding"] = existing["embedding"]
            skipped += 1

        await db.products.update_one(
            {"product_id": doc["product_id"]},
            {"$set": doc},
            upsert=True
        )

    # Delete products no longer in source
    existing_ids_cursor = db.products.find({}, {"product_id": 1, "_id": 0})
    existing_ids = {p["product_id"] async for p in existing_ids_cursor}
    ids_to_delete = existing_ids - source_ids

    if ids_to_delete:
        result = await db.products.delete_many({"product_id": {"$in": list(ids_to_delete)}})
        deleted = result.deleted_count

    if inserted > 0 or updated > 0 or stock_updated > 0 or deleted > 0:
        await notify_chatbot_reload()

    print(f"✅ Sync — {inserted} added, {updated} updated, {stock_updated} stock changes, {skipped} unchanged, {deleted} removed")
    return inserted + updated + stock_updated

scheduler = AsyncIOScheduler()

from models import (
    Product, ProductCreate, ProductUpdate,
    KnowledgeEntry, KnowledgeEntryCreate, KnowledgeEntryUpdate,
    PyObjectId
)

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb+srv://vitreongen_db_user:7I0TIyn3Ja21mFXN@vitreon-dashboard.rnn0q9b.mongodb.net/")
DB_NAME = os.getenv("DB_NAME", "botbrain")

client: AsyncIOMotorClient = None
db = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global client, db
    client = AsyncIOMotorClient(MONGODB_URI)
    db = client[DB_NAME]
    await db.products.create_index("product_id", unique=True)
    await db.knowledge.create_index([("key", 1), ("category", 1)], unique=True)

    # Start auto sync scheduler
    scheduler.add_job(run_sync_job, 'interval', minutes=1, id='auto_sync')
    scheduler.start()
    print("⏰ Auto sync scheduler started — running every 5 minutes")

    yield

    scheduler.shutdown()
    client.close()

app = FastAPI(title="BotBrain CMS API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def fix_id(doc: dict) -> dict:
    if doc and "_id" in doc:
        doc["_id"] = str(doc["_id"])
    return doc


# ─── SETTINGS ────────────────────────────────────────────────────────────────

@app.get("/api/settings")
async def get_settings():
    doc = await db.settings.find_one({}, {"_id": 0})
    return doc or {}

@app.put("/api/settings")
async def update_settings(data: dict):
    await db.settings.update_one({}, {"$set": data}, upsert=True)
    return {"status": "saved"}

@app.post("/api/sync/run")
async def trigger_sync():
    try:
        count = await run_sync_job()
        return {"status": "success", "synced": count}
    except Exception as e:
        raise HTTPException(500, f"Sync failed: {str(e)}")


# ─── PRODUCTS ────────────────────────────────────────────────────────────────

@app.get("/api/products")
async def list_products(category: Optional[str] = None, q: Optional[str] = None):
    query = {}
    if category:
        query["labels"] = category
    if q:
        query["$or"] = [
            {"title": {"$regex": q, "$options": "i"}},
            {"description": {"$regex": q, "$options": "i"}},
            {"product_id": {"$regex": q, "$options": "i"}},
        ]
    cursor = db.products.find(query).sort("product_id", 1)
    return [fix_id(p) async for p in cursor]


@app.get("/api/products/{product_id}")
async def get_product(product_id: str):
    product = await db.products.find_one({"product_id": product_id})
    if not product:
        raise HTTPException(404, f"Product '{product_id}' not found")
    return fix_id(product)


@app.post("/api/products", status_code=201)
async def create_product(product: ProductCreate):
    existing = await db.products.find_one({"product_id": product.product_id})
    if existing:
        raise HTTPException(400, f"Product ID '{product.product_id}' already exists")
    doc = product.model_dump()
    text = f"{doc['title']} {doc['description']} {' '.join(doc.get('labels', []))}"
    doc["embedding"] = await embed_text(text)
    result = await db.products.insert_one(doc)
    created = await db.products.find_one({"_id": result.inserted_id})
    await notify_chatbot_reload()
    return fix_id(created)


@app.put("/api/products/{product_id}")
async def update_product(product_id: str, update: ProductUpdate):
    changes = {k: v for k, v in update.model_dump().items() if v is not None}
    if not changes:
        raise HTTPException(400, "No fields to update")

    if any(k in changes for k in ("title", "description", "labels")):
        current = await db.products.find_one({"product_id": product_id})
        if current:
            title = changes.get("title", current["title"])
            description = changes.get("description", current["description"])
            labels = changes.get("labels", current.get("labels", []))
            text = f"{title} {description} {' '.join(labels)}"
            changes["embedding"] = await embed_text(text)

    result = await db.products.update_one(
        {"product_id": product_id}, {"$set": changes}
    )
    if result.matched_count == 0:
        raise HTTPException(404, f"Product '{product_id}' not found")
    updated = await db.products.find_one({"product_id": product_id})
    await notify_chatbot_reload()
    return fix_id(updated)


@app.delete("/api/products/{product_id}", status_code=204)
async def delete_product(product_id: str):
    result = await db.products.delete_one({"product_id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(404, f"Product '{product_id}' not found")
    await notify_chatbot_reload()


# ─── KNOWLEDGE ───────────────────────────────────────────────────────────────

@app.get("/api/knowledge")
async def list_knowledge(category: Optional[str] = None):
    query = {}
    if category:
        query["category"] = category
    cursor = db.knowledge.find(query).sort("key", 1)
    return [fix_id(k) async for k in cursor]


@app.get("/api/knowledge/{key}")
async def get_knowledge(key: str):
    entry = await db.knowledge.find_one({"key": key})
    if not entry:
        raise HTTPException(404, f"Entry '{key}' not found")
    return fix_id(entry)


@app.post("/api/knowledge", status_code=201)
async def create_knowledge(entry: KnowledgeEntryCreate):
    existing = await db.knowledge.find_one({"key": entry.key})
    if existing:
        raise HTTPException(400, f"Key '{entry.key}' already exists")
    doc = entry.model_dump()
    doc["embedding"] = await embed_text(doc["text"])
    result = await db.knowledge.insert_one(doc)
    created = await db.knowledge.find_one({"_id": result.inserted_id})
    await notify_chatbot_reload()
    return fix_id(created)


@app.put("/api/knowledge/{key}")
async def update_knowledge(key: str, update: KnowledgeEntryUpdate):
    changes = {k: v for k, v in update.model_dump().items() if v is not None}
    if not changes:
        raise HTTPException(400, "No fields to update")

    if "text" in changes:
        changes["embedding"] = await embed_text(changes["text"])

    result = await db.knowledge.update_one({"key": key}, {"$set": changes})
    if result.matched_count == 0:
        raise HTTPException(404, f"Entry '{key}' not found")
    updated = await db.knowledge.find_one({"key": key})
    await notify_chatbot_reload()
    return fix_id(updated)


@app.delete("/api/knowledge/{key}", status_code=204)
async def delete_knowledge(key: str):
    result = await db.knowledge.delete_one({"key": key})
    if result.deleted_count == 0:
        raise HTTPException(404, f"Entry '{key}' not found")
    await notify_chatbot_reload()


# ─── CHATBOT RETRIEVAL ────────────────────────────────────────────────────────

@app.get("/api/chatbot/products")
async def chatbot_products():
    cursor = db.products.find({}, {"_id": 0})
    products = [p async for p in cursor]
    return {p["product_id"]: p for p in products}


@app.get("/api/chatbot/knowledge")
async def chatbot_knowledge(category: Optional[str] = None):
    cursor = db.knowledge.find({"category": category} if category else {}, {"_id": 0})
    return [k async for k in cursor]


# ─── APPEARANCE ──────────────────────────────────────────────────────────────

@app.get("/api/appearance")
async def get_appearance():
    doc = await db.appearance.find_one({}, {"_id": 0})
    if not doc:
        return {
            "accentColor": "#000000",
            "colorScheme": "light",
            "radius": "round",
            "density": "spacious",
            "hue": 210,
            "tint": 5,
            "shade": 3,
            "botName": "Assistant",
            "greeting": "Welcome! Ask me anything.",
            "placeholder": "Type your question here..."
        }
    return doc

@app.put("/api/appearance")
async def update_appearance(data: dict):
    await db.appearance.update_one({}, {"$set": data}, upsert=True)
    return {"status": "saved"}


@app.get("/health")
async def health():
    return {"status": "ok"}