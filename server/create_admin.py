from database import SessionLocal, init_db
from models import Admin
from auth import get_password_hash

init_db()
db = SessionLocal()

username = input("Admin username: ")
password = input("Password: ")

admin = db.query(Admin).filter(Admin.username == username).first()
if admin:
    admin.password = get_password_hash(password)
    db.commit()
    db.close()
    print("Admin updated")
else:
    admin = Admin(username=username, password=get_password_hash(password))
    db.add(admin)
    db.commit()
    db.close()
    print("Admin created")
