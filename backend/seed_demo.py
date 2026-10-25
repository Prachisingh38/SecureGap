from app.database import SessionLocal
from app.models import Finding
from app.services.mapping_engine import map_finding

sample_findings = [
    {
        "title": "Unpatched Web Server",
        "description": (
            "The web server is running outdated software "
            "with known security vulnerabilities."
        ),
        "severity": "High",
        "asset": "Web Server",
        "category": "Technical Vulnerabilities",
        "status": "Open",
    },
    {
        "title": "Unencrypted Customer Data",
        "description": (
            "Sensitive customer information is stored "
            "without appropriate encryption."
        ),
        "severity": "High",
        "asset": "Customer Database",
        "category": "Cryptography and Encryption",
        "status": "Open",
    },
    {
        "title": "Excessive User Permissions",
        "description": (
            "Some employees have access to systems and "
            "data beyond their job requirements."
        ),
        "severity": "High",
        "asset": "Employee Portal",
        "category": "Access Control",
        "status": "Open",
    },
    {
        "title": "Weak Authentication Practices",
        "description": (
            "The application lacks sufficiently strong "
            "authentication controls for user accounts."
        ),
        "severity": "Medium",
        "asset": "Customer Portal",
        "category": "Authentication",
        "status": "Open",
    },
    {
        "title": "Missing Security Logs",
        "description": (
            "Important security events are not being "
            "recorded consistently."
        ),
        "severity": "Medium",
        "asset": "Application Server",
        "category": "Logging",
        "status": "Open",
    },
]


def seed_demo_data():
    db = SessionLocal()

    try:
        for item in sample_findings:
            finding = (
                db.query(Finding)
                .filter(Finding.title == item["title"])
                .first()
            )

            if finding is None:
                finding = Finding(**item)
                db.add(finding)
                db.commit()
                db.refresh(finding)

                print(f"Created finding: {finding.title}")
            else:
                print(f"Already exists: {finding.title}")

            # Ensure the finding has its compliance mappings.
            map_finding(db, finding)
            db.commit()

        print("\nDemo data setup completed!")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    seed_demo_data()