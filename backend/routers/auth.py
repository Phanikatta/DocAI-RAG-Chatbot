from fastapi import APIRouter

from backend.auth.auth import verify_admin_password
from backend.models.schemas import AuthRequest, AuthResponse

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login", response_model=AuthResponse)
async def login(req: AuthRequest):
    if verify_admin_password(req.password):
        return AuthResponse(success=True, token="admin-session-token")
    return AuthResponse(success=False)
