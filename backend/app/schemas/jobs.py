# structure des données qui entrent et sortent de ton API (Pydantic)
from typing import Optional
from pydantic import BaseModel, ConfigDict

class UserBase(BaseModel):
    label: str
    role: str

########################
# Schema Request (input)
########################
# utilisé quand tu crées un user
class JobCreate(UserBase):
    pass

########################
# Schema Response (output)
########################
# utilisé quand tu renvoies un user (On n’expose PAS le password)
class JobRead(UserBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

