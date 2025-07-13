from pydantic import BaseModel, Field, EmailStr
from typing import Optional, Dict
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'test_database')

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]
users_collection = db.users

# Pydantic models for user management
class UserApiKeys(BaseModel):
    gemini_api_key: Optional[str] = None
    openai_api_key: Optional[str] = None
    anthropic_api_key: Optional[str] = None
    openrouter_api_key: Optional[str] = None

class UserRegistration(BaseModel):
    email: EmailStr
    password: str
    name: str
    api_keys: Optional[UserApiKeys] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserProfile(BaseModel):
    id: str
    email: str
    name: str
    created_at: datetime
    last_login: Optional[datetime] = None
    is_active: bool = True

class UserInDB(BaseModel):
    id: str
    email: str
    name: str
    password_hash: str
    api_keys: Dict[str, str] = {}  # Encrypted API keys
    created_at: datetime
    last_login: Optional[datetime] = None
    is_active: bool = True

class ApiKeyUpdate(BaseModel):
    api_keys: UserApiKeys

class GoogleOAuthUser(BaseModel):
    email: EmailStr
    name: str
    google_id: str
    picture: Optional[str] = None
    gemini_api_key: Optional[str] = None