from app.database.connection import SessionLocal
from app.models.service import Service
from app.models.schedule import BarberSchedule
from datetime import time

def seed_data():
    db = SessionLocal()
    
    # Check if services exist
    if db.query(Service).count() == 0:
        s1 = Service(name="Corte", duration_minutes=30, price="$15")
        s2 = Service(name="Corte + Tintura", duration_minutes=45, price="$18")
        s3 = Service(name="Corte + Barba", duration_minutes=60, price="$25")
        db.add_all([s1, s2, s3])
        
    # Check if schedule exists
    if db.query(BarberSchedule).count() == 0:
        # Lunes a Sabado (0-5)
        for i in range(6):
            sched = BarberSchedule(
                day_of_week=i,
                start_time=time(9, 0), # 9 AM
                end_time=time(19, 0), # 7 PM
                break_start=time(13, 0), # 1 PM
                break_end=time(14, 0) # 2 PM
            )
            db.add(sched)
            
    db.commit()
    db.close()
    print("Seed data inserted.")

if __name__ == "__main__":
    seed_data()
