"""
main.py — FastAPI application entry point.
Run with: uvicorn main:app --reload
API docs: http://localhost:8000/docs
"""
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.base import create_all_tables
from app.routers import auth, users

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup / shutdown events."""
    logger.info("Starting up Crop Health Advisory API...")
    # Auto-create tables in dev (use `alembic upgrade head` in production)
    await create_all_tables()
    logger.info("Database tables ready.")
    yield
    logger.info("Shutting down.")


app = FastAPI(
    title="Crop Health & Pest Advisory System API",
    description=(
        "Backend API for the SIH Crop Health & Pest Advisory System. "
        "Supports farmer OTP login, role-based access, crop diagnosis, and more."
    ),
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(users.router)


# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/health", tags=["system"])
async def health_check():
    """Simple liveness check. Returns 200 if the API is running."""
    return {"status": "ok", "version": "1.0.0"}
