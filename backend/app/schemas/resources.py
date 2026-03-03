# structure des données qui entrent et sortent de ton API (Pydantic)
from .jobs import JobRead  # ← Importer JobRead
from typing import Optional
from pydantic import BaseModel, ConfigDict

class ResourceBase(BaseModel):
    email: str
    firstname: str
    lastname: Optional[str] = None
    job_id: Optional[int] = None  # Permet d’associer un job à la création
    
########################
# Schema Request (input)
########################
# utilisé quand tu crées une ressource
class RequestResourceCreate(ResourceBase):
    pass

########################
# Schema Response (output)
########################
# utilisé quand tu renvoies une ressource (On n’expose PAS le password)
class ResponseResourceRead(ResourceBase):
    id: int
    job: Optional[JobRead] = None
    model_config = ConfigDict(from_attributes=True)

