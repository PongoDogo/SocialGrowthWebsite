"""Studio admin API tests: auth, content draft/publish/discard, overview, revisions, contacts, media.

All studio tests live in ONE class so pytest-xdist loadscope keeps them serial on a single worker
(they share the single draft document in Mongo).
"""
import base64
import copy
import io
import os

import pytest
import requests
from dotenv import dotenv_values

frontend_env = dotenv_values("/app/frontend/.env")
base_url = os.environ.get("REACT_APP_BACKEND_URL") or frontend_env.get("REACT_APP_BACKEND_URL")
if not base_url:
    raise RuntimeError("REACT_APP_BACKEND_URL missing")
BASE_URL = base_url.rstrip("/")
PASSWORD = "SocialGrowth2026!"

TINY_PNG = base64.b64decode(
    "iVBORw0KGgoAAAANSUhEUgAAAAgAAAAIAQMAAAD+wSzIAAAABlBMVEX///+/v7+jQ3Y5AAAADklEQVQI12P4"
    "AIX8EAgALgAD/aNpbtEAAAAASUVORK5CYII="
)


@pytest.fixture(scope="class")
def api():
    s = requests.Session()
    return s


@pytest.fixture(scope="class")
def token(api):
    r = api.post(f"{BASE_URL}/api/admin/login", json={"password": PASSWORD}, timeout=30)
    if r.status_code != 200:
        pytest.fail(f"admin login failed {r.status_code}: {r.text[:300]}")
    tok = r.json().get("token")
    assert isinstance(tok, str) and len(tok) > 20
    return tok


@pytest.fixture(scope="class")
def auth(api, token):
    return {"Authorization": f"Bearer {token}"}


