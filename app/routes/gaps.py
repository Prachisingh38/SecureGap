from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import ComplianceControl, Finding, Gap
from ..schemas import GapStatusUpdate


router = APIRouter(
    prefix="/gaps",
    tags=["Compliance Gaps"],
)


@router.get("")
def get_gaps(db: Session = Depends(get_db)):
    records = (
        db.query(Gap, Finding, ComplianceControl)
        .join(Finding, Gap.finding_id == Finding.id)
        .join(
            ComplianceControl,
            Gap.control_id == ComplianceControl.id,
        )
        .order_by(Gap.id.desc())
        .all()
    )

    results = []

    for gap, finding, control in records:
        results.append({
            "id": gap.id,
            "finding_id": finding.id,
            "finding_title": finding.title,
            "severity": finding.severity,
            "asset": finding.asset,
            "standard": control.standard,
            "control_reference": control.reference,
            "control_name": control.name,
            "status": gap.status,
            "recommendation": gap.recommendation,
        })

    return {
        "total": len(results),
        "gaps": results,
    }


@router.patch("/{gap_id}")
def update_gap_status(
    gap_id: int,
    payload: GapStatusUpdate,
    db: Session = Depends(get_db),
):
    gap = db.get(Gap, gap_id)

    if gap is None:
        raise HTTPException(
            status_code=404,
            detail="Compliance gap not found",
        )

    # A user must explicitly verify closure.
    if (
        payload.status == "Verified Closed"
        and gap.status != "Remediated - Pending Verification"
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                "Move the gap to Remediated - Pending Verification "
                "before verifying closure."
            ),
        )

    gap.status = payload.status

    db.commit()
    db.refresh(gap)

    return {
        "message": "Gap status updated successfully",
        "gap_id": gap.id,
        "status": gap.status,
    }