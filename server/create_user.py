from database import SessionLocal, init_db
from models import User
from auth import get_password_hash

def create_sample_user():
    init_db()
    db = SessionLocal()

    email = input("User email: ")
    phone = input("Phone: ")
    name = input("Full name: ")
    password = input("Password: ")

    # Check if already exists
    if db.query(User).filter(User.email == email).first():
        print("User with this email already exists.")
        db.close()
        return
    if db.query(User).filter(User.phone == phone).first():
        print("User with this phone already exists.")
        db.close()
        return

    user = User(
        name=name,
        phone=phone,
        email=email,
        password=get_password_hash(password)
    )
    db.add(user)
    db.commit()
    db.close()
    print("User created successfully.")

if __name__ == '__main__':
    create_sample_user()
