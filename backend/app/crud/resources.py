# Logique DB
from sqlalchemy import select
from sqlalchemy.orm import selectinload, Session
from app import models, schemas

def read_resources(db: Session, job_id: int | None = None):
    stmt = select(models.Resource).options(selectinload(models.Resource.job))

    # 👇 ajout du filtre conditionnel
    if job_id is not None:
        stmt = stmt.where(
            models.Resource.job_id == job_id
        )

    result = db.execute(stmt)
    return result.scalars().all()

def create_resource(db: Session, resource):
    db_resource = models.Resource(**resource.model_dump())
    db.add(db_resource)
    db.commit()
    db.refresh(db_resource)
    return db_resource  

def delete_resource(db: Session, resource_id: int):
    stmt = select(models.Resource).where(models.Resource.id == resource_id)
    resource = db.scalar(stmt)

    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")

    db.delete(resource)
    db.commit()
    return {"message": "Resource deleted"}

def update_resource_job(db: Session, resource_id: int, job_id: int):
    resource = db.query(models.Resource).filter(models.Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    resource.job_id = job_id
    db.commit()
    db.refresh(resource)
    return resource