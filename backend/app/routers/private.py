from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database.connection import get_db
from app.models.user import User
from app.models.appointment import Appointment
from app.schemas.appointment import AppointmentResponse, AppointmentUpdate
from app.auth.dependencies import get_current_user

from app.models.schedule import BarberSchedule
from app.schemas.schedule import ScheduleResponse, ScheduleUpdate

router = APIRouter()

@router.get("/appointments", response_model=List[AppointmentResponse])
def get_appointments(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Appointment).all()

@router.patch("/appointments/{appointment_id}", response_model=AppointmentResponse)
def update_appointment(appointment_id: int, appointment_in: AppointmentUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    update_data = appointment_in.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(appointment, key, value)
        
    db.commit()
    db.refresh(appointment)
    return appointment

@router.get("/schedule", response_model=List[ScheduleResponse])
def get_schedule(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(BarberSchedule).order_by(BarberSchedule.day_of_week).all()

@router.put("/schedule/{day_of_week}", response_model=ScheduleResponse)
def update_schedule(day_of_week: int, schedule_in: ScheduleUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    schedule = db.query(BarberSchedule).filter(BarberSchedule.day_of_week == day_of_week).first()
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
    
    update_data = schedule_in.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(schedule, key, value)
        
    db.commit()
    db.refresh(schedule)
    return schedule
