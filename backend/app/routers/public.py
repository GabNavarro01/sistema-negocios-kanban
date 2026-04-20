from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import date

from app.database.connection import get_db
from app.models.service import Service
from app.models.appointment import Appointment
from app.schemas.service import ServiceResponse
from app.schemas.appointment import AppointmentCreate, AppointmentResponse
from app.services.booking import get_available_slots
from app.models.schedule import BarberSchedule
from app.schemas.schedule import ScheduleResponse

router = APIRouter()

@router.get("/schedule", response_model=List[ScheduleResponse])
def get_public_schedule(db: Session = Depends(get_db)):
    return db.query(BarberSchedule).order_by(BarberSchedule.day_of_week).all()

@router.get("/services", response_model=List[ServiceResponse])
def get_services(db: Session = Depends(get_db)):
    return db.query(Service).filter(Service.enabled == True).all()

@router.get("/availability")
def check_availability(service_id: int, target_date: date, db: Session = Depends(get_db)):
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    slots = get_available_slots(db, target_date, service.duration_minutes)
    return {"date": target_date, "available_slots": slots}

from app.core.websocket import manager

@router.post("/appointments", response_model=AppointmentResponse)
async def create_appointment(appointment: AppointmentCreate, db: Session = Depends(get_db)):
    # Check if the slot is actually available
    slots = get_available_slots(db, appointment.date, 0)
    
    overlap = db.query(Appointment).filter(
        Appointment.date == appointment.date,
        Appointment.status.in_(["pending", "confirmed"]),
        Appointment.start_time < appointment.end_time,
        Appointment.end_time > appointment.start_time
    ).first()

    if overlap:
        raise HTTPException(status_code=400, detail="Time slot not available")

    db_appointment = Appointment(**appointment.dict())
    db.add(db_appointment)
    db.commit()
    db.refresh(db_appointment)
    
    # Notificar via WebSocket
    await manager.broadcast({
        "type": "NEW_APPOINTMENT",
        "appointment": {
            "id": db_appointment.id,
            "client_name": db_appointment.client_name,
            "status": db_appointment.status,
            "date": str(db_appointment.date)
        }
    })
    
    return db_appointment
