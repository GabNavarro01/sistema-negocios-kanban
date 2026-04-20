from sqlalchemy import Column, Integer, String, Time, Boolean
from app.database.connection import Base

class BarberSchedule(Base):
    __tablename__ = "barber_schedule"

    id = Column(Integer, primary_key=True, index=True)
    day_of_week = Column(Integer, unique=True) # 0=Monday, 6=Sunday
    is_active = Column(Boolean, default=True)
    start_time = Column(Time)
    end_time = Column(Time)
    break_start = Column(Time, nullable=True)
    break_end = Column(Time, nullable=True)
