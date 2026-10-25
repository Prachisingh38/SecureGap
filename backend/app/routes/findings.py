from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Finding, Gap
from ..schemas import FindingCreate, FindingResponse, FindingUpdate
from ..services.mapping_engine import map_finding, remap_finding


router = APIRouter(
    prefix="/findings",
    tags=["VAPT Findings"],
)


@router.post(
    "",
    response_model=FindingResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_finding(
    payload: FindingCreate,
    db: Session = Depends(get_db),
):
    finding = Finding(**payload.model_dump())

    db.add(finding)
    db.commit()
    db.refresh(finding)

    map_finding(db, finding)

    return finding


@router.get("", response_model=list[FindingResponse])
def get_findings(db: Session = Depends(get_db)):
    return (
        db.query(Finding)
        .order_by(Finding.id.desc())
        .all()
    )


@router.get("/{finding_id}", response_model=FindingResponse)
def get_finding(
    finding_id: int,
    db: Session = Depends(get_db),
):
    finding = db.get(Finding, finding_id)

    if finding is None:
        raise HTTPException(
            status_code=404,
            detail="Finding not found",
        )

    return finding


@router.put("/{finding_id}", response_model=FindingResponse)
def update_finding(
    finding_id: int,
    payload: FindingUpdate,
    db: Session = Depends(get_db),
):
    finding = db.get(Finding, finding_id)

    if finding is None:
        raise HTTPException(
            status_code=404,
            detail="Finding not found",
        )

    old_category = finding.category

    updates = payload.model_dump(exclude_unset=True)

    for field, value in updates.items():
        setattr(finding, field, value)

    db.commit()
    db.refresh(finding)

    if finding.category != old_category:
        remap_finding(db, finding)

    return finding


@router.delete("/{finding_id}")
def delete_finding(
    finding_id: int,
    db: Session = Depends(get_db),
):
    finding = db.get(Finding, finding_id)

    if finding is None:
        raise HTTPException(
            status_code=404,
            detail="Finding not found",
        )

    # Delete related gap records first.
    db.query(Gap).filter(
        Gap.finding_id == finding_id
    ).delete(synchronize_session=False)

    db.delete(finding)
    db.commit()

    return {
        "message": "Finding deleted successfully",
        "finding_id": finding_id,
    }


@router.post("/{finding_id}/map")
def map_finding_controls(
    finding_id: int,
    db: Session = Depends(get_db),
):
    finding = db.get(Finding, finding_id)

    if finding is None:
        raise HTTPException(
            status_code=404,
            detail="Finding not found",
        )

    gaps = map_finding(db, finding)

    return {
        "finding_id": finding_id,
        "mapped_controls": len(gaps),
        "gaps": [
            {
                "gap_id": gap.id,
                "control_id": gap.control_id,
                "status": gap.status,
            }
            for gap in gaps
        ],
    }