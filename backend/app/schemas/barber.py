from pydantic import BaseModel

class BarberBase(BaseModel):
    name: str

class BarberResponse(BarberBase):
    id: int

    class Config:
        from_attributes = True
