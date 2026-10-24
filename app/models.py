from datetime import datetime, timezone

from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)

from .database import Base


def utc_now():
    return datetime.now(timezone.utc)


class Finding(Base):
    __tablename__ = "findings"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)

    severity = Column(String(20), nullable=False)
    asset = Column(String(200), nullable=False)
    category = Column(String(100), nullable=False)

    status = Column(
        String(30),
        nullable=False,
        default="Open",
    )

    date_identified = Column(
        DateTime(timezone=True),
        nullable=False,
        default=utc_now,
    )


class ComplianceControl(Base):
    __tablename__ = "compliance_controls"

    id = Column(Integer, primary_key=True, index=True)

    standard = Column(String(50), nullable=False)
    reference = Column(String(50), nullable=False)
    name = Column(String(250), nullable=False)
    description = Column(Text, nullable=False)

    __table_args__ = (
        UniqueConstraint(
            "standard",
            "reference",
            name="uq_compliance_control",
        ),
    )


class Gap(Base):
    __tablename__ = "gaps"

    id = Column(Integer, primary_key=True, index=True)

    finding_id = Column(
        Integer,
        ForeignKey("findings.id", ondelete="CASCADE"),
        nullable=False,
    )

    control_id = Column(
        Integer,
        ForeignKey("compliance_controls.id"),
        nullable=False,
    )

    status = Column(
        String(40),
        nullable=False,
        default="Gap Identified",
    )

    recommendation = Column(Text, nullable=False)

    __table_args__ = (
        UniqueConstraint(
            "finding_id",
            "control_id",
            name="uq_finding_control_gap",
        ),
    )