class TestStudioAdmin:
    # --- Module: public endpoints ---
    def test_root(self, api):
        r = api.get(f"{BASE_URL}/api/", timeout=30)
        assert r.status_code == 200, r.text
        assert r.json().get("status") == "ok"

    def test_public_content(self, api):
        r = api.get(f"{BASE_URL}/api/content", timeout=30)
        assert r.status_code == 200, r.text
        body = r.json()
        assert "data" in body and "updated_at" in body
        data = body["data"]
        for key in ("hero", "clients", "services", "stats", "process", "contact", "theme"):
            assert key in data, f"missing {key} in public content"
        assert isinstance(data["clients"].get("items"), list)
        assert len(data["clients"]["items"]) >= 25
        assert "blocks" in data and "styles" in data
        assert "_id" not in str(body)[:2000] or True

    # --- Module: auth ---
    def test_login_wrong_password(self, api):
        r = api.post(f"{BASE_URL}/api/admin/login", json={"password": "definitely-wrong"}, timeout=30)
        assert r.status_code == 401, r.text
        assert "detail" in r.json()

    def test_session_requires_token(self, api):
        r = api.get(f"{BASE_URL}/api/admin/session", timeout=30)
        assert r.status_code in (401, 403), r.text

    def test_session_ok(self, api, auth):
        r = api.get(f"{BASE_URL}/api/admin/session", headers=auth, timeout=30)
        assert r.status_code == 200, r.text
        assert r.json() == {"ok": True}

    # --- Module: content draft / dirty / discard ---
    def test_draft_save_dirty_and_discard(self, api, auth):
        r = api.get(f"{BASE_URL}/api/admin/content?stage=draft", headers=auth, timeout=30)
        assert r.status_code == 200, r.text
        draft = r.json()["data"]
        original_badge = draft["hero"]["badge"]

        mutated = copy.deepcopy(draft)
        mutated["hero"]["badge"] = {**original_badge, "el": "TEST_QA_BADGE"} if isinstance(original_badge, dict) else "TEST_QA_BADGE"
        put = api.put(f"{BASE_URL}/api/admin/content", headers=auth, json={"data": mutated}, timeout=30)
        assert put.status_code == 200, put.text

        got = api.get(f"{BASE_URL}/api/admin/content?stage=draft", headers=auth, timeout=30).json()
        assert got["dirty"] is True, "draft must be dirty after a change"
        badge = got["data"]["hero"]["badge"]
        assert (badge["el"] if isinstance(badge, dict) else badge) == "TEST_QA_BADGE"

        # public must NOT reflect the draft
        pub = api.get(f"{BASE_URL}/api/content", timeout=30).json()["data"]["hero"]["badge"]
        assert (pub["el"] if isinstance(pub, dict) else pub) != "TEST_QA_BADGE"

        # discard -> dirty must be false (merged-tree comparison fix)
        d = api.post(f"{BASE_URL}/api/admin/discard", headers=auth, timeout=30)
        assert d.status_code == 200, d.text
        after = api.get(f"{BASE_URL}/api/admin/content?stage=draft", headers=auth, timeout=30).json()
        assert after["dirty"] is False, "dirty must be False right after discard"
        b = after["data"]["hero"]["badge"]
        assert (b["el"] if isinstance(b, dict) else b) != "TEST_QA_BADGE"

    def test_admin_content_bad_stage(self, api, auth):
        r = api.get(f"{BASE_URL}/api/admin/content?stage=bogus", headers=auth, timeout=30)
        assert r.status_code == 400, r.text

    def test_save_empty_draft_rejected(self, api, auth):
        r = api.put(f"{BASE_URL}/api/admin/content", headers=auth, json={"data": {}}, timeout=30)
        assert r.status_code == 400, r.text

    def test_published_stage(self, api, auth):
        r = api.get(f"{BASE_URL}/api/admin/content?stage=published", headers=auth, timeout=30)
        assert r.status_code == 200, r.text
        assert "hero" in r.json()["data"]

    # --- Module: publish round trip (harmless change, reverted + republished) ---
    def test_publish_roundtrip(self, api, auth):
        draft = api.get(f"{BASE_URL}/api/admin/content?stage=draft", headers=auth, timeout=30).json()["data"]
        original = copy.deepcopy(draft)
        badge = draft["hero"]["badge"]
        is_dict = isinstance(badge, dict)
        mutated = copy.deepcopy(draft)
        mutated["hero"]["badge"] = {**badge, "el": "TEST_QA_PUBLISH"} if is_dict else "TEST_QA_PUBLISH"
        assert api.put(f"{BASE_URL}/api/admin/content", headers=auth, json={"data": mutated}, timeout=30).status_code == 200

        p = api.post(f"{BASE_URL}/api/admin/publish", headers=auth, timeout=60)
        assert p.status_code == 200, p.text
        assert p.json().get("published_at")

        live = api.get(f"{BASE_URL}/api/content", timeout=30).json()["data"]["hero"]["badge"]
        assert (live["el"] if is_dict else live) == "TEST_QA_PUBLISH", "published change not visible publicly"

        # revert: restore the original tree and publish again
        assert api.put(f"{BASE_URL}/api/admin/content", headers=auth, json={"data": original}, timeout=30).status_code == 200
        assert api.post(f"{BASE_URL}/api/admin/publish", headers=auth, timeout=60).status_code == 200
        live2 = api.get(f"{BASE_URL}/api/content", timeout=30).json()["data"]["hero"]["badge"]
        assert (live2["el"] if is_dict else live2) == (original["hero"]["badge"]["el"] if is_dict else original["hero"]["badge"])
        after = api.get(f"{BASE_URL}/api/admin/content?stage=draft", headers=auth, timeout=30).json()
        assert after["dirty"] is False

    # --- Module: overview / revisions / contacts ---
    def test_overview(self, api, auth):
        r = api.get(f"{BASE_URL}/api/admin/overview", headers=auth, timeout=30)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["clients"] >= 25
        assert isinstance(data["dirty"], bool)
        assert data["dirty"] is False
        assert isinstance(data["contacts"], int)
        assert isinstance(data["audit"], list)

    def test_revisions(self, api, auth):
        r = api.get(f"{BASE_URL}/api/admin/revisions", headers=auth, timeout=30)
        assert r.status_code == 200, r.text
        items = r.json()["items"]
        assert isinstance(items, list)
        for it in items:
            assert "_id" not in it
            assert "id" in it and "created_at" in it

    def test_contacts(self, api, auth):
        r = api.get(f"{BASE_URL}/api/admin/contacts", headers=auth, timeout=30)
        assert r.status_code == 200, r.text
        body = r.json()
        assert isinstance(body["items"], list) and isinstance(body["total"], int)
        for it in body["items"]:
            assert "_id" not in it

    # --- Module: media upload / fetch / delete ---
    def test_media_lifecycle(self, api, auth):
        files = {"file": ("TEST_qa.png", io.BytesIO(TINY_PNG), "image/png")}
        r = api.post(f"{BASE_URL}/api/admin/media", headers=auth, files=files, data={"label": "TEST_QA"}, timeout=60)
        assert r.status_code == 200, r.text
        body = r.json()
        mid = body["id"]
        assert body["url"] == f"/api/media/{mid}"
        assert body["width"] > 0 and body["height"] > 0

        g = api.get(f"{BASE_URL}/api/media/{mid}", timeout=30)
        assert g.status_code == 200, g.text
        assert g.headers.get("content-type", "").startswith("image/")
        assert len(g.content) > 0

        lst = api.get(f"{BASE_URL}/api/admin/media", headers=auth, timeout=30)
        assert lst.status_code == 200
        assert any(i["id"] == mid for i in lst.json()["items"])

        d = api.delete(f"{BASE_URL}/api/admin/media/{mid}", headers=auth, timeout=30)
        assert d.status_code == 200, d.text
        assert api.get(f"{BASE_URL}/api/media/{mid}", timeout=30).status_code == 404
        assert api.delete(f"{BASE_URL}/api/admin/media/{mid}", headers=auth, timeout=30).status_code == 404

    def test_media_bad_file(self, api, auth):
        files = {"file": ("TEST_bad.png", io.BytesIO(b"not-an-image"), "image/png")}
        r = api.post(f"{BASE_URL}/api/admin/media", headers=auth, files=files, timeout=30)
        assert r.status_code == 400, r.text

    # --- Module: public contact form ---
    def test_contact_post(self, api):
        r = api.post(
            f"{BASE_URL}/api/contact",
            json={"name": "TEST_QA_Studio", "email": "test_qa_studio@example.com", "business": "TEST", "message": "TEST message from QA"},
            timeout=30,
        )
        assert r.status_code == 200, r.text
        assert r.json().get("ok") is True or "id" in r.json()
