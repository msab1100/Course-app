from fastapi import FastAPI, Depends, HTTPException, Response, Request
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta


from models import Admin, Course, Enrollment, Purchase, UserSession
from deps import get_db
from database import init_db
from auth import (
    verify_password,
    get_password_hash,
    create_access_token,
    decode_token,
    ACCESS_TOKEN_EXPIRE_MINUTES,
)

app = FastAPI(title="Example DB API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup():
    init_db()


# ---------- Schemas ----------

class AdminCreate(BaseModel):
    username: str
    password: str


class AdminLogin(BaseModel):
    username: str
    password: str


class AdminUpdate(BaseModel):
    username: Optional[str] = None
    current_password: str
    new_password: Optional[str] = None


class UserCreate(BaseModel):
    name: str
    number: str
    gmail: str
    password: str


class UserLogin(BaseModel):
    email: str
    password: str


class CourseCreate(BaseModel):
    course_name: str
    description: Optional[str] = None
    duration_weeks: int
    fees: float
    instructor: str = ""
    category: str = ""
    level: str = ""


class UserCreate(BaseModel):
    name: str
    phone: str
    email: str
    password: str


class CourseUpdate(BaseModel):
    course_name: Optional[str] = None
    description: Optional[str] = None
    duration_weeks: Optional[int] = None
    fees: Optional[float] = None
    instructor: Optional[str] = None
    category: Optional[str] = None
    level: Optional[str] = None


class EnrollmentCreate(BaseModel):
    course_id: int


# ---------- Auth Dependency ----------

def get_current_admin(request: Request, db: Session = Depends(get_db)):
    token = request.cookies.get("access_token")

    if not token:
        auth = request.headers.get("Authorization")
        if auth and auth.lower().startswith("bearer "):
            token = auth.split(" ", 1)[1]

    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    payload = decode_token(token)

    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")

    if payload.get("_expired"):
        raise HTTPException(status_code=401, detail="Session expired")

    admin = db.query(Admin).filter(Admin.id == payload.get("admin_id")).first()
    if not admin:
        raise HTTPException(status_code=401, detail="Admin not found")

    return admin


# ---------- Admin Routes ----------

@app.post("/admin/setup")
def setup_admin(data: AdminCreate, db: Session = Depends(get_db)):
    if db.query(Admin).first():
        raise HTTPException(status_code=409, detail="Admin already exists")

    admin = Admin(
        username=data.username,
        password=get_password_hash(data.password)
    )
    db.add(admin)
    db.commit()
    return {"msg": "Admin created"}


@app.post("/admin/login")
def admin_login(login: AdminLogin, response: Response, db: Session = Depends(get_db)):
    admin = db.query(Admin).filter(Admin.username == login.username).first()

    if not admin or not verify_password(login.password, admin.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"admin_id": admin.id})

    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        samesite="lax",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )

    return {"access_token": token, "token": token, "token_type": "bearer"}


@app.post("/admin/auth")
def admin_auth(login: AdminLogin, response: Response, db: Session = Depends(get_db)):
    return admin_login(login=login, response=response, db=db)


@app.post("/admin/logout")
def logout(response: Response):
    response.delete_cookie("access_token")
    return {"msg": "Logged out"}


@app.get("/admin/me")
def admin_me(admin: Admin = Depends(get_current_admin)):
    return {"id": admin.id, "username": admin.username}


@app.get("/admin/exists")
def admin_exists(db: Session = Depends(get_db)):
    count = db.query(Admin).count()
    return {"exists": bool(count), "admin_count": count}


@app.get("/admin/list")
def admin_list(db: Session = Depends(get_db)):
    admins = db.query(Admin).all()
    return [{"id": a.id, "username": a.username} for a in admins]


