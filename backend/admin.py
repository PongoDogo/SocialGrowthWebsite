"""SocialGrowth Studio — hidden admin API.

Security model
--------------
* The Studio lives on an unguessable front-end path, but the real protection is here:
  every /api/admin/* route requires a valid Bearer JWT.
* The password is never stored in plain text — only a bcrypt hash, kept in Mongo
  (seeded once from ADMIN_PASSWORD in backend/.env, changeable from the UI).
* Brute force protection: 5 failed logins from one IP -> 15 minute lockout.
* Every login attempt and every publish is written to an audit log.
"""

import base64
import io
import logging
import os
import time
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional

import bcrypt
import jwt
from fastapi import APIRouter, Depends, File, Form, HTTPException, Request, Response, UploadFile
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from PIL import Image, ImageDraw, ImageEnhance
from pydantic import BaseModel, Field

from db import db
from default_content import fresh_defaults

logger = logging.getLogger(__name__)

JWT_SECRET = os.environ.get("JWT_SECRET", "change-me-in-env")
JWT_ALG = "HS256"
SEED_PASSWORD = os.environ.get("ADMIN_PASSWORD", "")

MAX_UPLOAD_BYTES = 8 * 1024 * 1024
MAX_LOGIN_FAILS = 5
LOCKOUT_SECONDS = 15 * 60

_login_guard: Dict[str, Dict[str, float]] = {}

bearer = HTTPBearer(auto_error=False)

admin_router = APIRouter(prefix="/api/admin", tags=["studio"])
public_router = APIRouter(prefix="/api", tags=["public"])


# --------------------------------------------------------------------------------------
# helpers
# --------------------------------------------------------------------------------------
def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _client_ip(request: Request) -> str:
    fwd = request.headers.get("x-forwarded-for")
    if fwd:
        return fwd.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def deep_merge(base: Any, override: Any) -> Any:
    """Fill in keys that a stored document is missing (forward compatibility).

    Lists are taken verbatim from the override so the owner never gets defaults
    re-injected into a list they curated.
    """
    if isinstance(base, dict) and isinstance(override, dict):
        out = dict(base)
        for k, v in override.items():
            out[k] = deep_merge(base.get(k), v) if k in base else v
        return out
    return override if override is not None else base


async def _audit(action: str, request: Optional[Request] = None, detail: str = "") -> None:
    try:
        await db.studio_audit.insert_one(
            {
                "id": str(uuid.uuid4()),
                "action": action,
                "detail": detail,
                "ip": _client_ip(request) if request else "",
                "at": _now(),
            }
        )
    except Exception as exc:  # pragma: no cover
        logger.warning("audit failed: %s", exc)


async def _admin_doc() -> dict:
    doc = await db.studio_admin.find_one({"_id": "admin"})
    if not doc:
        pwd = SEED_PASSWORD or uuid.uuid4().hex
        doc = {
            "_id": "admin",
            "password_hash": bcrypt.hashpw(pwd.encode(), bcrypt.gensalt()).decode(),
            "created_at": _now(),
            "updated_at": _now(),
        }
        await db.studio_admin.insert_one(doc)
    return doc


async def get_stage(stage: str) -> dict:
    """Return the content tree for 'draft' or 'published', seeding on first use."""
    doc = await db.site_content.find_one({"_id": stage})
    if not doc:
        defaults = fresh_defaults()
        await db.site_content.update_one(
            {"_id": stage},
            {"$set": {"data": defaults, "updated_at": _now()}},
            upsert=True,
        )
        return defaults
    return deep_merge(fresh_defaults(), doc.get("data") or {})


async def set_stage(stage: str, data: dict) -> None:
    await db.site_content.update_one(
        {"_id": stage}, {"$set": {"data": data, "updated_at": _now()}}, upsert=True
    )


def make_token(hours: int = 24 * 7) -> str:
    payload = {
        "sub": "studio-admin",
        "iat": datetime.now(timezone.utc),
        "exp": datetime.now(timezone.utc) + timedelta(hours=hours),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)


async def require_admin(
    creds: Optional[HTTPAuthorizationCredentials] = Depends(bearer),
) -> str:
    if creds is None or not creds.credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(creds.credentials, JWT_SECRET, algorithms=[JWT_ALG])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Session expired")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    return payload.get("sub", "studio-admin")


