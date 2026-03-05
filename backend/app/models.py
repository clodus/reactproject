# structure de ta base de données (SQLAlchemy)
from typing import List, Optional
from datetime import datetime
from sqlalchemy import String, Text, ForeignKey, Table, Column, DateTime, func, Enum, Date, Integer
from sqlalchemy.orm import (
    DeclarativeBase,
    Mapped,
    mapped_column,
    relationship
)
from enum import Enum as PyEnum

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
# TABLE RESOURCES
###
class Resource(Base, TimestampMixin):
    __tablename__ = "resources"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    firstname: Mapped[str] = mapped_column(String)
    lastname: Mapped[str] = mapped_column(String, nullable=True)
    email: Mapped[str] = mapped_column(String, unique=True)
    job_id: Mapped[Optional[int]] = mapped_column(ForeignKey("jobs.id"), nullable=True)

    job: Mapped[Optional[job]] = relationship("Job", back_populates="resources")

###
# TABLE JOBS
###
class Job(Base, TimestampMixin):
    __tablename__ = "jobs"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    label: Mapped[str] = mapped_column(String(100))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    resources: Mapped[List["Resource"]] = relationship("Resource", back_populates="job")

###
# TABLE PROJECTS
###
class Project(Base, TimestampMixin):
    __tablename__ = "projects"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

###
# ENUM TASK TYPE
###
class TaskType(PyEnum):
    RUN = "RUN"
    BUILD = "BUILD"
    DISCO = "DISCO"
    ESTIMATION = "ESTIMATION"
    REFACTO = "REFACTO"
    KT = "KT"

###
# TABLE RESOURCE REQUESTS
###
class ResourceRequest(Base):
    __tablename__ = "resource_requests"

    id: Mapped[int] = mapped_column(primary_key=True)

    project_id: Mapped[int] = mapped_column(
        ForeignKey("projects.id")
    )

    job_id: Mapped[int] = mapped_column(
        ForeignKey("jobs.id")
    )

    task_type: Mapped[TaskType] = mapped_column(
        Enum(TaskType)
    )

    due_date: Mapped[Date] = mapped_column(Date)

    duration_days: Mapped[int] = mapped_column(Integer)

    # relations
    project = relationship("Project")
    job = relationship("Job")
    assignments = relationship("ResourceAssignment", back_populates="request", cascade="all, delete-orphan")

###
# TABLE RESOURCE ASSIGNEMENTS
###
class ResourceAssignment(Base, TimestampMixin):
    __tablename__ = "resource_assignments"

    id: Mapped[int] = mapped_column(primary_key=True)

    resource_request_id: Mapped[int] = mapped_column(
        ForeignKey("resource_requests.id", ondelete="CASCADE")
    )

    resource_id: Mapped[int] = mapped_column(
        ForeignKey("resources.id", ondelete="CASCADE")
    )

    assigned_start_date: Mapped[Date] = mapped_column(Date)
    assigned_end_date: Mapped[Date] = mapped_column(Date)

    request = relationship("ResourceRequest", back_populates="assignments")
    resource = relationship("Resource", backref="assignments")