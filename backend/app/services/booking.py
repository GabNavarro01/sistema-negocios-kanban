from sqlalchemy.orm import Session
from datetime import date, datetime, timedelta, time
from typing import List

from app.models.schedule import BarberSchedule
from app.models.appointment import Appointment

def get_available_slots(db: Session, target_date: date, duration_minutes: int) -> List[str]:
    day_of_week = target_date.weekday()
    schedule = db.query(BarberSchedule).filter(BarberSchedule.day_of_week == day_of_week).first()
    
    if not schedule or not schedule.is_active:
        return [] # Not working on this day or inactive

    # Get all appointments for this day
    appointments = db.query(Appointment).filter(
        Appointment.date == target_date,
        Appointment.status.in_(["pending", "confirmed"])
    ).all()

    slots = []
    # Simplified slot generation (e.g. every 30 mins)
    # We should use duration_minutes, but let's assume standard slots for now
    current_time = datetime.combine(target_date, schedule.start_time)
    end_time = datetime.combine(target_date, schedule.end_time)
    
    break_start = datetime.combine(target_date, schedule.break_start) if schedule.break_start else None
    break_end = datetime.combine(target_date, schedule.break_end) if schedule.break_end else None

    while current_time + timedelta(minutes=duration_minutes) <= end_time:
        slot_end = current_time + timedelta(minutes=duration_minutes)
        
        # Check if in break
        if break_start and break_end and current_time >= break_start and slot_end <= break_end:
            current_time += timedelta(minutes=30)
            continue
            
        # Check if overlaps with appointments
        is_available = True
        for appt in appointments:
            appt_start = datetime.combine(target_date, appt.start_time)
            appt_end = datetime.combine(target_date, appt.end_time)
            if current_time < appt_end and slot_end > appt_start:
                is_available = False
                break
                
        if is_available:
            slots.append(current_time.strftime("%H:%M"))
            
        current_time += timedelta(minutes=30) # increment by 30 mins
        
    return slots