# --------------------------------------------------------------------------------------
# auth
# --------------------------------------------------------------------------------------
class LoginBody(BaseModel):
    password: str = Field(min_length=1, max_length=256)
    remember: bool = True


@admin_router.post("/login")
async def login(body: LoginBody, request: Request):
    ip = _client_ip(request)
    guard = _login_guard.get(ip)
    if guard and guard.get("until", 0) > time.time():
        wait = int(guard["until"] - time.time())
        await _audit("login.locked", request)
        raise HTTPException(
            status_code=429,
            detail=f"Too many attempts. Try again in {wait // 60 + 1} minute(s).",
        )

    doc = await _admin_doc()
    ok = False
    try:
        ok = bcrypt.checkpw(body.password.encode(), doc["password_hash"].encode())
    except Exception:
        ok = False

    if not ok:
        entry = _login_guard.setdefault(ip, {"fails": 0, "until": 0})
        entry["fails"] = entry.get("fails", 0) + 1
        if entry["fails"] >= MAX_LOGIN_FAILS:
            entry["until"] = time.time() + LOCKOUT_SECONDS
            entry["fails"] = 0
        await _audit("login.fail", request)
        raise HTTPException(status_code=401, detail="Wrong password")

    _login_guard.pop(ip, None)
    await _audit("login.ok", request)
    return {"token": make_token(24 * 7 if body.remember else 12), "expires_in_hours": 24 * 7 if body.remember else 12}


@admin_router.get("/session")
async def session(_: str = Depends(require_admin)):
    return {"ok": True}


class PasswordBody(BaseModel):
    current: str = Field(min_length=1, max_length=256)
    next: str = Field(min_length=8, max_length=256)


@admin_router.post("/password")
async def change_password(body: PasswordBody, request: Request, _: str = Depends(require_admin)):
    doc = await _admin_doc()
    if not bcrypt.checkpw(body.current.encode(), doc["password_hash"].encode()):
        raise HTTPException(status_code=400, detail="Current password is wrong")
    await db.studio_admin.update_one(
        {"_id": "admin"},
        {"$set": {"password_hash": bcrypt.hashpw(body.next.encode(), bcrypt.gensalt()).decode(), "updated_at": _now()}},
    )
    await _audit("password.change", request)
    return {"ok": True}


# --------------------------------------------------------------------------------------
# content
# --------------------------------------------------------------------------------------
class ContentBody(BaseModel):
    data: Dict[str, Any]


@public_router.get("/content")
async def public_content():
    data = await get_stage("published")
    doc = await db.site_content.find_one({"_id": "published"})
    return {"data": data, "updated_at": (doc or {}).get("updated_at", _now())}


@admin_router.get("/content")
async def admin_content(stage: str = "draft", _: str = Depends(require_admin)):
    if stage not in ("draft", "published"):
        raise HTTPException(status_code=400, detail="stage must be draft or published")
    published = await get_stage("published")
    draft = await get_stage("draft")
    data = draft if stage == "draft" else published
    doc = await db.site_content.find_one({"_id": stage})
    pub = await db.site_content.find_one({"_id": "published"})
    return {
        "data": data,
        "updated_at": (doc or {}).get("updated_at"),
        "published_at": (pub or {}).get("published_at"),
        "dirty": draft != published,
    }


@admin_router.put("/content")
async def save_draft(body: ContentBody, _: str = Depends(require_admin)):
    if not isinstance(body.data, dict) or not body.data:
        raise HTTPException(status_code=400, detail="Empty content")
    await set_stage("draft", body.data)
    return {"ok": True, "updated_at": _now()}


@admin_router.post("/publish")
async def publish(request: Request, _: str = Depends(require_admin)):
    draft = await get_stage("draft")
    current = await db.site_content.find_one({"_id": "published"})
    if current and current.get("data"):
        await db.site_revisions.insert_one(
            {
                "id": str(uuid.uuid4()),
                "data": current["data"],
                "created_at": _now(),
                "note": "auto backup before publish",
            }
        )
        # keep the last 30 revisions only
        olds = (
            await db.site_revisions.find({}, {"id": 1})
            .sort("created_at", -1)
            .skip(30)
            .to_list(length=200)
        )
        if olds:
            await db.site_revisions.delete_many({"id": {"$in": [o["id"] for o in olds]}})

    stamp = _now()
    await db.site_content.update_one(
        {"_id": "published"},
        {"$set": {"data": draft, "updated_at": stamp, "published_at": stamp}},
        upsert=True,
    )
    await _audit("publish", request)
    return {"ok": True, "published_at": stamp}


