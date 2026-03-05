from app.schemas import resource_requests as schemas
from app.crud import resource_requests as crud
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from fastapi.encoders import jsonable_encoder

router = APIRouter(prefix="/requests", tags=["requests"])

@router.get("/", response_model=list[schemas.ResponseResourceRequestRead])
def get_requests(db: Session = Depends(get_db)):
    return crud.read_resource_requests(db)

@router.post("/", response_model=schemas.ResponseResourceRequestRead)
def post_request(
    request: schemas.RequestResourceRequestCreate,
    db: Session = Depends(get_db)
):
    return crud.create_resource_request(db, request)

@router.delete("/{request_id}")
def delete_request(request_id: int, db: Session = Depends(get_db)):
    deleted = crud.delete_resource_request(db, request_id)

    if not deleted:
        raise HTTPException(status_code=404, detail="Request not found")

    return {"message": "Request deleted"}