from app.schemas import users as schemas
from app.crud import users as crud
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models
from typing import List

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/", response_model=list[schemas.UserRead])
def get_users(db: Session = Depends(get_db)):
    return crud.get_users(db)

@router.post("/", response_model=schemas.UserRead, status_code=201) # on récupère la reponse
def create_user(
    user: schemas.UserCreate,   # ← on récupère le body ici (Request)
    db: Session = Depends(get_db)
):
    return crud.create_user(db, user)

# Mettre à jour le job d'un utilisateur
@router.put("/{user_id}/job/{job_id}", response_model=schemas.UserRead)
def put_user_job(user_id: int, job_id: int, db: Session = Depends(get_db)):
    return crud.update_user_job(db, user_id, job_id)

@router.delete("/{user_id}", status_code=204)
def delete_user(user_id: int, db: Session = Depends(get_db)):
    return crud.delete_user(db, user_id)