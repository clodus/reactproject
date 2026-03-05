from pydantic import BaseModel, ConfigDict
from datetime import date
from app.schemas.resources import ResponseResourceRead




# -------- REQUEST --------

class RequestResourceAssignmentCreate(BaseModel):
    resource_request_id: int
    resource_id: int
    assigned_start_date: date
    assigned_end_date: date


# -------- RESPONSE --------

class ResponseResourceAssignmentRead(BaseModel):
    id: int
    resource_request_id: int
    resource_id: int
    assigned_start_date: date
    assigned_end_date: date
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

