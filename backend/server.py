from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
import uuid
import httpx
from pathlib import Path
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from db import client, db  # noqa: E402  (loads MONGO_URL / DB_NAME from the same .env)
from admin import admin_router, public_router, get_stage  # noqa: E402

CONTACT_EMAIL = os.environ['CONTACT_EMAIL']


async def recipient_email() -> str:
    """The owner can change the recipient from the Studio; fall back to .env."""
    try:
        data = await get_stage("published")
        return (data.get("brand") or {}).get("email") or CONTACT_EMAIL
    except Exception:
        return CONTACT_EMAIL

app = FastAPI(title="SocialGrowth API")
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


class ContactCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    business: str = Field(default="", max_length=160)
    message: str = Field(min_length=1, max_length=4000)


class Contact(ContactCreate):
    id: str
    created_at: str
    email_delivered: bool = False


async def deliver_email(payload: ContactCreate) -> bool:
    to = await recipient_email()
    body = {
        "name": payload.name,
        "email": payload.email,
        "_subject": f"SocialGrowth — New enquiry from {payload.name}",
        "_template": "table",
        "_captcha": "false",
        "business": payload.business or "-",
        "message": payload.message,
    }
    try:
        async with httpx.AsyncClient(timeout=20) as http:
            r = await http.post(f"https://formsubmit.co/ajax/{to}", json=body)
        return r.status_code == 200
    except Exception as exc:
        logger.error("Email delivery failed: %s", exc)
        return False


@api_router.get("/")
async def root():
    return {"message": "SocialGrowth API", "status": "ok"}


@api_router.post("/contact", response_model=Contact)
async def create_contact(payload: ContactCreate):
    doc = {
        "id": str(uuid.uuid4()),
        "name": payload.name,
        "email": payload.email,
        "business": payload.business,
        "message": payload.message,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "email_delivered": False,
    }
    await db.contacts.insert_one(dict(doc))
    delivered = await deliver_email(payload)
    if delivered:
        await db.contacts.update_one({"id": doc["id"]}, {"$set": {"email_delivered": True}})
        doc["email_delivered"] = True
    return Contact(**doc)


@api_router.get("/contact/count")
async def contact_count():
    return {"count": await db.contacts.count_documents({})}


app.include_router(api_router)
app.include_router(admin_router)
app.include_router(public_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