@app.put("/admin")
def update_admin(
    update: AdminUpdate,
    admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    if not verify_password(update.current_password, admin.password):
        raise HTTPException(status_code=401, detail="Wrong password")

    if update.username and update.username != admin.username:
        if db.query(Admin).filter(Admin.username == update.username).first():
            raise HTTPException(status_code=409, detail="Username already exists")
        admin.username = update.username

    if update.new_password:
        admin.password = get_password_hash(update.new_password)

    db.commit()
    return {"msg": "Admin updated"}


# ---------- Admin User Analytics ----------

@app.get("/admin/stats")
def admin_stats(admin: Admin = Depends(get_current_admin), db: Session = Depends(get_db)):
    # Active users: anyone with a purchase or enrollment in the last 7 days
    from datetime import datetime, timedelta
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    active_purchases = db.query(Purchase.user_email).filter(Purchase.created_at >= seven_days_ago).distinct().count()
    active_enrollments = db.query(Enrollment.user_email).filter(Enrollment.enrolled_at >= seven_days_ago).distinct().count()
    active_users = max(active_purchases, active_enrollments)

    # Totals
    total_purchases = db.query(Purchase).count()
    total_enrollments = db.query(Enrollment).count()

    return {
        "active_users_last_7_days": active_users,
        "total_purchases": total_purchases,
        "total_enrollments": total_enrollments
    }


@app.get("/admin/activity")
def admin_recent_activity(admin: Admin = Depends(get_current_admin), db: Session = Depends(get_db)):
    # Recent purchases
    purchases = db.query(Purchase).order_by(Purchase.created_at.desc()).limit(20).all()
    enrollments = db.query(Enrollment).order_by(Enrollment.enrolled_at.desc()).limit(20).all()

    return {
        "recent_purchases": [
            {
                "user_email": p.user_email,
                "course_id": p.course_id,
                "status": p.status,
                "created_at": p.created_at.isoformat() if p.created_at else None
            }
            for p in purchases
        ],
        "recent_enrollments": [
            {
                "user_email": e.user_email,
                "course_id": e.course_id,
                "enrolled_at": e.enrolled_at.isoformat() if e.enrolled_at else None
            }
            for e in enrollments
        ]
    }


@app.get("/admin/users")
def admin_list_users(admin: Admin = Depends(get_current_admin), db: Session = Depends(get_db)):
    # Gather unique user emails from purchases and enrollments
    purchase_emails = {p.user_email for p in db.query(Purchase.user_email).distinct()}
    enrollment_emails = {e.user_email for e in db.query(Enrollment.user_email).distinct()}
    all_emails = sorted(purchase_emails.union(enrollment_emails))
    return [{"email": email} for email in all_emails]


@app.get("/admin/enrollments")
def admin_list_enrollments(admin: Admin = Depends(get_current_admin), db: Session = Depends(get_db)):
    enrollments = db.query(Enrollment).order_by(Enrollment.enrolled_at.desc()).all()
    return [
        {
            "user_email": e.user_email,
            "course_id": e.course_id,
            "enrolled_at": e.enrolled_at.isoformat() if e.enrolled_at else None
        }
        for e in enrollments
    ]


@app.get("/admin/sessions/logged-in")
def admin_logged_in_users(admin: Admin = Depends(get_current_admin), db: Session = Depends(get_db)):
    # Users with a session without logout time
    sessions = db.query(UserSession).filter(UserSession.logout_at.is_(None)).order_by(UserSession.login_at.desc()).all()
    return [
        {
            "user_email": s.user_email,
            "login_at": s.login_at.isoformat() if s.login_at else None
        }
        for s in sessions
    ]


@app.get("/admin/sessions/logged-out")
def admin_logged_out_users(admin: Admin = Depends(get_current_admin), db: Session = Depends(get_db)):
    # Users with a logout time
    sessions = db.query(UserSession).filter(UserSession.logout_at.isnot(None)).order_by(UserSession.logout_at.desc()).limit(50).all()
    return [
        {
            "user_email": s.user_email,
            "login_at": s.login_at.isoformat() if s.login_at else None,
            "logout_at": s.logout_at.isoformat() if s.logout_at else None
        }
        for s in sessions
    ]


# ---------- Courses ----------

# Keep admin-only routes under /admin prefix for clarity
@app.get("/admin/courses")
def get_courses_admin(
    admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    courses = db.query(Course).all()
    return [
        {
            "course_id": c.course_id,
            "course_name": c.course_name,
            "description": c.description,
            "duration_weeks": c.duration_weeks,
            "fees": float(c.fees),
            "created_at": c.created_at.isoformat() if c.created_at else None
        }
        for c in courses
    ]


@app.post("/admin/courses")
def create_course_admin(
    course: CourseCreate,
    admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    new_course = Course(**course.dict())
    db.add(new_course)
    db.commit()
    db.refresh(new_course)
    return {
        "course_id": new_course.course_id,
        "course_name": new_course.course_name,
        "description": new_course.description,
        "duration_weeks": new_course.duration_weeks,
        "fees": float(new_course.fees),
        "created_at": new_course.created_at.isoformat() if new_course.created_at else None
    }


@app.put("/admin/courses/{course_id}")
def update_course_admin(
    course_id: int,
    update: CourseUpdate,
    admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    course = db.query(Course).filter(Course.course_id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    if update.course_name is not None:
        course.course_name = update.course_name
    if update.description is not None:
        course.description = update.description
    if update.duration_weeks is not None:
        course.duration_weeks = update.duration_weeks
    if update.fees is not None:
        course.fees = update.fees
    if update.instructor is not None:
        course.instructor = update.instructor
    if update.category is not None:
        course.category = update.category
    if update.level is not None:
        course.level = update.level
    db.commit()
    return {"msg": "Course updated"}


@app.delete("/admin/courses/{course_id}")
def delete_course_admin(
    course_id: int,
    admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    db_course = db.query(Course).filter(Course.course_id == course_id).first()
    if not db_course:
        raise HTTPException(status_code=404, detail="Course not found")
    db.delete(db_course)
    db.commit()
    return {"msg": "Course deleted"}


# ---------- Public Courses ----------

@app.get("/courses")
def list_courses_public(db: Session = Depends(get_db)):
    """Public endpoint: anyone can view courses."""
    return db.query(Course).all()


# ---------- User Auth ----------

@app.post("/user/signup")
def user_signup(data: UserCreate, response: Response, db: Session = Depends(get_db)):
    # Only allow Gmail addresses
    if not data.email.lower().endswith("@gmail.com"):
        raise HTTPException(status_code=400, detail="Only Gmail addresses are allowed")
    # Create a token without storing a user
    token = create_access_token({"user_email": data.email})
    response.set_cookie(
        key="user_token",
        value=token,
        httponly=True,
        samesite="lax",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )
    # Record login session
    session = UserSession(user_email=data.email)
    db.add(session)
    db.commit()
    return {"msg": "User signed up", "email": data.email}


@app.post("/user/login")
def user_login(login: UserLogin, response: Response, db: Session = Depends(get_db)):
    # Allow any Gmail address and password; no DB validation
    if not login.email.lower().endswith("@gmail.com"):
        raise HTTPException(status_code=400, detail="Only Gmail addresses are allowed")

    # Create a token without storing a user
    token = create_access_token({"user_email": login.email})

    response.set_cookie(
        key="user_token",
        value=token,
        httponly=True,
        samesite="lax",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )

    # Record login session
    session = UserSession(user_email=login.email)
    db.add(session)
    db.commit()

    return {"access_token": token, "token": token, "token_type": "bearer"}


@app.post("/user/logout")
def user_logout(response: Response, request: Request, db: Session = Depends(get_db)):
    # Find the most recent session without logout time and close it
    token = request.cookies.get("user_token")
    if token:
        payload = decode_token(token)
        if payload and not payload.get("_expired"):
            email = payload.get("user_email")
            if email:
                session = db.query(UserSession).filter(
                    UserSession.user_email == email,
                    UserSession.logout_at.is_(None)
                ).order_by(UserSession.login_at.desc()).first()
                if session:
                    from datetime import datetime
                    session.logout_at = datetime.utcnow()
                    db.commit()
    response.delete_cookie("user_token")
    return {"msg": "Logged out"}


@app.get("/user/me")
def user_me(request: Request):
    # Decode token without DB lookup
    token = request.cookies.get("user_token")
    if not token:
        auth = request.headers.get("Authorization")
        if auth and auth.lower().startswith("bearer "):
            token = auth.split(" ", 1)[1]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    payload = decode_token(token)
    if not payload or payload.get("_expired"):
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return {"email": payload.get("user_email")}


@app.post("/user/enroll")
def enroll_course(data: EnrollmentCreate, request: Request, db: Session = Depends(get_db)):
    token = request.cookies.get("user_token")
    if not token:
        auth = request.headers.get("Authorization")
        if auth and auth.lower().startswith("bearer "):
            token = auth.split(" ", 1)[1]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    payload = decode_token(token)
    if not payload or payload.get("_expired"):
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    user_email = payload.get("user_email")
    # Prevent duplicate enrollments
    existing = db.query(Enrollment).filter(Enrollment.user_email == user_email, Enrollment.course_id == data.course_id).first()
    if existing:
        raise HTTPException(status_code=409, detail="Already enrolled")
    enrollment = Enrollment(user_email=user_email, course_id=data.course_id)
    db.add(enrollment)
    db.commit()
    return {"msg": "Enrolled successfully"}


# ---------- Course Payments ----------

@app.post("/courses/{course_id}/pay")
def pay_for_course(
    course_id: int,
    request: Request,
    db: Session = Depends(get_db)
):
    # Get user email from token
    token = request.cookies.get("user_token")
    if not token:
        auth = request.headers.get("Authorization")
        if auth and auth.lower().startswith("bearer "):
            token = auth.split(" ", 1)[1]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    payload = decode_token(token)
    if not payload or payload.get("_expired"):
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    user_email = payload.get("user_email")
    if not user_email:
        raise HTTPException(status_code=401, detail="Invalid token")

    # Verify course exists
    course = db.query(Course).filter(Course.course_id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    # Check if already paid
    existing = db.query(Purchase).filter(
        Purchase.user_email == user_email,
        Purchase.course_id == course_id
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="Already purchased")

    # Record purchase
    purchase = Purchase(user_email=user_email, course_id=course_id, status="paid")
    db.add(purchase)
    db.commit()
    return {"msg": "Payment successful", "course_id": course_id, "course_name": course.course_name}


@app.get("/user/courses")
def list_user_courses(
    request: Request,
    db: Session = Depends(get_db)
):
    # Get user email from token
    token = request.cookies.get("user_token")
    if not token:
        auth = request.headers.get("Authorization")
        if auth and auth.lower().startswith("bearer "):
            token = auth.split(" ", 1)[1]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    payload = decode_token(token)
    if not payload or payload.get("_expired"):
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    user_email = payload.get("user_email")
    if not user_email:
        raise HTTPException(status_code=401, detail="Invalid token")

    # Fetch purchased courses
    purchases = db.query(Purchase).filter(Purchase.user_email == user_email).all()
    course_ids = [p.course_id for p in purchases]
    courses = db.query(Course).filter(Course.course_id.in_(course_ids)).all()
    return courses