@admin_router.post("/discard")
async def discard(_: str = Depends(require_admin)):
    published = await get_stage("published")
    await set_stage("draft", published)
    return {"ok": True}


@admin_router.post("/reset")
async def reset_defaults(request: Request, _: str = Depends(require_admin)):
    await set_stage("draft", fresh_defaults())
    await _audit("reset.defaults", request)
    return {"ok": True}


@admin_router.get("/revisions")
async def revisions(_: str = Depends(require_admin)):
    items = await db.site_revisions.find({}, {"_id": 0, "data": 0}).sort("created_at", -1).to_list(length=30)
    return {"items": items}


@admin_router.post("/revisions/{rid}/restore")
async def restore_revision(rid: str, request: Request, _: str = Depends(require_admin)):
    rev = await db.site_revisions.find_one({"id": rid})
    if not rev:
        raise HTTPException(status_code=404, detail="Revision not found")
    await set_stage("draft", rev["data"])
    await _audit("revision.restore", request, rid)
    return {"ok": True}


# --------------------------------------------------------------------------------------
# media
# --------------------------------------------------------------------------------------
def _luma_mask(img: Image.Image, keep_dark: bool, tol: int) -> Image.Image:
    """Mask (255 = keep) that drops near-white (keep_dark=True) or near-black pixels."""
    gray = img.convert("L")
    if keep_dark:
        return gray.point(lambda p: 0 if p >= 255 - tol else 255)
    return gray.point(lambda p: 0 if p <= tol else 255)


def _rounded_mask(size, radius_pct: int) -> Image.Image:
    w, h = size
    r = int(min(w, h) * max(0, min(50, radius_pct)) / 100)
    mask = Image.new("L", size, 0)
    d = ImageDraw.Draw(mask)
    d.rounded_rectangle([0, 0, w - 1, h - 1], radius=r, fill=255)
    return mask


