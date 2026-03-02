# structure des données qui entrent et sortent de ton API (Pydantic)
from .jobs import JobRead  # ← Importer JobRead
from typing import Optional
from pydantic import BaseModel, ConfigDict

class UserBase(BaseModel):
    email: str
    firstname: str
    lastname: Optional[str] = None
    job_id: Optional[int] = None  # Permet d’associer un job à la création
    
########################
# Schema Request (input)
########################
# utilisé quand tu crées un user
class UserCreate(UserBase):
    pass

########################
# Schema Response (output)
########################
# utilisé quand tu renvoies un user (On n’expose PAS le password)
class UserRead(UserBase):
    id: int
    job: Optional[JobRead] = None
    model_config = ConfigDict(from_attributes=True)

