from sqlalchemy.orm import Session, selectinload
from sqlalchemy import select
from app import models

def create_resource_assignment(db: Session, assignment):
    db_assignment = models.ResourceAssignment(**assignment.model_dump())
    db.add(db_assignment)
    db.commit()
    db.refresh(db_assignment)
    return db_assignment

def read_resource_assignments(
    db: Session,
    resource_request_id: int | None = None
):
    stmt = (
        select(models.ResourceAssignment)
        .options(
            selectinload(models.ResourceAssignment.resource),
        )
    )

    # 👇 ajout du filtre conditionnel
    if resource_request_id is not None:
        stmt = stmt.where(
            models.ResourceAssignment.resource_request_id == resource_request_id
        )

    result = db.execute(stmt)
    return result.scalars().all()

def delete_resource_assignment(db: Session, assignment_id: int):
    assignment = db.get(models.ResourceAssignment, assignment_id)

    if not assignment:
        return None

    db.delete(assignment)
    db.commit()
    return assignment

def read_assignments_by_request(db: Session, request_id: int):
    request = (
        db.query(models.ResourceRequest)
        .options(
            selectinload(models.ResourceRequest.project),
            selectinload(models.ResourceRequest.job),
            selectinload(models.ResourceRequest.resource),
            selectinload(models.ResourceRequest.assignments)
        )
        .filter(models.ResourceRequest.id == request_id).first()
    )

    if not request:
        return None

    return request.assignments