def process_image(
    raw: bytes,
    remove_bg: str = "none",
    tolerance: int = 28,
    trim: bool = False,
    brightness: float = 1.0,
    contrast: float = 1.0,
    saturation: float = 1.0,
    shape: str = "none",
    radius_pct: int = 22,
    max_dim: int = 640,
    pad_pct: int = 0,
) -> tuple:
    img = Image.open(io.BytesIO(raw))
    img = img.convert("RGBA")

    if remove_bg == "auto":
        w, h = img.size
        corners = [img.getpixel((0, 0)), img.getpixel((w - 1, 0)), img.getpixel((0, h - 1)), img.getpixel((w - 1, h - 1))]
        lum = sum(0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2] for c in corners) / 4
        remove_bg = "white" if lum > 205 else ("black" if lum < 52 else "none")

    if remove_bg in ("white", "black"):
        mask = _luma_mask(img, keep_dark=(remove_bg == "white"), tol=tolerance)
        alpha = img.getchannel("A")
        from PIL import ImageChops

        img.putalpha(ImageChops.darker(alpha, mask))

    if brightness != 1.0:
        img = ImageEnhance.Brightness(img).enhance(brightness)
    if contrast != 1.0:
        img = ImageEnhance.Contrast(img).enhance(contrast)
    if saturation != 1.0:
        img = ImageEnhance.Color(img).enhance(saturation)

    if trim:
        bbox = img.getchannel("A").getbbox()
        if bbox:
            img = img.crop(bbox)

    if shape in ("circle", "rounded"):
        side = max(img.size)
        square = Image.new("RGBA", (side, side), (0, 0, 0, 0))
        square.paste(img, ((side - img.size[0]) // 2, (side - img.size[1]) // 2), img)
        img = square
        mask = (
            _rounded_mask(img.size, 50) if shape == "circle" else _rounded_mask(img.size, radius_pct)
        )
        from PIL import ImageChops

        img.putalpha(ImageChops.darker(img.getchannel("A"), mask))

    if pad_pct > 0:
        pad = int(max(img.size) * min(40, pad_pct) / 100)
        padded = Image.new("RGBA", (img.size[0] + pad * 2, img.size[1] + pad * 2), (0, 0, 0, 0))
        padded.paste(img, (pad, pad), img)
        img = padded

    max_dim = max(64, min(1024, max_dim))
    if max(img.size) > max_dim:
        img.thumbnail((max_dim, max_dim), Image.LANCZOS)

    buf = io.BytesIO()
    img.save(buf, format="PNG", optimize=True)
    return buf.getvalue(), img.size


@admin_router.post("/media")
async def upload_media(
    file: UploadFile = File(...),
    remove_bg: str = Form("none"),
    tolerance: int = Form(28),
    trim: bool = Form(False),
    brightness: float = Form(1.0),
    contrast: float = Form(1.0),
    saturation: float = Form(1.0),
    shape: str = Form("none"),
    radius_pct: int = Form(22),
    max_dim: int = Form(640),
    pad_pct: int = Form(0),
    label: str = Form(""),
    _: str = Depends(require_admin),
):
    raw = await file.read()
    if not raw:
        raise HTTPException(status_code=400, detail="Empty file")
    if len(raw) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="File too large (max 8MB)")

    try:
        out, size = process_image(
            raw,
            remove_bg=remove_bg,
            tolerance=tolerance,
            trim=trim,
            brightness=brightness,
            contrast=contrast,
            saturation=saturation,
            shape=shape,
            radius_pct=radius_pct,
            max_dim=max_dim,
            pad_pct=pad_pct,
        )
    except Exception as exc:
        logger.error("image processing failed: %s", exc)
        raise HTTPException(status_code=400, detail="Could not read that image file")

    mid = str(uuid.uuid4())
    await db.media.insert_one(
        {
            "id": mid,
            "label": label or (file.filename or "upload"),
            "filename": file.filename or "upload.png",
            "content_type": "image/png",
            "data": base64.b64encode(out).decode(),
            "size": len(out),
            "width": size[0],
            "height": size[1],
            "created_at": _now(),
        }
    )
    return {"id": mid, "url": f"/api/media/{mid}", "width": size[0], "height": size[1], "size": len(out)}


@public_router.get("/media/{mid}")
async def get_media(mid: str):
    doc = await db.media.find_one({"id": mid})
    if not doc:
        raise HTTPException(status_code=404, detail="Not found")
    return Response(
        content=base64.b64decode(doc["data"]),
        media_type=doc.get("content_type", "image/png"),
        headers={"Cache-Control": "public, max-age=31536000, immutable"},
    )


@admin_router.get("/media")
async def list_media(_: str = Depends(require_admin)):
    items = (
        await db.media.find({}, {"_id": 0, "data": 0}).sort("created_at", -1).to_list(length=300)
    )
    for it in items:
        it["url"] = f"/api/media/{it['id']}"
    return {"items": items}


@admin_router.delete("/media/{mid}")
async def delete_media(mid: str, _: str = Depends(require_admin)):
    res = await db.media.delete_one({"id": mid})
    if not res.deleted_count:
        raise HTTPException(status_code=404, detail="Not found")
    return {"ok": True}


# --------------------------------------------------------------------------------------
# inbox + overview
# --------------------------------------------------------------------------------------
@admin_router.get("/contacts")
async def list_contacts(limit: int = 200, _: str = Depends(require_admin)):
    items = (
        await db.contacts.find({}, {"_id": 0})
        .sort("created_at", -1)
        .to_list(length=max(1, min(500, limit)))
    )
    return {"items": items, "total": await db.contacts.count_documents({})}


@admin_router.delete("/contacts/{cid}")
async def delete_contact(cid: str, _: str = Depends(require_admin)):
    res = await db.contacts.delete_one({"id": cid})
    if not res.deleted_count:
        raise HTTPException(status_code=404, detail="Not found")
    return {"ok": True}


@admin_router.get("/overview")
async def overview(_: str = Depends(require_admin)):
    published = await get_stage("published")
    draft_data = await get_stage("draft")
    pub = await db.site_content.find_one({"_id": "published"})
    draft = await db.site_content.find_one({"_id": "draft"})
    data = published
    audit = await db.studio_audit.find({}, {"_id": 0}).sort("at", -1).to_list(length=12)
    return {
        "contacts": await db.contacts.count_documents({}),
        "media": await db.media.count_documents({}),
        "clients": len((data.get("clients") or {}).get("items") or []),
        "revisions": await db.site_revisions.count_documents({}),
        "published_at": (pub or {}).get("published_at"),
        "draft_updated_at": (draft or {}).get("updated_at"),
        "dirty": draft_data != published,
        "audit": audit,
    }
