from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.database.connection import engine, Base
from app.routers import auth, public, private
from app.core.websocket import manager

# Crear tablas en la base de datos (SQLite local)
Base.metadata.create_all(bind=engine)

from app.database.connection import SessionLocal
from app.models.schedule import BarberSchedule
import datetime

def seed_schedule():
    db = SessionLocal()
    try:
        if db.query(BarberSchedule).count() == 0:
            for i in range(7):
                db.add(BarberSchedule(
                    day_of_week=i,
                    is_active=True,
                    start_time=datetime.time(9, 0),
                    end_time=datetime.time(20, 0)
                ))
            db.commit()
    finally:
        db.close()

seed_schedule()

from fastapi.responses import JSONResponse
import json

class NoASCIIJSONResponse(JSONResponse):
    def render(self, content: any) -> bytes:
        return json.dumps(
            content,
            ensure_ascii=False,
            allow_nan=False,
            indent=None,
            separators=(",", ":"),
        ).encode("utf-8")

app = FastAPI(title=settings.PROJECT_NAME, default_response_class=NoASCIIJSONResponse)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Update for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(public.router, prefix="/api", tags=["public"])
app.include_router(private.router, prefix="/api/barber", tags=["private"])

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Mantener conexión viva
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.get("/")
def read_root():
    return {"message": "Welcome to Melion Barber API"}
