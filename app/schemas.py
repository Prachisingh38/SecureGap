from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


Severity = Literal["Critical", "High", "Medium", "Low"]

FindingStatus = Literal[
    "Open",
    "In Progress",
    "Remediated",
]

GapStatus = Literal[
    "Gap Identified",
    "Under Review",
    "Remediated - Pending Verification",
    "Verified Closed",
]


class FindingCreate(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    description: str = Field(min_length=5)
    severity: Severity
    asset: str = Field(min_length=1, max_length=200)
    category: str = Field(min_length=1, max_length=100)


class FindingUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=3, max_length=200)
    description: str | None = Field(default=None, min_length=5)
    severity: Severity | None = None
    asset: str | None = Field(default=None, min_length=1, max_length=200)
    category: str | None = Field(default=None, min_length=1, max_length=100)
    status: FindingStatus | None = None


class FindingResponse(BaseModel):
    id: int
    title: str
    description: str
    severity: Severity
    asset: str
    category: str
    status: FindingStatus
    date_identified: datetime

    model_config = ConfigDict(from_attributes=True)


class GapStatusUpdate(BaseModel):
    status: GapStatus


class ControlResponse(BaseModel):
    id: int
    standard: str
    reference: str
    name: str
    description: str

    model_config = ConfigDict(from_attributes=True)


class GapResponse(BaseModel):
    id: int
    finding_id: int
    control_id: int
    status: GapStatus
    recommendation: str

    model_config = ConfigDict(from_attributes=True)