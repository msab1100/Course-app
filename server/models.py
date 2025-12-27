from sqlalchemy import Column, Integer, String, Text, DECIMAL, DateTime
from sqlalchemy.sql import func
from database import Base


class Admin(Base):
    __tablename__ = "admins"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, nullable=False)
    password = Column(String(255), nullable=False)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    phone = Column(String(20), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=False)
    created_at = Column(DateTime, server_default=func.now())


class Enrollment(Base):
    __tablename__ = "enrollments"

    id = Column(Integer, primary_key=True, index=True)
    user_email = Column(String(255), nullable=False, index=True)
    course_id = Column(Integer, nullable=False, index=True)
    enrolled_at = Column(DateTime, server_default=func.now())


class Purchase(Base):
    __tablename__ = "purchases"

    id = Column(Integer, primary_key=True, index=True)
    user_email = Column(String(255), nullable=False, index=True)
    course_id = Column(Integer, nullable=False, index=True)
    status = Column(String(20), default="paid", nullable=False)  # paid/accepted
    created_at = Column(DateTime, server_default=func.now())


class UserSession(Base):
    __tablename__ = "user_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_email = Column(String(255), nullable=False, index=True)
    login_at = Column(DateTime, server_default=func.now())
    logout_at = Column(DateTime, nullable=True)


class Course(Base):
    __tablename__ = "courses"

    course_id = Column(Integer, primary_key=True, index=True)
    course_name = Column(String(255), nullable=False)
    description = Column(Text)
    duration_weeks = Column(Integer, nullable=False)
    fees = Column(DECIMAL(10, 2), nullable=False)
    instructor = Column(String(255), default="")
    category = Column(String(100), default="")
    level = Column(String(50), default="")
    created_at = Column(DateTime, server_default=func.now())
