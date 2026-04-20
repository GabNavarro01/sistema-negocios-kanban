from app.database.connection import SessionLocal, engine, Base
from app.models.user import User
from app.core.security import get_password_hash

# Ensure tables are created
Base.metadata.create_all(bind=engine)

def init_db():
    db = SessionLocal()
    user = db.query(User).filter(User.username == "admin").first()
    if not user:
        new_user = User(
            username="admin",
            hashed_password=get_password_hash("admin123"),
            is_active=True
        )
        db.add(new_user)
        db.commit()
        print("Admin user created (admin / admin123)")
    else:
        print("Admin user already exists")
    db.close()

if __name__ == "__main__":
    init_db()
