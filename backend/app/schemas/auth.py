"""
app/schemas/auth.py — Pydantic request/response schemas for the auth flow.
"""
from typing import Optional
from pydantic import BaseModel, field_validator
import re

from app.db.models.user import UserRole, PreferredLanguage, JurisdictionType


# ── Helpers ───────────────────────────────────────────────────────────────────

def _normalize_phone(v: str) -> str:
    """Strip spaces/dashes, ensure +91 prefix for Indian numbers."""
    v = re.sub(r"[\s\-\(\)]", "", v)
    if v.startswith("0"):
        v = "+91" + v[1:]
    elif re.match(r"^\d{10}$", v):
        v = "+91" + v
    return v


# ── Request Schemas ───────────────────────────────────────────────────────────

class SendOTPRequest(BaseModel):
    phone: str

    @field_validator("phone")
    @classmethod
    def normalize(cls, v: str) -> str:
        return _normalize_phone(v)


class VerifyOTPRequest(BaseModel):
    phone: str
    code: str

    @field_validator("phone")
    @classmethod
    def normalize(cls, v: str) -> str:
        return _normalize_phone(v)


class RegisterFarmerRequest(BaseModel):
    """Registration payload for FARMER and PRADHAN roles."""
    phone: str
    code: str          # OTP code — re-verified on registration
    role: UserRole
    name: str
    village: str
    block: str
    district: str
    preferred_language: PreferredLanguage = PreferredLanguage.HINDI

    @field_validator("phone")
    @classmethod
    def normalize(cls, v: str) -> str:
        return _normalize_phone(v)

    @field_validator("role")
    @classmethod
    def must_be_field_role(cls, v: UserRole) -> UserRole:
        if v not in (UserRole.FARMER, UserRole.PRADHAN):
            raise ValueError("Use RegisterOfficerRequest for officer roles.")
        return v


class RegisterOfficerRequest(BaseModel):
    """Registration payload for all officer/official/expert roles."""
    phone: str
    code: str
    role: UserRole
    name: str
    designation: str
    jurisdiction_type: JurisdictionType
    jurisdiction_name: str

    @field_validator("phone")
    @classmethod
    def normalize(cls, v: str) -> str:
        return _normalize_phone(v)

    @field_validator("role")
    @classmethod
    def must_be_officer_role(cls, v: UserRole) -> UserRole:
        if v in (UserRole.FARMER, UserRole.PRADHAN):
            raise ValueError("Use RegisterFarmerRequest for farmer/pradhan roles.")
        return v


# ── Response Schemas ──────────────────────────────────────────────────────────

class SendOTPResponse(BaseModel):
    success: bool
    message: str


class VerifyOTPResponse(BaseModel):
    """
    Returned after OTP verification.
    - If existing user: token is set, needs_registration is False.
    - If new user: token is None, needs_registration is True.
    """
    needs_registration: bool
    token: Optional[str] = None
    role: Optional[str] = None
    message: str


class AuthTokenResponse(BaseModel):
    token: str
    role: str
    user_id: str
    message: str


class UserProfileResponse(BaseModel):
    id: str
    phone: str
    role: str
    name: Optional[str]
    is_active: bool
    # Farmer/Pradhan
    village: Optional[str] = None
    block: Optional[str] = None
    district: Optional[str] = None
    preferred_language: Optional[str] = None
    # Officer
    designation: Optional[str] = None
    jurisdiction_type: Optional[str] = None
    jurisdiction_name: Optional[str] = None
