from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List
import uuid
from datetime import datetime


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection with SSL fix
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
db_name = os.environ.get('DB_NAME', 'ai2_production')

# Add SSL options for MongoDB Atlas
if 'mongodb+srv://' in mongo_url:
    client = AsyncIOMotorClient(
        mongo_url,
        tls=True,
        tlsAllowInvalidCertificates=True,
        connectTimeoutMS=30000,
        socketTimeoutMS=30000,
        retryWrites=True
    )
else:
    client = AsyncIOMotorClient(mongo_url)

db = client[db_name]

# Create the main app
app = FastAPI(
    title="AI2 Backend API",
    description="Backend API for AI2 application",
    version="1.0.0"
)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

# Root endpoint (без префикса)
@app.get("/")
async def read_root():
    return {"message": "AI2 Backend is running", "status": "OK", "api_docs": "/docs"}

# Health check для Render (без префикса)
@app.get("/health")
async def render_health_check():
    try:
        await db.list_collection_names()
        return {"status": "healthy", "database": "connected", "service": "render-health-check"}
    except Exception as e:
        return {"status": "unhealthy", "database": "disconnected", "error": str(e)}

# API endpoints (с префиксом /api)
@api_router.get("/")
async def api_root():
    return {"message": "Hello World", "status": "API is running"}

@api_router.get("/health")
async def api_health_check():
    try:
        await db.list_collection_names()
        return {"status": "healthy", "database": "connected", "service": "api-health-check"}
    except Exception as e:
        return {"status": "unhealthy", "database": "disconnected", "error": str(e)}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

# Include the router
app.include_router(api_router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
