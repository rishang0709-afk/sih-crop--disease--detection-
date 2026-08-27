"""
app/routers/auth.py — Auth endpoints: send OTP, verify OTP, register user.
"""
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import create_access_token, generate_otp, DEV_BYPASS_OTP
from app.db.base import get_session
from app.db.models.otp import OTPRecord
from app.db.models.user import User, UserRole
from app.schemas.auth import (
    AuthTokenResponse,
    RegisterFarmerRequest,
    RegisterOfficerRequest,
    SendOTPRequest,
    SendOTPResponse,
    VerifyOTPRequest,
    VerifyOTPResponse,
)
from app.services.otp_service import send_otp

router = APIRouter(prefix="/auth", tags=["auth"])


# ──────────────────────────────────────────────────────────────────────────────
# POST /auth/send-otp
# ──────────────────────────────────────────────────────────────────────────────

@router.post("/send-otp", response_model=SendOTPResponse)
async def send_otp_endpoint(
    body: SendOTPRequest,
    session: AsyncSession = Depends(get_session),
) -> SendOTPResponse:
    """
    Generate a 6-digit OTP, store it in the DB with expiry, and send via SMS.
    Rate limiting / abuse prevention should be added via a middleware in production.
    """
    # Invalidate any existing unused OTPs for this phone
    await session.execute(
        update(OTPRecord)
        .where(OTPRecord.phone == body.phone, OTPRecord.is_used == False)  # noqa: E712
        .values(is_used=True)
    )

    code = generate_otp()
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=settings.otp_expire_minutes)

    record = OTPRecord(phone=body.phone, code=code, expires_at=expires_at)
    session.add(record)

    # Send (async, non-blocking)
    await send_otp(body.phone, code)

    return SendOTPResponse(
        success=True,
        message=f"OTP sent to {body.phone}. Valid for {settings.otp_expire_minutes} minutes.",
    )


# ──────────────────────────────────────────────────────────────────────────────
# POST /auth/verify-otp
# ──────────────────────────────────────────────────────────────────────────────

@router.post("/verify-otp", response_model=VerifyOTPResponse)
async def verify_otp_endpoint(
    body: VerifyOTPRequest,
    session: AsyncSession = Depends(get_session),
) -> VerifyOTPResponse:
    """
    Verify OTP for a phone number.
    - If user exists → return JWT.
    - If new user → return needs_registration=True (client must call /auth/register).
    """
    now = datetime.now(timezone.utc)

    # Dev bypass: always accept '123456' in mock mode
    is_bypass = (
        settings.otp_provider == "mock" and body.code == DEV_BYPASS_OTP
    )

    if not is_bypass:
        result = await session.execute(
            select(OTPRecord)
            .where(
                OTPRecord.phone == body.phone,
                OTPRecord.code == body.code,
                OTPRecord.is_used == False,  # noqa: E712
                OTPRecord.expires_at > now,
            )
            .order_by(OTPRecord.created_at.desc())
            .limit(1)
        )
        record = result.scalar_one_or_none()

        if record is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired OTP. Please request a new code.",
            )

        # Mark OTP as used
        record.is_used = True

    # Check if user already registered
    result = await session.execute(
        select(User).where(User.phone == body.phone)
    )
    user = result.scalar_one_or_none()

    if user is not None:
        token = create_access_token(
            subject=user.id, role=user.role.value, phone=user.phone
        )
        return VerifyOTPResponse(
            needs_registration=False,
            token=token,
            role=user.role.value,
            message="Login successful.",
        )

    return VerifyOTPResponse(
        needs_registration=True,
        message="Phone verified. Please complete registration.",
    )


# ──────────────────────────────────────────────────────────────────────────────
# POST /auth/register/farmer  (Farmer & Pradhan)
# ──────────────────────────────────────────────────────────────────────────────

@router.post("/register/farmer", response_model=AuthTokenResponse, status_code=status.HTTP_201_CREATED)
async def register_farmer(
    body: RegisterFarmerRequest,
    session: AsyncSession = Depends(get_session),
) -> AuthTokenResponse:
    """Register a new Farmer or Pradhan after OTP verification."""
    await _assert_phone_verified(body.phone, body.code, session)
    await _assert_not_already_registered(body.phone, session)

    user = User(
        phone=body.phone,
        role=body.role,
        name=body.name,
        village=body.village,
        block=body.block,
        district=body.district,
        preferred_language=body.preferred_language,
    )
    session.add(user)
    await session.flush()  # get user.id before commit

    token = create_access_token(
        subject=user.id, role=user.role.value, phone=user.phone
    )
    return AuthTokenResponse(
        token=token,
        role=user.role.value,
        user_id=user.id,
        message="Registration successful. Welcome!",
    )


# ──────────────────────────────────────────────────────────────────────────────
# POST /auth/register/officer  (All officer/official/expert roles)
# ──────────────────────────────────────────────────────────────────────────────

@router.post("/register/officer", response_model=AuthTokenResponse, status_code=status.HTTP_201_CREATED)
async def register_officer(
    body: RegisterOfficerRequest,
    session: AsyncSession = Depends(get_session),
) -> AuthTokenResponse:
    """Register a new officer, official, or KVK expert after OTP verification."""
    await _assert_phone_verified(body.phone, body.code, session)
    await _assert_not_already_registered(body.phone, session)

    user = User(
        phone=body.phone,
        role=body.role,
        name=body.name,
        designation=body.designation,
        jurisdiction_type=body.jurisdiction_type,
        jurisdiction_name=body.jurisdiction_name,
    )
    session.add(user)
    await session.flush()

    token = create_access_token(
        subject=user.id, role=user.role.value, phone=user.phone
    )
    return AuthTokenResponse(
        token=token,
        role=user.role.value,
        user_id=user.id,
        message="Registration successful. Welcome!",
    )


# ──────────────────────────────────────────────────────────────────────────────
# Internal helpers
# ──────────────────────────────────────────────────────────────────────────────

async def _assert_phone_verified(phone: str, code: str, session: AsyncSession) -> None:
    """Raise 401 if the supplied OTP code is not valid for this phone."""
    now = datetime.now(timezone.utc)
    is_bypass = settings.otp_provider == "mock" and code == DEV_BYPASS_OTP
    if not is_bypass:
        result = await session.execute(
            select(OTPRecord).where(
                OTPRecord.phone == phone,
                OTPRecord.code == code,
                OTPRecord.is_used == False,  # noqa: E712
                OTPRecord.expires_at > now,
            )
        )
        record = result.scalar_one_or_none()
        if record is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Phone verification required. Please verify your OTP first.",
            )
        record.is_used = True


async def _assert_not_already_registered(phone: str, session: AsyncSession) -> None:
    """Raise 409 if a user with this phone already exists."""
    result = await session.execute(select(User).where(User.phone == phone))
    if result.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this phone number is already registered.",
        )
