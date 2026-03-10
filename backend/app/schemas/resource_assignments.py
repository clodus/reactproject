from pydantic import BaseModel, ConfigDict
from datetime import date, datetime
from app.schemas.resources import ResponseResourceRead

# -------- REQUEST --------

class RequestResourceAssignmentCreate(BaseModel):
    resource_request_id: int
    resource_id: int
    assigned_start_date: date
    assigned_end_date: date

class RequestResourceAssignmentUpdate(BaseModel):
    resource_request_id: int | None = None
    resource_id: int | None = None
    assigned_start_date: date | None = None
    assigned_end_date: date | None = None
    detect_conflict: bool | None = None

# -------- RESPONSE --------

class ResponseResourceAssignmentRead(BaseModel):
    id: int
    resource_request_id: int
    resource_id: int
    assigned_start_date: date
    assigned_end_date: date
    detect_conflict: bool
    created_at: datetime
    resource: ResponseResourceRead

    model_config = ConfigDict(from_attributes=True)

class ResponseResourceRequestAssignmentsRead(BaseModel):
    id: int
    resource_id: int
    resource_request_id: int
    resource: ResponseResourceRead
    assigned_start_date: date
    assigned_end_date: date

    model_config = ConfigDict(from_attributes=True)

