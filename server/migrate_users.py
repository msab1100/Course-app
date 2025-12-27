from database import SessionLocal, engine, init_db
from sqlalchemy import text

def migrate_users_table():
    """Add missing columns to the users table if they don't exist."""
    init_db()
    with engine.connect() as conn:
        # Check if column exists; if not, add it
        result = conn.execute(text("PRAGMA table_info(users)"))
        columns = {row[1] for row in result}
        with conn.begin():
            if 'name' not in columns:
                conn.execute(text("ALTER TABLE users ADD COLUMN name VARCHAR(200) NOT NULL DEFAULT ''"))
            if 'phone' not in columns:
                conn.execute(text("ALTER TABLE users ADD COLUMN phone VARCHAR(20) NOT NULL DEFAULT ''"))
            if 'email' not in columns:
                conn.execute(text("ALTER TABLE users ADD COLUMN email VARCHAR(255) NOT NULL DEFAULT ''"))
            if 'created_at' not in columns:
                conn.execute(text("ALTER TABLE users ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP"))
            # Ensure unique indexes if they don't exist
            try:
                conn.execute(text("CREATE UNIQUE INDEX idx_users_phone ON users(phone)"))
            except Exception:
                pass
            try:
                conn.execute(text("CREATE UNIQUE INDEX idx_users_email ON users(email)"))
            except Exception:
                pass
    print("Migration completed: users table updated.")

if __name__ == '__main__':
    migrate_users_table()
