import json
from pathlib import Path

from sqlalchemy.orm import Session

from ..models import ComplianceControl, Finding, Gap


DATA_FILE = Path(__file__).resolve().parent.parent / "data" / "mappings.json"


def load_mapping_data():
    """Load controls and mapping rules from the JSON file."""
    with DATA_FILE.open("r", encoding="utf-8") as file:
        return json.load(file)


def seed_compliance_controls(db: Session):
    """Insert predefined controls if they do not already exist."""
    data = load_mapping_data()

    for item in data["controls"]:
        control = (
            db.query(ComplianceControl)
            .filter_by(
                standard=item["standard"],
                reference=item["reference"],
            )
            .first()
        )

        if control is None:
            control = ComplianceControl(
                standard=item["standard"],
                reference=item["reference"],
                name=item["name"],
                description=item["description"],
            )
            db.add(control)

    db.commit()


def map_finding(db: Session, finding: Finding):
    """Create gap records for the controls mapped to a finding."""
    data = load_mapping_data()

    rule = data["mappings"].get(finding.category)

    if rule is None:
        return []

    created_gaps = []

    for standard, reference in rule["controls"]:
        control = (
            db.query(ComplianceControl)
            .filter_by(
                standard=standard,
                reference=reference,
            )
            .first()
        )

        if control is None:
            continue

        existing_gap = (
            db.query(Gap)
            .filter_by(
                finding_id=finding.id,
                control_id=control.id,
            )
            .first()
        )

        if existing_gap is not None:
            created_gaps.append(existing_gap)
            continue

        gap = Gap(
            finding_id=finding.id,
            control_id=control.id,
            status="Gap Identified",
            recommendation=rule["recommendation"],
        )

        db.add(gap)
        created_gaps.append(gap)

    db.commit()

    for gap in created_gaps:
        db.refresh(gap)

    return created_gaps


def remap_finding(db: Session, finding: Finding):
    """Refresh mappings when a finding's category changes."""
    db.query(Gap).filter(
        Gap.finding_id == finding.id
    ).delete(synchronize_session=False)

    db.commit()

    return map_finding(db, finding)