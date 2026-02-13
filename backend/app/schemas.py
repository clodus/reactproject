# structure des données qui entrent et sortent de ton API (Pydantic)
from pydantic import BaseModel

# utilisé quand tu crées un user
class UserCreate(BaseModel):
    email: str
    username: str

# utilisé quand tu renvoies un user (On n’expose PAS le password)
class UserResponse(BaseModel):
    id: int
    email: str

    class Config:
        orm_mode = True
