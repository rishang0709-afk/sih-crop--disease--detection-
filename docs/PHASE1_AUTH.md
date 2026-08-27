# Phase 1 — Auth & Role-Based Access Control

## Architecture Overview

```
Phone OTP Login Flow
──────────────────────────────────────────────────────────────
Client              Backend (FastAPI)          Database (PG)
  │                       │                        │
  │  POST /auth/send-otp  │                        │
  │──────────────────────▶│  generate 6-digit OTP  │
  │                       │  store OTPRecord ───────▶│
  │                       │  send SMS (mocked)      │
  │  { success: true }    │                        │
  │◀──────────────────────│                        │
  │                       │                        │
  │  POST /auth/verify-otp│                        │
  │──────────────────────▶│  validate OTP ──────────▶│
  │                       │  mark used             │
  │                       │  lookup User           │
  │                       │                        │
  │  ┌─ if user exists ──▶│  issue JWT             │
  │  │  { token, role }   │                        │
  │  │◀──────────────────│                        │
  │  │                    │                        │
  │  └─ if new user ─────▶│                        │
  │    { needs_registration: true, phone_token }   │
  │                       │                        │
  │  POST /auth/register  │                        │
  │──────────────────────▶│  create User ───────────▶│
  │  { token, role }      │  issue JWT             │
  │◀──────────────────────│                        │
```

## Roles & Dashboards

| Role | Device | Dashboard Route |
|---|---|---|
| `FARMER` | Mobile (Expo) | Farmer home tabs |
| `PRADHAN` | Mobile (Expo) | Pradhan home tabs |
| `BDO` | Web | `/dashboard/bdo` |
| `AGRICULTURE_OFFICER` | Web | `/dashboard/officer` |
| `HORTICULTURE_OFFICER` | Web | `/dashboard/officer` |
| `DISTRICT_STATE_OFFICIAL` | Web | `/dashboard/district` |
| `KVK_LAB_EXPERT` | Web | `/dashboard/expert` |

## Farmer/Pradhan Registration Fields

- `name` (string)
- `village` (string)
- `block` (string)
- `district` (string)
- `preferred_language` (enum: `hi`, `en`, `mr`, `pa`, `te`, `ta`, `kn`, `gu`, `bn`, `or`)

## Officer Registration Fields

- `name` (string)
- `designation` (string)
- `jurisdiction_type` (enum: `village`, `block`, `district`, `state`)
- `jurisdiction_name` (string)

## JWT Payload

```json
{
  "sub": "<user_uuid>",
  "role": "FARMER",
  "phone": "+911234567890",
  "exp": 1234567890
}
```

## Dev OTP

In `OTP_PROVIDER=mock` mode, OTPs are printed to the backend console **and** the fixed code `123456` is always accepted for any phone number. This is intentional for local dev — disable in production by setting `OTP_PROVIDER=twilio` or `OTP_PROVIDER=msg91`.

## Running Locally

```bash
# 1. Start database
docker compose up -d db

# 2. Start backend
cd backend
python -m venv venv && venv\Scripts\activate   # Windows
pip install -r requirements.txt
alembic upgrade head
uvicorn main:app --reload

# 3. Start web dashboard
cd web-dashboard
npm install
npm run dev

# 4. Start mobile app
cd mobile-app
npm install
npx expo start
```

API docs available at: http://localhost:8000/docs
