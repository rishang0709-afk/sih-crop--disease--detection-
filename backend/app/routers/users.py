"""
app/routers/users.py — User profile endpoints (role-protected).
"""
from fastapi import APIRouter, Depends

from app.core.dependencies import get_current_user, require_role
from app.db.models.user import User, UserRole
from app.schemas.auth import UserProfileResponse

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserProfileResponse)
async def get_my_profile(
    current_user: User = Depends(get_current_user),
) -> UserProfileResponse:
    """Return the profile of the currently authenticated user."""
    return UserProfileResponse(
        id=current_user.id,
        phone=current_user.phone,
        role=current_user.role.value,
        name=current_user.name,
        is_active=current_user.is_active,
        village=current_user.village,
        block=current_user.block,
        district=current_user.district,
        preferred_language=current_user.preferred_language.value if current_user.preferred_language else None,
        designation=current_user.designation,
        jurisdiction_type=current_user.jurisdiction_type.value if current_user.jurisdiction_type else None,
        jurisdiction_name=current_user.jurisdiction_name,
    )


# ── Role-specific protected routes (placeholders for later phases) ────────────

@router.get(
    "/officer/summary",
    dependencies=[Depends(require_role(
        UserRole.BDO,
        UserRole.AGRICULTURE_OFFICER,
        UserRole.HORTICULTURE_OFFICER,
        UserRole.DISTRICT_STATE_OFFICIAL,
        UserRole.KVK_LAB_EXPERT,
    ))],
)
async def officer_summary():
    """Placeholder — will be populated in Phase 7 (hotspot dashboard)."""
    return {"message": "Officer dashboard data will be available in Phase 7."}


@router.get(
    "/expert/queue-count",
    dependencies=[Depends(require_role(UserRole.KVK_LAB_EXPERT))],
)
async def expert_queue_count():
    """Placeholder — will be populated in Phase 6 (expert validation)."""
    return {"pending_validations": 0, "message": "Expert queue available in Phase 6."}
