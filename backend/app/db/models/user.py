"""
app/db/models/user.py — User ORM model with role enum and profile fields.
"""
import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, DateTime, Enum as SAEnum, Boolean
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base


class UserRole(str, enum.Enum):
    FARMER = "FARMER"
    PRADHAN = "PRADHAN"
    BDO = "BDO"
    AGRICULTURE_OFFICER = "AGRICULTURE_OFFICER"
    HORTICULTURE_OFFICER = "HORTICULTURE_OFFICER"
    DISTRICT_STATE_OFFICIAL = "DISTRICT_STATE_OFFICIAL"
    KVK_LAB_EXPERT = "KVK_LAB_EXPERT"


class PreferredLanguage(str, enum.Enum):
    HINDI = "hi"
    ENGLISH = "en"
    MARATHI = "mr"
    PUNJABI = "pa"
    TELUGU = "te"
    TAMIL = "ta"
    KANNADA = "kn"
    GUJARATI = "gu"
    BENGALI = "bn"
    ODIA = "or"


class JurisdictionType(str, enum.Enum):
    VILLAGE = "village"
    BLOCK = "block"
    DISTRICT = "district"
    STATE = "state"


class User(Base):
    __tablename__ = "users"

    # Primary key — UUID stored as string for cross-DB compatibility
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))

    # Auth
    phone = Column(String(20), unique=True, nullable=False, index=True)
    role = Column(SAEnum(UserRole), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    # Common fields
    name = Column(String(255), nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # ── Farmer / Pradhan fields ──────────────────────────────────────────────
    village = Column(String(255), nullable=True)
    block = Column(String(255), nullable=True)
    district = Column(String(255), nullable=True)
    preferred_language = Column(
        SAEnum(PreferredLanguage), nullable=True, default=PreferredLanguage.HINDI
    )

    # ── Officer fields ───────────────────────────────────────────────────────
    designation = Column(String(255), nullable=True)
    jurisdiction_type = Column(SAEnum(JurisdictionType), nullable=True)
    jurisdiction_name = Column(String(255), nullable=True)  # e.g. "Pune District"

    def __repr__(self) -> str:
        return f"<User id={self.id} phone={self.phone} role={self.role}>"
