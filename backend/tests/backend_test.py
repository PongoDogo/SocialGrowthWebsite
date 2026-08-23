"""Backend API tests for SocialGrowth (root, contact create/list, validation)."""
import os
import uuid

import pytest
import requests
from dotenv import dotenv_values

frontend_env = dotenv_values("/app/frontend/.env")
base_url = os.environ.get("REACT_APP_BACKEND_URL") or frontend_env.get("REACT_APP_BACKEND_URL")
if not base_url:
    raise RuntimeError("REACT_APP_BACKEND_URL missing")
BASE_URL = base_url.rstrip("/")


@pytest.fixture(scope="module")
def api():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# --- Module: root health ---
class TestRoot:
    def test_root(self, api):
        r = api.get(f"{BASE_URL}/api/", timeout=30)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data == {"message": "SocialGrowth API", "status": "ok"}


# --- Module: contact create + persistence ---
class TestContactCreate:
    def test_create_and_persist(self, api):
        marker = uuid.uuid4().hex[:8]
        payload = {
            "name": f"TEST_User_{marker}",
            "email": f"test_{marker}@example.com",
            "business": "TEST_Business",
            "message": "TEST_message body",
        }
        r = api.post(f"{BASE_URL}/api/contact", json=payload, timeout=60)
        assert r.status_code == 200, r.text
        d = r.json()
        assert isinstance(d.get("id"), str) and len(d["id"]) > 0
        assert d["name"] == payload["name"]
        assert d["email"] == payload["email"]
        assert d["business"] == payload["business"]
        assert d["message"] == payload["message"]
        assert isinstance(d["created_at"], str)
        assert isinstance(d["email_delivered"], bool)
        assert "_id" not in d

        # verify persisted via count endpoint (PII listing endpoint removed by design)
        cr = api.get(f"{BASE_URL}/api/contact/count", timeout=30)
        assert cr.status_code == 200, cr.text
        assert isinstance(cr.json()["count"], int) and cr.json()["count"] >= 1

    def test_optional_business_defaults_empty(self, api):
        marker = uuid.uuid4().hex[:8]
        r = api.post(
            f"{BASE_URL}/api/contact",
            json={"name": f"TEST_NoBiz_{marker}", "email": f"nb_{marker}@example.com", "message": "TEST hi"},
            timeout=60,
        )
        assert r.status_code == 200, r.text
        assert r.json()["business"] == ""


# --- Module: contact validation ---
class TestContactValidation:
    @pytest.mark.parametrize(
        "payload",
        [
            {"name": "TEST", "email": "not-an-email", "message": "hi"},
            {"email": "a@b.com", "message": "hi"},
            {"name": "TEST", "message": "hi"},
            {"name": "TEST", "email": "a@b.com"},
            {"name": "", "email": "a@b.com", "message": "hi"},
            {"name": "TEST", "email": "a@b.com", "message": ""},
        ],
    )
    def test_invalid_returns_422(self, api, payload):
        r = api.post(f"{BASE_URL}/api/contact", json=payload, timeout=30)
        assert r.status_code == 422, f"{payload} -> {r.status_code} {r.text[:200]}"


# --- Module: contact count + no public PII listing ---
class TestContactCount:
    def test_count_increments_and_no_pii_listing(self, api):
        before = api.get(f"{BASE_URL}/api/contact/count", timeout=30)
        assert before.status_code == 200, before.text
        b = before.json()["count"]
        assert isinstance(b, int)

        marker = uuid.uuid4().hex[:8]
        cr = api.post(
            f"{BASE_URL}/api/contact",
            json={"name": f"TEST_Count_{marker}", "email": f"c_{marker}@example.com", "message": "TEST count"},
            timeout=60,
        )
        assert cr.status_code == 200, cr.text

        after = api.get(f"{BASE_URL}/api/contact/count", timeout=30)
        assert after.status_code == 200
        # >= b + 1 because pytest-xdist runs other insert tests concurrently
        assert after.json()["count"] >= b + 1

        # public listing of submissions must not be exposed
        lr = api.get(f"{BASE_URL}/api/contact", timeout=30)
        assert lr.status_code in (404, 405), f"PII listing exposed: {lr.status_code}"
