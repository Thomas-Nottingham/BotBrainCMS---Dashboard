from pydantic import BaseModel, Field
from typing import Optional, List
from bson import ObjectId


class PyObjectId(str):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return str(v)


# ─── PRODUCTS ────────────────────────────────────────────────────────────────

class ProductCreate(BaseModel):
    product_id: str
    title: str
    description: str
    price: float
    currency: str = "GBP"
    labels: List[str] = []
    image_url: Optional[str] = None
    product_url: Optional[str] = None
    quantity: int = 0                    # ← add this

class ProductUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    currency: Optional[str] = None
    labels: Optional[List[str]] = None
    image_url: Optional[str] = None
    product_url: Optional[str] = None
    quantity: Optional[int] = None       # ← add this

class Product(ProductCreate):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}


# ─── KNOWLEDGE ───────────────────────────────────────────────────────────────

class KnowledgeEntryCreate(BaseModel):
    key: str
    text: str
    category: str            # "general" | "support"
    embedding: Optional[List[float]] = None

class KnowledgeEntryUpdate(BaseModel):
    text: Optional[str] = None
    category: Optional[str] = None
    embedding: Optional[List[float]] = None

class KnowledgeEntry(KnowledgeEntryCreate):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}
