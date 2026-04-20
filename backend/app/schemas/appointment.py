from pydantic import BaseModel
from typing import Optional
from datetime import date, time
from app.schemas.service import ServiceResponse

class AppointmentBase(BaseModel):
    client_name: str
    client_phone: str
    service_id: int
    date: date
    start_time: time
    end_time: time
    notes: Optional[str] = None

class AppointmentCreate(AppointmentBase):
    pass

class AppointmentUpdate(BaseModel):
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    date: Optional[date] = None
    status: Optional[str] = None
    notes: Optional[str] = None

class AppointmentResponse(AppointmentBase):
    id: int
    status: str
    service: Optional[ServiceResponse] = None

    class Config:
        from_attributes = True
