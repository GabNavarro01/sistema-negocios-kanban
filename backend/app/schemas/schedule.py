from pydantic import BaseModel
from datetime import time
from typing import Optional

class ScheduleBase(BaseModel):
    day_of_week: int
    is_active: bool
    start_time: time
    end_time: time
    break_start: Optional[time] = None
    break_end: Optional[time] = None

class ScheduleResponse(ScheduleBase):
    id: int

    class Config:
        from_attributes = True

class ScheduleUpdate(BaseModel):
    is_active: Optional[bool] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    break_start: Optional[time] = None
    break_end: Optional[time] = None
