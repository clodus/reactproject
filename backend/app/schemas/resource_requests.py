from pydantic import BaseModel, ConfigDict
from datetime import date
from app.models import TaskType
from app.schemas.projects import ProjectRead
from app.schemas.jobs import JobRead


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

    model_config = ConfigDict(from_attributes=True)