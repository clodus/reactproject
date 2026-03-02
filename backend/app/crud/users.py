# Logique DB
from sqlalchemy import select
from sqlalchemy.orm import selectinload, Session
from app import models, schemas

def get_users(db: Session):
    stmt = select(models.User).options(selectinload(models.User.job))
    return db.scalars(stmt).all() # renvoie une liste d'objets User 

def create_user(db: Session, user):
    db_user = models.User(**user.model_dump())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user  

def delete_user(db: Session, user_id: int):
    stmt = select(models.User).where(models.User.id == user_id)
    user = db.scalar(stmt)

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(user)
    db.commit()
    return {"message": "User deleted"}

def update_user_job(db: Session, user_id: int, job_id: int):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.job_id = job_id
    db.commit()
    db.refresh(user)
    return user