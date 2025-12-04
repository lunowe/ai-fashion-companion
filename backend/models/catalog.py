from pydantic import BaseModel, Field, ConfigDict, BeforeValidator
from typing import List, Optional, Annotated

# Helper to convert MongoDB ObjectId to string
PyObjectId = Annotated[str, BeforeValidator(str)]

class CatalogItemBase(BaseModel):
    category: str = Field(..., description="The high-level category (e.g., 'tops', 'bottoms')")
    type: str = Field(..., description="The specific item type (e.g., 't-shirt', 'bomber jacket')")
    icon: str = Field(..., description="Emoji representation (e.g., '👕')")
    
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
    icon: Optional[str] = None
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