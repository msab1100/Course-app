from database import SessionLocal
from models import Admin
from auth import get_password_hash

db = SessionLocal()
a = db.query(Admin).first()
if a:
    print('before:', a.username)
    a.username = 'Admin'
    a.password = get_password_hash('000')
    db.commit()
    print('reset ok')
else:
    print('no admin found, creating one')
    a = Admin(username='Admin', password=get_password_hash('000'))
    db.add(a)
    db.commit()
    print('created')
db.close()
