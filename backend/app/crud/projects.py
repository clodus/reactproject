# Logique DB
from sqlalchemy import select
from sqlalchemy.orm import selectinload, Session
from app import models, schemas

def read_projects(db: Session):
    stmt = select(models.Project)
    return db.scalars(stmt).all() 

def create_project(db: Session, project):
    db_project = models.Project(**project.model_dump())
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project  

def delete_project(db: Session, project_id: int):
    stmt = select(models.Project).where(models.Project.id == project_id)
    project = db.scalar(stmt)

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    db.delete(project)
    db.commit()
    return {"message": "Project deleted"}