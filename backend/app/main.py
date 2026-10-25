from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, SessionLocal, engine
from .services.mapping_engine import seed_compliance_controls

from .routes import findings, compliance, gaps, dashboard, reports


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create database tables.
    Base.metadata.create_all(bind=engine)

    # Insert predefined compliance controls.
    with SessionLocal() as db:
        seed_compliance_controls(db)

    yield


app = FastAPI(
    title="SecureGap API",
    description=(
        "A prototype for mapping VAPT findings to ISO 27001 "
        "controls and potentially relevant GDPR provisions."
    ),
    version="1.0.0",
    lifespan=lifespan,
)


# Allow the frontend to communicate with the backend.
# Restrict origins to trusted frontend URLs before deployment.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {
        "message": "Welcome to SecureGap API",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}


# Register API routes.
app.include_router(findings.router)
app.include_router(compliance.router)
app.include_router(gaps.router)
app.include_router(dashboard.router)
app.include_router(reports.router)