from pydantic import BaseModel
from typing import Optional

class ServiceBase(BaseModel):
    name: str
    duration_minutes: int
    price: str
    enabled: bool = True

class ServiceCreate(ServiceBase):
    pass

class ServiceUpdate(BaseModel):
    name: Optional[str] = None
    duration_minutes: Optional[int] = None
    price: Optional[str] = None
    enabled: Optional[bool] = None

class ServiceResponse(ServiceBase):
    id: int

    class Config:
        from_attributes = True
