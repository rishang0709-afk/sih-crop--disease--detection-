"""
tests/test_auth.py — Automated tests for the auth flow.

Uses an in-memory SQLite database (via aiosqlite) so no PostgreSQL is needed to run tests.
Run: pytest tests/test_auth.py -v
"""
import os
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport

# Override DB to SQLite for tests before importing the app
os.environ.setdefault("DB_URL", "sqlite+aiosqlite:///./test_crop.db")
os.environ.setdefault("JWT_SECRET", "test-secret-key-for-tests-only")
os.environ.setdefault("OTP_PROVIDER", "mock")

from main import app  # noqa: E402 — after env setup
from app.db.base import create_all_tables, engine, Base  # noqa: E402


# ──────────────────────────────────────────────────────────────────────────────
# Fixtures
# ──────────────────────────────────────────────────────────────────────────────

@pytest_asyncio.fixture(scope="module", autouse=True)
async def setup_db():
    """Create tables once for the test module."""
    await create_all_tables()
    yield
    # Teardown — drop all tables after tests
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture()
async def client():
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        yield ac


TEST_PHONE = "+919876543210"
TEST_PHONE_OFFICER = "+919876543211"


# ──────────────────────────────────────────────────────────────────────────────
# Tests: Health
# ──────────────────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_health_check(client: AsyncClient):
    resp = await client.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"


# ──────────────────────────────────────────────────────────────────────────────
# Tests: Send OTP
# ──────────────────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_send_otp(client: AsyncClient):
    resp = await client.post("/auth/send-otp", json={"phone": TEST_PHONE})
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert TEST_PHONE in data["message"] or "9876543210" in data["message"]


@pytest.mark.asyncio
async def test_send_otp_normalizes_phone(client: AsyncClient):
    """10-digit number should be accepted and normalized to +91XXXXXXXXXX."""
    resp = await client.post("/auth/send-otp", json={"phone": "9000000001"})
    assert resp.status_code == 200


# ──────────────────────────────────────────────────────────────────────────────
# Tests: Verify OTP
# ──────────────────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_verify_otp_invalid_code(client: AsyncClient):
    await client.post("/auth/send-otp", json={"phone": TEST_PHONE})
    resp = await client.post(
        "/auth/verify-otp", json={"phone": TEST_PHONE, "code": "000000"}
    )
    # 000000 is not the mock bypass and not the real OTP
    assert resp.status_code == 400


@pytest.mark.asyncio
async def test_verify_otp_dev_bypass_new_user(client: AsyncClient):
    """Dev bypass code '123456' should return needs_registration=True for unknown phone."""
    resp = await client.post(
        "/auth/verify-otp", json={"phone": "+919999999999", "code": "123456"}
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["needs_registration"] is True
    assert data["token"] is None


# ──────────────────────────────────────────────────────────────────────────────
# Tests: Register Farmer
# ──────────────────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_register_farmer(client: AsyncClient):
    resp = await client.post(
        "/auth/register/farmer",
        json={
            "phone": TEST_PHONE,
            "code": "123456",  # dev bypass
            "role": "FARMER",
            "name": "Ramesh Kumar",
            "village": "Dhakoli",
            "block": "Zirakpur",
            "district": "SAS Nagar",
            "preferred_language": "hi",
        },
    )
    assert resp.status_code == 201
    data = resp.json()
    assert "token" in data
    assert data["role"] == "FARMER"


@pytest.mark.asyncio
async def test_register_farmer_duplicate_phone(client: AsyncClient):
    """Second registration with same phone should return 409."""
    resp = await client.post(
        "/auth/register/farmer",
        json={
            "phone": TEST_PHONE,
            "code": "123456",
            "role": "FARMER",
            "name": "Duplicate",
            "village": "x",
            "block": "x",
            "district": "x",
        },
    )
    assert resp.status_code == 409


# ──────────────────────────────────────────────────────────────────────────────
# Tests: Login existing user (verify-otp returns token)
# ──────────────────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_verify_otp_existing_user_returns_token(client: AsyncClient):
    resp = await client.post(
        "/auth/verify-otp", json={"phone": TEST_PHONE, "code": "123456"}
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["needs_registration"] is False
    assert data["token"] is not None
    assert data["role"] == "FARMER"


# ──────────────────────────────────────────────────────────────────────────────
# Tests: Protected route /users/me
# ──────────────────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_get_me_authenticated(client: AsyncClient):
    # Login
    login = await client.post(
        "/auth/verify-otp", json={"phone": TEST_PHONE, "code": "123456"}
    )
    token = login.json()["token"]

    resp = await client.get("/users/me", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["role"] == "FARMER"
    assert data["phone"] == TEST_PHONE


@pytest.mark.asyncio
async def test_get_me_unauthenticated(client: AsyncClient):
    resp = await client.get("/users/me")
    assert resp.status_code == 401


# ──────────────────────────────────────────────────────────────────────────────
# Tests: RBAC — role enforcement
# ──────────────────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_officer_route_blocked_for_farmer(client: AsyncClient):
    """A FARMER should be denied access to officer-only endpoints."""
    login = await client.post(
        "/auth/verify-otp", json={"phone": TEST_PHONE, "code": "123456"}
    )
    token = login.json()["token"]

    resp = await client.get(
        "/users/expert/queue-count",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_register_officer(client: AsyncClient):
    resp = await client.post(
        "/auth/register/officer",
        json={
            "phone": TEST_PHONE_OFFICER,
            "code": "123456",
            "role": "KVK_LAB_EXPERT",
            "name": "Dr. Priya Sharma",
            "designation": "Senior Scientist",
            "jurisdiction_type": "district",
            "jurisdiction_name": "Pune District",
        },
    )
    assert resp.status_code == 201
    assert resp.json()["role"] == "KVK_LAB_EXPERT"


@pytest.mark.asyncio
async def test_expert_queue_count_allowed_for_expert(client: AsyncClient):
    login = await client.post(
        "/auth/verify-otp", json={"phone": TEST_PHONE_OFFICER, "code": "123456"}
    )
    token = login.json()["token"]

    resp = await client.get(
        "/users/expert/queue-count",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
