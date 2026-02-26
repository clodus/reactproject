# Logique DB
from sqlalchemy import select
from sqlalchemy.orm import selectinload, Session
from app import models, schemas

def get_jobs(db: Session):
    stmt = select(models.Job)
    return db.scalars(stmt).all() # renvoie une liste d'objets Job 

def create_job(db: Session, job):
    db_job = models.Job(**job.model_dump())
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return db_job  

def delete_job(db: Session, job_id: int):
    stmt = select(models.Job).where(models.Job.id == job_id)
    job = db.scalar(stmt)

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    db.delete(job)
    db.commit()
    return {"message": "Job deleted"}