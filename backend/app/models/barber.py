from sqlalchemy import Column, Integer, String
from app.database.connection import Base

class Barber(Base):
    __tablename__ = "barbers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
