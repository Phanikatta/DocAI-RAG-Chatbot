import secrets
from backend.config import settings


def verify_admin_password(password: str) -> bool:
    return secrets.compare_digest(password.encode(), settings.ADMIN_PASSWORD.encode())
