# structure de ta base de données (SQLAlchemy)
from typing import List
from datetime import datetime
from sqlalchemy import String, Text, ForeignKey, Table, Column, DateTime, func
from sqlalchemy.orm import (
    DeclarativeBase,
    Mapped,
    mapped_column,
    relationship
)

# Date creation et update champs commun
class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )

# Base moderne
class Base(DeclarativeBase):
    pass

###
# TABLE USERS
###
class User(Base, TimestampMixin):
    __tablename__ = "users"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    firstname: Mapped[str] = mapped_column(String)
    lastname: Mapped[str] = mapped_column(String, nullable=True)
    email: Mapped[str] = mapped_column(String, unique=True)

###
# TABLE JOBS
###
class Job(Base, TimestampMixin):
    __tablename__ = "jobs"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    label: Mapped[str] = mapped_column(String(100))
    role: Mapped[str | None] = mapped_column(Text, nullable=True)