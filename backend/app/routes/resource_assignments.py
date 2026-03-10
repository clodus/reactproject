from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import resource_assignments as schemas
from app.crud import resource_assignments as crud
from fastapi.encoders import jsonable_encoder

router = APIRouter(prefix="/assignments",tags=["assignments"])

@router.get("/", response_model=list[schemas.ResponseResourceAssignmentRead])
def get_assignments(db: Session = Depends(get_db), resource_request_id: int | None = Query(default=None)):
    return crud.read_resource_assignments(db, resource_request_id)

@router.post("/", response_model=schemas.ResponseResourceAssignmentRead)
def post_assignment(
    assignment: schemas.RequestResourceAssignmentCreate,
    db: Session = Depends(get_db),):
    return crud.create_resource_assignment(db, assignment)

@router.delete("/{assignment_id}")
def delete_assignment(
    assignment_id: int,
    db: Session = Depends(get_db),
):
    deleted = crud.delete_resource_assignment(db, assignment_id)

    if not deleted:
        raise HTTPException(status_code=404, detail="Assignment not found")

    return {"message": "Assignment deleted"}

@router.patch("/{assignment_id}", response_model=schemas.ResponseResourceAssignmentRead)
def patch_assignment(
    assignment_id: int,
    assignment: schemas.RequestResourceAssignmentUpdate,
    db: Session = Depends(get_db),
):
    db_assignment = crud.update_resource_assignment(db, assignment_id, assignment)
    if db_assignment is None:
        raise HTTPException(status_code=404, detail="Assignment not found")
    return db_assignment