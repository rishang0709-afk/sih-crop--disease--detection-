"""
app/services/otp_service.py — OTP delivery service with swappable providers.

Current providers:
  - mock   : Logs OTP to console. Always accepts '123456' as a valid code in dev.
  - twilio : Sends real SMS via Twilio (requires TWILIO_* env vars).
  - msg91  : Sends real SMS via MSG91 (requires MSG91_* env vars).

To switch providers, set OTP_PROVIDER in your .env file.
"""
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)


async def send_otp(phone: str, code: str) -> bool:
    """
    Dispatch an OTP to the given phone number via the configured provider.
    Returns True on success, False on failure.
    """
    provider = settings.otp_provider.lower()

    if provider == "mock":
        return await _send_mock(phone, code)
    elif provider == "twilio":
        return await _send_twilio(phone, code)
    elif provider == "msg91":
        return await _send_msg91(phone, code)
    else:
        logger.error(f"Unknown OTP_PROVIDER: {provider!r}. Falling back to mock.")
        return await _send_mock(phone, code)


# ──────────────────────────────────────────────────────────────────────────────
# Mock provider (development)
# ──────────────────────────────────────────────────────────────────────────────

async def _send_mock(phone: str, code: str) -> bool:
    """
    DEV ONLY: Print OTP to console instead of sending an SMS.
    The fixed code '123456' is also always accepted by the verify endpoint
    when OTP_PROVIDER=mock. Remove this bypass before going to production.
    """
    print(f"\n{'='*50}")
    print(f"[MOCK OTP] Phone: {phone}  →  Code: {code}")
    print(f"[MOCK OTP] Dev bypass code '123456' is also accepted.")
    print(f"{'='*50}\n")
    logger.info(f"[MOCK OTP] Sent OTP {code} to {phone}")
    return True


# ──────────────────────────────────────────────────────────────────────────────
# Twilio provider
# ──────────────────────────────────────────────────────────────────────────────

async def _send_twilio(phone: str, code: str) -> bool:
    """Send OTP via Twilio SMS API."""
    try:
        import httpx

        message_body = f"Your Crop Health Advisory OTP is: {code}. Valid for {settings.otp_expire_minutes} minutes. Do not share this code."

        async with httpx.AsyncClient() as client:
            resp = await client.post(
                f"https://api.twilio.com/2010-04-01/Accounts/{settings.twilio_account_sid}/Messages.json",
                auth=(settings.twilio_account_sid, settings.twilio_auth_token),
                data={
                    "From": settings.twilio_from_number,
                    "To": phone,
                    "Body": message_body,
                },
                timeout=10,
            )
        if resp.status_code in (200, 201):
            logger.info(f"[Twilio] OTP sent to {phone}")
            return True
        else:
            logger.error(f"[Twilio] Failed ({resp.status_code}): {resp.text}")
            return False
    except Exception as e:
        logger.error(f"[Twilio] Exception: {e}")
        return False


# ──────────────────────────────────────────────────────────────────────────────
# MSG91 provider
# ──────────────────────────────────────────────────────────────────────────────

async def _send_msg91(phone: str, code: str) -> bool:
    """Send OTP via MSG91 SMS API."""
    try:
        import httpx

        async with httpx.AsyncClient() as client:
            resp = await client.post(
                "https://api.msg91.com/api/v5/otp",
                json={
                    "template_id": "YOUR_MSG91_TEMPLATE_ID",  # set in MSG91 dashboard
                    "mobile": phone.lstrip("+"),
                    "authkey": settings.msg91_api_key,
                    "otp": code,
                },
                timeout=10,
            )
        data = resp.json()
        if data.get("type") == "success":
            logger.info(f"[MSG91] OTP sent to {phone}")
            return True
        else:
            logger.error(f"[MSG91] Failed: {data}")
            return False
    except Exception as e:
        logger.error(f"[MSG91] Exception: {e}")
        return False
