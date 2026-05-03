"""
data_loader.py — Drop-in replacement for your hardcoded PRODUCT_KNOWLEDGE,
GENERAL_KNOWLEDGE, and SUPPORT_KNOWLEDGE dicts/lists.

HOW TO USE IN YOUR CHATBOT:
  Replace this at the top of tools.py (or wherever you import the dicts):

    # OLD
    from .products import PRODUCT_KNOWLEDGE
    from .knowledge import GENERAL_KNOWLEDGE, SUPPORT_KNOWLEDGE

    # NEW
    from .data_loader import get_product_knowledge, get_general_knowledge, get_support_knowledge

  Then in your tool functions:
    product = (await get_product_knowledge()).get(product_id)
    knowledge = await get_general_knowledge()

The loader caches results for CACHE_TTL seconds so it's not hitting the API
on every single message. Set CACHE_TTL=0 to always fetch fresh.
"""

import httpx
import asyncio
import time
import os
from typing import Dict, List, Any

API_BASE = os.getenv("BOTBRAIN_API_URL", "http://localhost:8001")
CACHE_TTL = int(os.getenv("BOTBRAIN_CACHE_TTL", "60"))  # seconds

_cache: Dict[str, Any] = {}
_cache_time: Dict[str, float] = {}


async def _fetch(path: str) -> Any:
    now = time.time()
    if path in _cache and (now - _cache_time.get(path, 0)) < CACHE_TTL:
        return _cache[path]

    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(f"{API_BASE}{path}")
        response.raise_for_status()
        data = response.json()

    _cache[path] = data
    _cache_time[path] = now
    return data


async def get_product_knowledge() -> Dict[str, dict]:
    """
    Returns a dict keyed by product_id — same shape as your old PRODUCT_KNOWLEDGE.
    Example: product = (await get_product_knowledge())['home001']
    """
    return await _fetch("/api/chatbot/products")


async def get_general_knowledge() -> List[dict]:
    """
    Returns a list of general knowledge entries — same shape as GENERAL_KNOWLEDGE.
    """
    return await _fetch("/api/chatbot/knowledge?category=general")


async def get_support_knowledge() -> List[dict]:
    """
    Returns a list of support knowledge entries — same shape as SUPPORT_KNOWLEDGE.
    """
    return await _fetch("/api/chatbot/knowledge?category=support")


def invalidate_cache():
    """Call this if you need to force a fresh fetch (e.g. after a webhook)."""
    _cache.clear()
    _cache_time.clear()


# ─── SYNC WRAPPERS (if you're not in an async context) ───────────────────────

def get_product_knowledge_sync() -> Dict[str, dict]:
    return asyncio.run(get_product_knowledge())

def get_general_knowledge_sync() -> List[dict]:
    return asyncio.run(get_general_knowledge())

def get_support_knowledge_sync() -> List[dict]:
    return asyncio.run(get_support_knowledge())
