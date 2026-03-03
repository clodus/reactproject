from sqlalchemy.orm import Session
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app import models

def create_resource_request(db: Session, request):
    db_request = models.ResourceRequest(**request.model_dump())
    db.add(db_request)
    db.commit()
    db.refresh(db_request)
    return db_request

def read_resource_requests(db: Session):
    stmt = (
        select(models.ResourceRequest)
        .options(
            selectinload(models.ResourceRequest.project),
            selectinload(models.ResourceRequest.job),
        )
    )
    result = db.execute(stmt)
    return result.scalars().all()

def delete_resource_request(db: Session, request_id: int):
    request = db.get(models.ResourceRequest, request_id)

    if not request:
        return None

    db.delete(request)
    db.commit()
    return request