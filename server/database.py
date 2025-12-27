from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = "mysql+pymysql://root@localhost/example_db"
# If MySQL has password:
# DATABASE_URL = "mysql+pymysql://root:password@localhost/example_db"

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


def init_db():
    """Create database tables from models if they don't exist."""
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        # If the database itself is missing or inaccessible, print a warning so
        # the app can still start and the developer can see the issue.
        print(f"Warning: could not initialize database schema: {e}")

