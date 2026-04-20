from sqlalchemy import Column, Integer, String, ForeignKey, Date, Time, Text
from sqlalchemy.orm import relationship
from app.database.connection import Base

class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    client_name = Column(String)
    client_phone = Column(String, nullable=True)
    client_email = Column(String, nullable=True)
    service_id = Column(Integer, ForeignKey("services.id"))
    barber_id = Column(Integer, ForeignKey("barbers.id"), nullable=True)
    date = Column(Date, index=True)
    start_time = Column(Time)
    end_time = Column(Time)
    status = Column(String, default="pending") # pending, confirmed, completed, cancelled, rejected
    notes = Column(Text, nullable=True)

    service = relationship("Service")
    barber = relationship("Barber")
