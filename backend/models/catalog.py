from pydantic import BaseModel, Field, ConfigDict, BeforeValidator
from typing import List, Optional, Annotated
from pydantic import BaseModel, Field, ConfigDict, BeforeValidator

PyObjectId = Annotated[str, BeforeValidator(str)]

class CatalogItemBase(BaseModel):
    category: str = Field(..., description="The high-level category (e.g., 'tops', 'bottoms')")
    type: str = Field(..., description="The specific item type (e.g., 't-shirt', 'bomber jacket')")
    icon_id: Optional[str] = Field(None, description="SVG icon identifier")
    icon_aspect_ratio: str = Field(
        default="square",
        description="Icon aspect ratio: square | portrait | landscape | tall"
    )
    
    # The Constraints (The Ontology)
    allowed_colors: List[str] = Field(default_factory=list, description="List of valid colors for this item type")
    allowed_fits: List[str] = Field(default_factory=list, description="List of valid fits (e.g., 'slim', 'oversized')")
    allowed_materials: List[str] = Field(default_factory=list, description="List of valid materials (e.g., 'cotton', 'denim')")
    
    # Metadata for AI Generation (Hidden from standard UI, used by LLM)
    default_seasons: List[str] = Field(default=["all"], description="Default seasons this item implies")
    formality_level: int = Field(default=5, ge=1, le=10, description="1 (Casual) to 10 (Formal)")

class CatalogItemCreate(CatalogItemBase):
    pass

class CatalogItemUpdate(BaseModel):
    category: Optional[str] = None
    type: Optional[str] = None
    icon_id: Optional[str] = None
    icon_aspect_ratio: Optional[str] = None
    allowed_colors: Optional[List[str]] = None
    allowed_fits: Optional[List[str]] = None
    allowed_materials: Optional[List[str]] = None
    default_seasons: Optional[List[str]] = None
    formality_level: Optional[int] = None

class CatalogItemResponse(CatalogItemBase):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)

    model_config = ConfigDict(
        populate_by_name=True,
        json_schema_extra={
            "example": {
                "category": "tops",
                "type": "t-shirt",
                "icon": "👕",
                "allowed_colors": ["black", "white", "navy"],
                "allowed_fits": ["slim", "regular"],
                "allowed_materials": ["cotton", "polyester"],
                "formality_level": 2
            }
        }
    )


# === COLORS ===
class ColorBase(BaseModel):
    name: str = Field(..., description="Display name (e.g., 'Navy Blue')")
    slug: str = Field(..., description="Lowercase key (e.g., 'navy')")
    hex: str = Field(..., pattern=r'^#[0-9A-Fa-f]{6}$')
    family: Optional[str] = Field(None, description="Color family for grouping (e.g., 'blues', 'neutrals')")

class ColorCreate(ColorBase):
    pass

class ColorResponse(ColorBase):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    model_config = ConfigDict(populate_by_name=True)

# === CATEGORIES ===
class CategoryBase(BaseModel):
    name: str = Field(..., description="Display name (e.g., 'Tops')")
    slug: str = Field(..., description="URL-safe key (e.g., 'tops')")
    icon_id: Optional[str] = Field(None, description="Reference to SVG icon asset")
    sort_order: int = Field(default=0)

class CategoryCreate(CategoryBase):
    pass

class CategoryResponse(CategoryBase):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    model_config = ConfigDict(populate_by_name=True)

# === CATALOG ITEMS (updated) ===
class CatalogItemBase(BaseModel):
    category_id: str = Field(..., description="Reference to category")
    type: str
    icon_id: Optional[str] = Field(None, description="SVG icon identifier")
    
    # Now reference color slugs (validated against colors collection)
    allowed_colors: List[str] = Field(default_factory=list)
    allowed_fits: List[str] = Field(default_factory=list)
    allowed_materials: List[str] = Field(default_factory=list)
    
    default_seasons: List[str] = Field(default=["all"])
    formality_level: int = Field(default=5, ge=1, le=10)