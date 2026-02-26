from app.schemas import jobs as schemas
from app.crud import jobs as crud
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models
from typing import List

router = APIRouter(prefix="/jobs", tags=["jobs"])

@router.get("/", response_model=list[schemas.JobRead])
def get_jobs(db: Session = Depends(get_db)):
    return crud.get_jobs(db)

@router.post("/", response_model=schemas.JobRead, status_code=201) # on récupère la reponse
def create_job(
    job: schemas.JobCreate,   # ← on récupère le body ici (Request)
    db: Session = Depends(get_db)
):
    return crud.create_job(db, job)

@router.delete("/{job_id}", status_code=204)
def delete_job(job_id: int, db: Session = Depends(get_db)):
    return crud.delete_job(db, job_id)