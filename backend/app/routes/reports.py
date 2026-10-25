import csv
import io

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import ComplianceControl, Finding, Gap


router = APIRouter(
    prefix="/reports",
    tags=["Reports"],
)


@router.get("/export")
def export_report(db: Session = Depends(get_db)):
    output = io.StringIO()

    writer = csv.writer(output)

    writer.writerow([
        "Finding ID",
        "Finding Title",
        "Severity",
        "Asset",
        "Category",
        "Finding Status",
        "Compliance Standard",
        "Control Reference",
        "Control Name",
        "Gap Status",
        "Recommendation",
    ])

    records = (
        db.query(Finding, Gap, ComplianceControl)
        .join(Gap, Finding.id == Gap.finding_id)
        .join(
            ComplianceControl,
            Gap.control_id == ComplianceControl.id,
        )
        .order_by(Finding.id, Gap.id)
        .all()
    )

    for finding, gap, control in records:
        writer.writerow([
            finding.id,
            finding.title,
            finding.severity,
            finding.asset,
            finding.category,
            finding.status,
            control.standard,
            control.reference,
            control.name,
            gap.status,
            gap.recommendation,
        ])

    output.seek(0)

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": (
                'attachment; filename="securegap_report.csv"'
            )
        },
    )