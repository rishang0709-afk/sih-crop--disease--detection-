"""
app/db/models/otp.py — OTP record model for phone verification.
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, DateTime, Boolean

from app.db.base import Base


class OTPRecord(Base):
    __tablename__ = "otp_records"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    phone = Column(String(20), nullable=False, index=True)
    code = Column(String(10), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    is_used = Column(Boolean, default=False, nullable=False)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    def __repr__(self) -> str:
        return f"<OTPRecord phone={self.phone} used={self.is_used}>"
