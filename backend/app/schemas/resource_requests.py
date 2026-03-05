from pydantic import BaseModel, ConfigDict, Field
from datetime import date
from app.models import TaskType
from app.schemas.projects import ProjectRead
from app.schemas.jobs import JobRead
from app.schemas.resource_assignments import ResponseResourceAssignmentRead
from app.schemas.resources import ResponseResourceRead


###################
# Request
###################

class RequestResourceRequestCreate(BaseModel):
    project_id: int
    job_id: int
    task_type: TaskType
    due_date: date
    duration_days: int


###################
# Response
###################

class ResponseResourceRequestRead(BaseModel):
    id: int
    project_id: int
    job_id: int
    task_type: TaskType
    due_date: date
    duration_days: int
    project: ProjectRead
    job: JobRead
    assignments: list[ResponseResourceAssignmentRead] = Field(default_factory=list)
    assignments_count: int = 0
    model_config = ConfigDict(from_attributes=True)