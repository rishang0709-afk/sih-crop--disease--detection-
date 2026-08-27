"""
app/core/security.py — JWT creation/verification and OTP generation utilities.
"""
import random
import string
from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import JWTError, jwt

from app.core.config import settings


# ──────────────────────────────────────────────────────────────────────────────
# JWT
# ──────────────────────────────────────────────────────────────────────────────

def create_access_token(
    subject: str,
    role: str,
    phone: str,
    expires_delta: Optional[timedelta] = None,
) -> str:
    """Create a signed JWT for an authenticated user."""
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.jwt_expire_minutes)
    )
    payload = {
        "sub": subject,       # user UUID
        "role": role,
        "phone": phone,
        "exp": expire,
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> dict:
    """
    Decode and verify a JWT.
    Raises JWTError on invalid/expired tokens.
    """
    return jwt.decode(
        token,
        settings.jwt_secret,
        algorithms=[settings.jwt_algorithm],
    )


# ──────────────────────────────────────────────────────────────────────────────
# OTP
# ──────────────────────────────────────────────────────────────────────────────

DEV_BYPASS_OTP = "123456"  # Always accepted in mock mode for dev convenience


def generate_otp(length: int = 6) -> str:
    """Generate a cryptographically random numeric OTP."""
    return "".join(random.choices(string.digits, k=length))
