from app.database.connection import engine
from sqlalchemy import text

def update_schema():
    with engine.connect() as conn:
        try:
            conn.execute(text("CREATE TABLE IF NOT EXISTS barbers (id INTEGER PRIMARY KEY, name TEXT)"))
            print("Table barbers ensured.")
        except Exception as e:
            print(f"Error creating barbers: {e}")

        try:
            conn.execute(text("ALTER TABLE barber_schedule ADD COLUMN is_active BOOLEAN DEFAULT 1"))
            print("Column is_active added to barber_schedule.")
        except Exception as e:
            if "duplicate column name" in str(e).lower() or "already exists" in str(e).lower():
                print("Column is_active already exists.")
            else:
                print(f"Error adding column is_active: {e}")
        
        conn.commit()

if __name__ == "__main__":
    update_schema()
