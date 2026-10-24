from collections import Counter

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import ComplianceControl, Finding, Gap


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
)


@router.get("")
def get_dashboard(db: Session = Depends(get_db)):
    findings = db.query(Finding).all()
    gaps = db.query(Gap).all()

    severity_counts = Counter(
        finding.severity for finding in findings
    )

    gap_status_counts = Counter(
        gap.status for gap in gaps
    )

    affected_control_ids = {
        gap.control_id
        for gap in gaps
        if gap.status != "Verified Closed"
    }

    open_gap_count = sum(
        1
        for gap in gaps
        if gap.status != "Verified Closed"
    )

    critical_high_count = sum(
        1
        for finding in findings
        if finding.severity in ("Critical", "High")
    )

    return {
        "total_findings": len(findings),
        "critical_and_high_findings": critical_high_count,
        "unique_affected_controls": len(affected_control_ids),
        "open_gaps": open_gap_count,
        "severity_breakdown": {
            severity: severity_counts.get(severity, 0)
            for severity in (
                "Critical",
                "High",
                "Medium",
                "Low",
            )
        },
        "gap_status_breakdown": dict(gap_status_counts),
    }