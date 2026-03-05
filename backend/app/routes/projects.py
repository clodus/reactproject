from app.schemas import projects as schemas
from app.crud import projects as crud
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models
from typing import List

router = APIRouter(prefix="/projects", tags=["projects"])

@router.get("/", response_model=list[schemas.ProjectRead])
def read_projects(db: Session = Depends(get_db)):
    return crud.read_projects(db)

@router.post("/", response_model=schemas.ProjectRead, status_code=201) # on récupère la reponse
def create_project(
    project: schemas.ProjectCreate,   # ← on récupère le body ici (Request)
    db: Session = Depends(get_db)
):
    return crud.create_project(db, project)

@router.delete("/{project_id}", status_code=204)
def delete_project(project_id: int, db: Session = Depends(get_db)):
    return crud.delete_project(db, project_id)