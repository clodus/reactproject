from app.schemas import resources as schemas
from app.crud import resources as crud
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app import models
from typing import List

router = APIRouter(prefix="/resources", tags=["resources"])

@router.get("/", response_model=list[schemas.ResponseResourceRead])
def get_resources(db: Session = Depends(get_db), job_id: int | None = Query(default=None)):
    return crud.read_resources(db, job_id)

@router.post("/", response_model=schemas.ResponseResourceRead, status_code=201) # on récupère la reponse
def post_resource(
    resource: schemas.RequestResourceCreate,   # ← on récupère le body ici (Request)
    db: Session = Depends(get_db)
):
    return crud.create_resource(db, resource)

# Mettre à jour le job d'un utilisateur
@router.put("/{resource_id}/job/{job_id}", response_model=schemas.ResponseResourceRead)
def put_resource_job(resource_id: int, job_id: int, db: Session = Depends(get_db)):
    return crud.update_resource_job(db, resource_id, job_id)

@router.delete("/{resource_id}", status_code=204)
def delete_resource(resource_id: int, db: Session = Depends(get_db)):
    return crud.delete_resource(db, resource_id)