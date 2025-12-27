from database import SessionLocal, init_db
from models import Admin
from auth import verify_password


def list_admins_and_check_password(username=None, test_password=None):
    init_db()
    db = SessionLocal()
    try:
        admins = db.query(Admin).all()
        if not admins:
            print("No admins found in database")
            return
        for a in admins:
            print(f"Admin id={a.id} username={a.username} password_hash={a.password}")
        if username and test_password:
            target = db.query(Admin).filter(Admin.username == username).first()
            if not target:
                print(f"No admin with username: {username}")
                return
            ok = verify_password(test_password, target.password)
            print(f"Password verification for '{username}': {ok}")
    finally:
        db.close()


if __name__ == '__main__':
    import sys
    if len(sys.argv) == 3:
        list_admins_and_check_password(sys.argv[1], sys.argv[2])
    else:
        list_admins_and_check_password()