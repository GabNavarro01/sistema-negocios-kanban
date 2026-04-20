from sqlalchemy import Column, Integer, String, Boolean
from app.database.connection import Base

class Service(Base):
    __tablename__ = "services"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    duration_minutes = Column(Integer)
    price = Column(String) # String for formatting like "$15.00" or just integer
    enabled = Column(Boolean, default=True)
