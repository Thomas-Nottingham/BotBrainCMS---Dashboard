"""
seed.py — Run this ONCE to migrate your existing Python dicts into MongoDB.

Usage:
    cd backend
    pip install -r requirements.txt
    cp .env.example .env      # fill in your MONGODB_URI
    python seed.py
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

# Hardcoded directly to bypass .env loading issues
MONGODB_URI = "mongodb+srv://vitreongen_db_user:7I0TIyn3Ja21mFXN@vitreon-dashboard.rnn0q9b.mongodb.net/"
DB_NAME = "botbrain"

# ─── YOUR EXISTING DATA ───────────────────────────────────────────────────────
# Paste your full PRODUCT_KNOWLEDGE, GENERAL_KNOWLEDGE, SUPPORT_KNOWLEDGE here.
# The product dict keys become the product_id field.

PRODUCT_KNOWLEDGE = {
    "home001": {
        "labels": ["home", "decor", "winter", "christmas", "wreath"],
        "title": "Fruit Twig Circle 25cm",
        "description": (
            "A decorative circular twig wreath adorned with fragrant dried fruits, cinnamon sticks, "
            "pine cones, and scented with Christmas in a Bottle oil."
        ),
        "price": 24.97,
        "currency": "GBP",
        "image_url": "https://www.inspitalfields.co.uk/cdn/shop/files/Untitleddesign-2023-12-01T160422.432.png?v=1701446872&width=1780",
        "product_url": "https://www.inspitalfields.co.uk/collections/christmas-sale/products/fruit-twig-circle-25cm"
    },
    "home002": {
        "labels": ["home", "decor", "christmas", "fragrance", "gift", "cheap"],
        "title": "Fruit Organza Bag",
        "description": (
            "A decorative organza bag filled with dried fruits and scented with Christmas in the Bottle oil."
        ),
        "price": 3.32,
        "currency": "GBP",
        "image_url": "https://www.inspitalfields.co.uk/cdn/shop/products/organzabag.jpg?v=1634829465&width=3000",
        "product_url": "https://www.inspitalfields.co.uk/collections/christmas-sale/products/fruit-organza-bag-1"
    },
    "home003": {
        "labels": ["home", "fragrance", "christmas", "oil", "bottle"],
        "title": "Christmas in A Bottle Oil 10ml",
        "description": (
            "A festive fragrance oil blending cinnamon, orange, cloves, and seasonal spices."
        ),
        "price": 3.32,
        "currency": "GBP",
        "image_url": "https://www.inspitalfields.co.uk/cdn/shop/files/Untitleddesign-2023-12-01T155600.570.png?v=1701446247&width=3000",
        "product_url": "https://www.inspitalfields.co.uk/collections/christmas-sale/products/christmas-in-a-bottle-oil-10ml"
    },
    "home004": {
        "labels": ["home", "decor", "christmas", "eco", "sustainable"],
        "title": "Beach Clean Eco Large Christmas Trees",
        "description": (
            "Eco-conscious decorative Christmas trees made from Beach Clean material, a mix of cork and recycled EVA plastics."
        ),
        "price": 15.30,
        "currency": "GBP",
        "image_url": "https://www.inspitalfields.co.uk/cdn/shop/files/Untitleddesign-2023-10-30T122026.917.png?v=1698668661&width=3000",
        "product_url": "https://www.inspitalfields.co.uk/collections/christmas-sale/products/beach-clean-eco-large-2-christmas-trees"
    },
    "home005": {
        "labels": ["home", "christmas", "decor", "craft", "eco"],
        "title": "Paper Christmas Tree",
        "description": (
            "A mess-free Paper Christmas Tree kit designed for easy folding and assembly with no glue or scissors required."
        ),
        "price": 6.12,
        "currency": "GBP",
        "image_url": "https://www.inspitalfields.co.uk/cdn/shop/files/Paper_Christmas_Tree_Kit.png?v=1765541202&width=3000",
        "product_url": "https://www.inspitalfields.co.uk/collections/christmas-sale/products/paper-christmas-tree"
    },
    "home006": {
        "labels": ["home", "lighting", "lamp", "glass", "statement"],
        "title": "Pink Calacatta Pebble Glass Lamp 20cm",
        "description": (
            "A handcrafted and mouth-blown glass table lamp inspired by pink Calacatta marble patterns."
        ),
        "price": 163.17,
        "currency": "GBP",
        "image_url": "https://www.inspitalfields.co.uk/cdn/shop/files/PINKPEBBLE4.jpg?v=1745316372&width=3000",
        "product_url": "https://www.inspitalfields.co.uk/collections/furniture-lighting/products/pink-calacatta-pebble-glass-lamp-20cm"
    },
    "home007": {
        "labels": ["home", "vase", "ceramic", "hand-painted"],
        "title": "Odina Hand-Painted Stoneware Green Vase",
        "description": (
            "A hand-painted stoneware vase with a cream base and green floral detailing."
        ),
        "price": 30.58,
        "currency": "GBP",
        "image_url": "https://www.inspitalfields.co.uk/cdn/shop/files/Untitleddesign-2025-02-11T155732.581.png?v=1739289490&width=3000",
        "product_url": "https://www.inspitalfields.co.uk/collections/vases/products/odina-vase-green"
    },
    "home008": {
        "labels": ["home", "photo frame", "decor", "coastal"],
        "title": "Helio Ferretti Menorca Photo Frame",
        "description": (
            "A bold and decorative photo frame inspired by Mediterranean style, featuring blue and white pinstripes."
        ),
        "price": 15.30,
        "currency": "GBP",
        "image_url": "https://www.inspitalfields.co.uk/cdn/shop/files/Helio_Ferretti_Menorca_Photo_Frame.png?v=1765275066&width=3000",
        "product_url": "https://www.inspitalfields.co.uk/collections/photo-frames/products/helio-ferretti-menorca-photo-frame"
    },
    "home009": {
        "labels": ["home", "throw", "textile", "eco", "art"],
        "title": "Moretti Throw",
        "description": (
            "An artist-designed cotton throw by Imogen Sinclair for Slowdown Studio."
        ),
        "price": 249.61,
        "currency": "GBP",
        "image_url": "https://www.inspitalfields.co.uk/cdn/shop/files/Moretti6.jpg?v=1760101710&width=3000",
        "product_url": "https://www.inspitalfields.co.uk/collections/throws-and-rugs/products/moretti-throw"
    },
    "home010": {
        "labels": ["home", "blanket", "kids", "eco", "textile"],
        "title": "Big Cats Mini Blanket",
        "description": (
            "A soft and durable mini blanket designed by artist James Daw, featuring a playful big cats illustration."
        ),
        "price": 152.93,
        "currency": "GBP",
        "image_url": "https://www.inspitalfields.co.uk/cdn/shop/files/BigCats3_108a8fe1-5d1c-402f-99c6-1b8aeec0d107.jpg?v=1760100918&width=3000",
        "product_url": "https://www.inspitalfields.co.uk/collections/throws-and-rugs/products/big-cats-mini-blanket"
    },
    "home011": {
        "labels": ["home", "dining", "plate", "ceramic", "coastal"],
        "title": "Blue Ombre Turbot Plate",
        "description": (
            "A fish-shaped serving plate finished with a blue ombre glaze inspired by ocean tones."
        ),
        "price": 25.51,
        "currency": "GBP",
        "image_url": "https://www.inspitalfields.co.uk/cdn/shop/files/Blue_Ombre_Turbot_Plat.png?v=1762875066&width=3000",
        "product_url": "https://www.inspitalfields.co.uk/collections/ocean-dining-collection/products/blue-ombre-turbot-plate"
    },
    "home012": {
        "labels": ["home", "vase", "ceramic", "coastal"],
        "title": "Tace Vase Multi Fish Blue Stoneware Vase",
        "description": (
            "A blue stoneware vase featuring decorative fish details and a reactive glaze finish."
        ),
        "price": 35.68,
        "currency": "GBP",
        "image_url": "https://www.inspitalfields.co.uk/cdn/shop/files/Multi_Fish_Vase.jpg?v=1764755737&width=3000",
        "product_url": "https://www.inspitalfields.co.uk/collections/ocean-dining-collection/products/tace-vase-multi-fish-blue-stoneware-vase"
    },
    "home013": {
        "labels": ["home", "glassware", "tumbler", "dining"],
        "title": "Niko Tumbler Tall Set of 2",
        "description": (
            "A set of two tall tumblers crafted from premium borosilicate glass."
        ),
        "price": 46.88,
        "currency": "GBP",
        "image_url": "https://www.inspitalfields.co.uk/cdn/shop/files/Untitled_design_1_d029839f-b4a2-4e2c-881f-1f349ee8817f.png?v=1745849420&width=3000",
        "product_url": "https://www.inspitalfields.co.uk/collections/glasses/products/niko-tumbler-tall-set-of-2"
    },
}

GENERAL_KNOWLEDGE = [
    {"key": "company_overview", "category": "general", "text": "Inspitalfields is the oldest independent gift shop in Old Spitalfields Market, East London. Founded in 1993, we specialise in unique, quirky, and sustainable gifts, homeware, beauty, and lifestyle products."},
    {"key": "founders", "category": "general", "text": "Inspitalfields was founded by Fiona, a passionate traveller and creative spirit. In 2002, Mehmood joined the business, and together they curate a joyful, design-led collection."},
    {"key": "what_we_do", "category": "general", "text": "We curate and sell sustainable gifts, homeware, beauty products, stationery, books, games, and design-led accessories."},
    {"key": "use_cases", "category": "general", "text": "Customers shop with us for unique gifts, home decor, self-care essentials, and meaningful products that align with a sustainable and inclusive lifestyle."},
    {"key": "online_shopping", "category": "general", "text": "Customers can browse and purchase our products online, discovering new arrivals and seasonal collections."},
    {"key": "customer_support", "category": "general", "text": "Our support team assists customers with product questions, orders, returns, and general enquiries."},
    {"key": "independent_brands", "category": "general", "text": "We proudly support independent artists, designers, and makers."},
    {"key": "company_values", "category": "general", "text": "Our values are rooted in sustainability, equality, and community."},
]

SUPPORT_KNOWLEDGE = [
    {"key": "sustainability_and_values", "category": "support", "text": "At Inspitalfields, sustainability, equality, and respect are at the heart of everything we do. We champion eco-friendly products, ethical sourcing, and mindful consumption."},
    {"key": "orders_and_shipping", "category": "support", "text": "We offer online shopping with reliable delivery options. Shipping costs and delivery times vary depending on order size and destination."},
    {"key": "returns_and_refunds", "category": "support", "text": "If not fully satisfied, your order can be returned within 7 days if notified to us in writing. This excludes special orders and sale items. All returns must be unused."},
    {"key": "product_information", "category": "support", "text": "Each product is carefully selected with sustainability, quality, and design in mind. Product descriptions include materials, care instructions, and ethical considerations."},
    {"key": "privacy_policy", "category": "support", "text": "We respect your privacy and handle all personal information securely in accordance with GDPR."},
    {"key": "terms_of_service", "category": "support", "text": "Use of our website and services is governed by our terms and conditions."},
    {"key": "support_contact", "category": "support", "text": "For any questions about orders, products, sustainability values, or collaborations, customers can contact our friendly support team via email."},
    {"key": "trade_with_us", "category": "support", "text": "We love discovering new independent brands and makers. Email shop@inspitalfields.co.uk with a product catalogue, minimum order details, delivery costs, and links to your website."},
]


# ─── MIGRATION ────────────────────────────────────────────────────────────────

async def seed():
    print(f"Connecting to MongoDB at {MONGODB_URI[:40]}...")
    client = AsyncIOMotorClient(MONGODB_URI)
    db = client[DB_NAME]

    # Products
    print("\n📦 Seeding products...")
    products_inserted = 0
    products_skipped = 0
    for product_id, data in PRODUCT_KNOWLEDGE.items():
        doc = {"product_id": product_id, **data}
        existing = await db.products.find_one({"product_id": product_id})
        if existing:
            print(f"  ⏭  Skipping {product_id} (already exists)")
            products_skipped += 1
        else:
            await db.products.insert_one(doc)
            print(f"  ✅ Inserted {product_id}: {data['title']}")
            products_inserted += 1

    # Knowledge
    print("\n🧠 Seeding knowledge entries...")
    knowledge_inserted = 0
    knowledge_skipped = 0
    all_knowledge = GENERAL_KNOWLEDGE + SUPPORT_KNOWLEDGE
    for entry in all_knowledge:
        existing = await db.knowledge.find_one({"key": entry["key"]})
        if existing:
            print(f"  ⏭  Skipping '{entry['key']}' (already exists)")
            knowledge_skipped += 1
        else:
            await db.knowledge.insert_one(entry)
            print(f"  ✅ Inserted [{entry['category']}] {entry['key']}")
            knowledge_inserted += 1

    # Indexes
    print("\n🔍 Creating indexes...")
    await db.products.create_index("product_id", unique=True)
    await db.knowledge.create_index([("key", 1), ("category", 1)], unique=True)
    print("  ✅ Indexes created")

    print(f"\n✨ Done!")
    print(f"   Products: {products_inserted} inserted, {products_skipped} skipped")
    print(f"   Knowledge: {knowledge_inserted} inserted, {knowledge_skipped} skipped")
    client.close()


if __name__ == "__main__":
    asyncio.run(seed())
