from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import ComplianceControl
from ..schemas import ControlResponse


router = APIRouter(
    prefix="/compliance",
    tags=["Compliance Controls"],
)


@router.get("/controls", response_model=list[ControlResponse])
def get_controls(db: Session = Depends(get_db)):
    return (
        db.query(ComplianceControl)
        .order_by(
            ComplianceControl.standard,
            ComplianceControl.reference,
        )
        .all()
    )


@router.get("/standards")
def get_standards(db: Session = Depends(get_db)):
    standards = (
        db.query(ComplianceControl.standard)
        .distinct()
        .all()
    )

    return {
        "standards": [item[0] for item in standards]
    }