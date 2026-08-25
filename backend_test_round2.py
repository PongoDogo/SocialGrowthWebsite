#!/usr/bin/env python3
"""
SocialGrowth Studio (Round 2) - Comprehensive Backend API Test Suite
Tests admin auth, content management, draft/publish workflow, media pipeline, and contact regression.
"""

import requests
import json
import sys
import time
from pathlib import Path

# Backend URL from frontend/.env
BACKEND_URL = "https://cautious-update.preview.emergentagent.com"
API_BASE = f"{BACKEND_URL}/api"
ADMIN_BASE = f"{API_BASE}/admin"

# Studio password from test_credentials.md
STUDIO_PASSWORD = "mU7P0TEwNI4ozC7L"

# Test results tracking
results = {
    "passed": [],
    "failed": [],
    "warnings": []
}

# Global token storage
auth_token = None
test_media_id = None
test_revision_id = None
original_hero_title = None


def log_pass(test_name, details=""):
    results["passed"].append(f"✅ {test_name}: {details}")
    print(f"✅ PASS: {test_name}")
    if details:
        print(f"   {details}")


def log_fail(test_name, details=""):
    results["failed"].append(f"❌ {test_name}: {details}")
    print(f"❌ FAIL: {test_name}")
    if details:
        print(f"   {details}")


def log_warning(test_name, details=""):
    results["warnings"].append(f"⚠️  {test_name}: {details}")
    print(f"⚠️  WARNING: {test_name}")
    if details:
        print(f"   {details}")


def auth_headers():
    """Return Authorization header with Bearer token"""
    if not auth_token:
        return {}
    return {"Authorization": f"Bearer {auth_token}"}


# ============================================================================
# A. AUTH TESTS
# ============================================================================

def test_login_success():
    """A1: POST /api/admin/login with correct password"""
    global auth_token
    print("\n" + "="*80)
    print("TEST A1: POST /api/admin/login - Successful Login")
    print("="*80)
    
    payload = {"password": STUDIO_PASSWORD}
    
    try:
        response = requests.post(f"{ADMIN_BASE}/login", json=payload, timeout=10)
        
        if response.status_code != 200:
            log_fail("Admin login", f"Expected 200, got {response.status_code}. Response: {response.text}")
            return False
        
        data = response.json()
        
        if "token" not in data:
            log_fail("Admin login", f"Missing 'token' in response: {data}")
            return False
        
        auth_token = data["token"]
        log_pass("Admin login", f"Login successful, token received (length: {len(auth_token)})")
        return True
        
    except Exception as e:
        log_fail("Admin login", f"Exception: {str(e)}")
        return False


def test_session_with_token():
    """A2: GET /api/admin/session with valid Bearer token"""
    print("\n" + "="*80)
    print("TEST A2: GET /api/admin/session - With Valid Token")
    print("="*80)
    
    try:
        response = requests.get(f"{ADMIN_BASE}/session", headers=auth_headers(), timeout=10)
        
        if response.status_code != 200:
            log_fail("Session check with token", f"Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        
        if data.get("ok") is True:
            log_pass("Session check with token", "Session valid")
            return True
        else:
            log_fail("Session check with token", f"Unexpected response: {data}")
            return False
            
    except Exception as e:
        log_fail("Session check with token", f"Exception: {str(e)}")
        return False


def test_session_without_token():
    """A3: GET /api/admin/session without token -> 401"""
    print("\n" + "="*80)
    print("TEST A3: GET /api/admin/session - Without Token (401)")
    print("="*80)
    
    try:
        response = requests.get(f"{ADMIN_BASE}/session", timeout=10)
        
        if response.status_code == 401:
            log_pass("Session check without token", "Correctly returned 401")
            return True
        else:
            log_fail("Session check without token", f"Expected 401, got {response.status_code}")
            return False
            
    except Exception as e:
        log_fail("Session check without token", f"Exception: {str(e)}")
        return False


def test_session_with_garbage_token():
    """A4: GET /api/admin/session with garbage token -> 401"""
    print("\n" + "="*80)
    print("TEST A4: GET /api/admin/session - With Garbage Token (401)")
    print("="*80)
    
    try:
        headers = {"Authorization": "Bearer garbage_token_12345"}
        response = requests.get(f"{ADMIN_BASE}/session", headers=headers, timeout=10)
        
        if response.status_code == 401:
            log_pass("Session check with garbage token", "Correctly returned 401")
            return True
        else:
            log_fail("Session check with garbage token", f"Expected 401, got {response.status_code}")
            return False
            
    except Exception as e:
        log_fail("Session check with garbage token", f"Exception: {str(e)}")
        return False


def test_login_wrong_password():
    """A5: POST /api/admin/login with wrong password -> 401 (ONLY ONE ATTEMPT)"""
    print("\n" + "="*80)
    print("TEST A5: POST /api/admin/login - Wrong Password (401) - ONE ATTEMPT ONLY")
    print("="*80)
    
    payload = {"password": "wrong_password_123"}
    
    try:
        response = requests.post(f"{ADMIN_BASE}/login", json=payload, timeout=10)
        
        if response.status_code == 401:
            log_pass("Admin login with wrong password", "Correctly returned 401")
            return True
        else:
            log_fail("Admin login with wrong password", f"Expected 401, got {response.status_code}")
            return False
            
    except Exception as e:
        log_fail("Admin login with wrong password", f"Exception: {str(e)}")
        return False


# ============================================================================
# B. PUBLIC CONTENT TESTS
# ============================================================================

def test_public_content():
    """B1: GET /api/content (no auth required)"""
    global original_hero_title
    print("\n" + "="*80)
    print("TEST B1: GET /api/content - Public Content API")
    print("="*80)
    
    try:
        response = requests.get(f"{API_BASE}/content", timeout=10)
        
        if response.status_code != 200:
            log_fail("Public content API", f"Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        
        # Verify structure
        errors = []
        
        if "data" not in data:
            errors.append("Missing 'data' field")
        else:
            content = data["data"]
            
            # Check required sections
            required_sections = ["hero", "clients", "stats", "services", "process"]
            for section in required_sections:
                if section not in content:
                    errors.append(f"Missing '{section}' section")
            
            # Check hero has bilingual titleA
            if "hero" in content:
                hero = content["hero"]
                if "titleA" in hero:
                    title_a = hero["titleA"]
                    if isinstance(title_a, dict):
                        if "el" not in title_a or "en" not in title_a:
                            errors.append("hero.titleA missing 'el' or 'en' keys")
                        else:
                            # Store original Greek title for final verification
                            original_hero_title = title_a.get("el")
                            log_pass("Original hero title captured", f"Greek: '{original_hero_title}'")
                    else:
                        errors.append("hero.titleA is not a bilingual object")
            
            # Check clients has 25 items
            if "clients" in content and "items" in content["clients"]:
                client_count = len(content["clients"]["items"])
                if client_count != 25:
                    errors.append(f"Expected 25 clients, got {client_count}")
            else:
                errors.append("Missing clients.items")
            
            # Check stats has 4 items
            if "stats" in content and "items" in content["stats"]:
                stats_count = len(content["stats"]["items"])
                if stats_count != 4:
                    errors.append(f"Expected 4 stats, got {stats_count}")
            else:
                errors.append("Missing stats.items")
            
            # Check services has 6 items
            if "services" in content and "items" in content["services"]:
                services_count = len(content["services"]["items"])
                if services_count != 6:
                    errors.append(f"Expected 6 services, got {services_count}")
            else:
                errors.append("Missing services.items")
            
            # Check process has 4 items
            if "process" in content and "items" in content["process"]:
                process_count = len(content["process"]["items"])
                if process_count != 4:
                    errors.append(f"Expected 4 process steps, got {process_count}")
            else:
                errors.append("Missing process.items")
        
        if "updated_at" not in data:
            errors.append("Missing 'updated_at' field")
        
        if errors:
            log_fail("Public content API structure", "; ".join(errors))
            return False
        
        log_pass("Public content API", "Structure valid: hero, clients (25), stats (4), services (6), process (4), bilingual")
        return True
        
    except Exception as e:
        log_fail("Public content API", f"Exception: {str(e)}")
        return False


# ============================================================================
# C. DRAFT/PUBLISH WORKFLOW TESTS
# ============================================================================

def test_get_draft_content():
    """C1: GET /api/admin/content?stage=draft"""
    print("\n" + "="*80)
    print("TEST C1: GET /api/admin/content?stage=draft")
    print("="*80)
    
    try:
        response = requests.get(f"{ADMIN_BASE}/content?stage=draft", headers=auth_headers(), timeout=10)
        
        if response.status_code != 200:
            log_fail("Get draft content", f"Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        
        if "data" not in data or "dirty" not in data:
            log_fail("Get draft content", f"Missing 'data' or 'dirty' field: {data.keys()}")
            return False
        
        log_pass("Get draft content", f"Draft retrieved, dirty={data['dirty']}")
        return data
        
    except Exception as e:
        log_fail("Get draft content", f"Exception: {str(e)}")
        return None


def test_edit_draft():
    """C2: PUT /api/admin/content - Edit draft hero title"""
    print("\n" + "="*80)
    print("TEST C2: PUT /api/admin/content - Edit Draft")
    print("="*80)
    
    # Get current draft
    draft_data = test_get_draft_content()
    if not draft_data:
        log_fail("Edit draft", "Could not retrieve draft")
        return False
    
    # Modify hero title
    modified_content = draft_data["data"]
    if "hero" not in modified_content or "titleA" not in modified_content["hero"]:
        log_fail("Edit draft", "Draft missing hero.titleA")
        return False
    
    modified_content["hero"]["titleA"]["el"] = "QA TEST TITLE"
    
    try:
        payload = {"data": modified_content}
        response = requests.put(f"{ADMIN_BASE}/content", json=payload, headers=auth_headers(), timeout=10)
        
        if response.status_code != 200:
            log_fail("Edit draft", f"Expected 200, got {response.status_code}. Response: {response.text}")
            return False
        
        log_pass("Edit draft", "Draft updated with 'QA TEST TITLE'")
        return True
        
    except Exception as e:
        log_fail("Edit draft", f"Exception: {str(e)}")
        return False


def test_draft_not_live():
    """C3: Verify GET /api/content still shows original title (draft not live)"""
    print("\n" + "="*80)
    print("TEST C3: Verify Draft Changes NOT Live on Public API")
    print("="*80)
    
    try:
        response = requests.get(f"{API_BASE}/content", timeout=10)
        
        if response.status_code != 200:
            log_fail("Draft not live check", f"Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        public_title = data.get("data", {}).get("hero", {}).get("titleA", {}).get("el", "")
        
        if public_title == "QA TEST TITLE":
            log_fail("Draft not live check", "Draft changes are LIVE (should not be!)")
            return False
        
        log_pass("Draft not live check", f"Public API still shows original title: '{public_title}'")
        return True
        
    except Exception as e:
        log_fail("Draft not live check", f"Exception: {str(e)}")
        return False


def test_draft_shows_changes():
    """C4: Verify GET /api/admin/content?stage=draft shows new title and dirty=true"""
    print("\n" + "="*80)
    print("TEST C4: Verify Draft Shows Changes and dirty=true")
    print("="*80)
    
    try:
        response = requests.get(f"{ADMIN_BASE}/content?stage=draft", headers=auth_headers(), timeout=10)
        
        if response.status_code != 200:
            log_fail("Draft shows changes", f"Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        draft_title = data.get("data", {}).get("hero", {}).get("titleA", {}).get("el", "")
        dirty = data.get("dirty", False)
        
        errors = []
        if draft_title != "QA TEST TITLE":
            errors.append(f"Draft title is '{draft_title}', expected 'QA TEST TITLE'")
        if not dirty:
            errors.append("dirty flag is False, expected True")
        
        if errors:
            log_fail("Draft shows changes", "; ".join(errors))
            return False
        
        log_pass("Draft shows changes", "Draft has 'QA TEST TITLE' and dirty=true")
        return True
        
    except Exception as e:
        log_fail("Draft shows changes", f"Exception: {str(e)}")
        return False


def test_publish():
    """C5: POST /api/admin/publish"""
    print("\n" + "="*80)
    print("TEST C5: POST /api/admin/publish")
    print("="*80)
    
    try:
        response = requests.post(f"{ADMIN_BASE}/publish", headers=auth_headers(), timeout=10)
        
        if response.status_code != 200:
            log_fail("Publish", f"Expected 200, got {response.status_code}. Response: {response.text}")
            return False
        
        data = response.json()
        
        if "ok" not in data or not data["ok"]:
            log_fail("Publish", f"Unexpected response: {data}")
            return False
        
        log_pass("Publish", "Draft published successfully")
        return True
        
    except Exception as e:
        log_fail("Publish", f"Exception: {str(e)}")
        return False


def test_published_content_live():
    """C6: Verify GET /api/content now shows 'QA TEST TITLE'"""
    print("\n" + "="*80)
    print("TEST C6: Verify Published Content is LIVE")
    print("="*80)
    
    try:
        response = requests.get(f"{API_BASE}/content", timeout=10)
        
        if response.status_code != 200:
            log_fail("Published content live", f"Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        public_title = data.get("data", {}).get("hero", {}).get("titleA", {}).get("el", "")
        
        if public_title != "QA TEST TITLE":
            log_fail("Published content live", f"Public title is '{public_title}', expected 'QA TEST TITLE'")
            return False
        
        log_pass("Published content live", "Public API now shows 'QA TEST TITLE'")
        return True
        
    except Exception as e:
        log_fail("Published content live", f"Exception: {str(e)}")
        return False


def test_get_revisions():
    """C7: GET /api/admin/revisions - Should have at least 1 revision"""
    global test_revision_id
    print("\n" + "="*80)
    print("TEST C7: GET /api/admin/revisions")
    print("="*80)
    
    try:
        response = requests.get(f"{ADMIN_BASE}/revisions", headers=auth_headers(), timeout=10)
        
        if response.status_code != 200:
            log_fail("Get revisions", f"Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        
        if "items" not in data:
            log_fail("Get revisions", f"Missing 'items' field: {data}")
            return False
        
        items = data["items"]
        
        if len(items) < 1:
            log_fail("Get revisions", "Expected at least 1 revision (auto backup from publish)")
            return False
        
        # Store the first revision ID for restore test
        test_revision_id = items[0].get("id")
        
        log_pass("Get revisions", f"Found {len(items)} revision(s), first ID: {test_revision_id}")
        return True
        
    except Exception as e:
        log_fail("Get revisions", f"Exception: {str(e)}")
        return False


def test_restore_revision():
    """C8: POST /api/admin/revisions/{id}/restore"""
    print("\n" + "="*80)
    print("TEST C8: POST /api/admin/revisions/{id}/restore")
    print("="*80)
    
    if not test_revision_id:
        log_fail("Restore revision", "No revision ID available")
        return False
    
    try:
        response = requests.post(
            f"{ADMIN_BASE}/revisions/{test_revision_id}/restore",
            headers=auth_headers(),
            timeout=10
        )
        
        if response.status_code != 200:
            log_fail("Restore revision", f"Expected 200, got {response.status_code}. Response: {response.text}")
            return False
        
        data = response.json()
        
        if "ok" not in data or not data["ok"]:
            log_fail("Restore revision", f"Unexpected response: {data}")
            return False
        
        log_pass("Restore revision", f"Revision {test_revision_id} restored to draft")
        return True
        
    except Exception as e:
        log_fail("Restore revision", f"Exception: {str(e)}")
        return False


def test_draft_after_restore():
    """C9: Verify draft has original title back after restore"""
    print("\n" + "="*80)
    print("TEST C9: Verify Draft Has Original Title After Restore")
    print("="*80)
    
    try:
        response = requests.get(f"{ADMIN_BASE}/content?stage=draft", headers=auth_headers(), timeout=10)
        
        if response.status_code != 200:
            log_fail("Draft after restore", f"Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        draft_title = data.get("data", {}).get("hero", {}).get("titleA", {}).get("el", "")
        
        if draft_title == "QA TEST TITLE":
            log_fail("Draft after restore", "Draft still has 'QA TEST TITLE' (restore failed)")
            return False
        
        log_pass("Draft after restore", f"Draft restored to original title: '{draft_title}'")
        return True
        
    except Exception as e:
        log_fail("Draft after restore", f"Exception: {str(e)}")
        return False


def test_publish_clean():
    """C10: Publish again to clean the live site"""
    print("\n" + "="*80)
    print("TEST C10: Publish Clean Content (Remove Test Title from Live)")
    print("="*80)
    
    try:
        response = requests.post(f"{ADMIN_BASE}/publish", headers=auth_headers(), timeout=10)
        
        if response.status_code != 200:
            log_fail("Publish clean", f"Expected 200, got {response.status_code}")
            return False
        
        log_pass("Publish clean", "Clean content published")
        return True
        
    except Exception as e:
        log_fail("Publish clean", f"Exception: {str(e)}")
        return False


def test_verify_clean_live():
    """C11: Verify GET /api/content no longer has 'QA TEST TITLE'"""
    print("\n" + "="*80)
    print("TEST C11: Verify Live Site is Clean (No Test Title)")
    print("="*80)
    
    try:
        response = requests.get(f"{API_BASE}/content", timeout=10)
        
        if response.status_code != 200:
            log_fail("Verify clean live", f"Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        public_title = data.get("data", {}).get("hero", {}).get("titleA", {}).get("el", "")
        
        if public_title == "QA TEST TITLE":
            log_fail("Verify clean live", "Live site STILL has 'QA TEST TITLE'")
            return False
        
        log_pass("Verify clean live", f"Live site clean, title: '{public_title}'")
        return True
        
    except Exception as e:
        log_fail("Verify clean live", f"Exception: {str(e)}")
        return False


def test_discard():
    """C12: POST /api/admin/discard"""
    print("\n" + "="*80)
    print("TEST C12: POST /api/admin/discard")
    print("="*80)
    
    try:
        response = requests.post(f"{ADMIN_BASE}/discard", headers=auth_headers(), timeout=10)
        
        if response.status_code != 200:
            log_fail("Discard", f"Expected 200, got {response.status_code}")
            return False
        
        log_pass("Discard", "Draft discarded (reset to published)")
        return True
        
    except Exception as e:
        log_fail("Discard", f"Exception: {str(e)}")
        return False


def test_invalid_stage():
    """C13: GET /api/admin/content?stage=bogus -> 400"""
    print("\n" + "="*80)
    print("TEST C13: GET /api/admin/content?stage=bogus (400)")
    print("="*80)
    
    try:
        response = requests.get(f"{ADMIN_BASE}/content?stage=bogus", headers=auth_headers(), timeout=10)
        
        if response.status_code == 400:
            log_pass("Invalid stage", "Correctly returned 400")
            return True
        else:
            log_fail("Invalid stage", f"Expected 400, got {response.status_code}")
            return False
            
    except Exception as e:
        log_fail("Invalid stage", f"Exception: {str(e)}")
        return False


def test_empty_content():
    """C14: PUT /api/admin/content with empty data -> 400"""
    print("\n" + "="*80)
    print("TEST C14: PUT /api/admin/content with empty data (400)")
    print("="*80)
    
    try:
        payload = {"data": {}}
        response = requests.put(f"{ADMIN_BASE}/content", json=payload, headers=auth_headers(), timeout=10)
        
        if response.status_code == 400:
            log_pass("Empty content", "Correctly returned 400")
            return True
        else:
            log_fail("Empty content", f"Expected 400, got {response.status_code}")
            return False
            
    except Exception as e:
        log_fail("Empty content", f"Exception: {str(e)}")
        return False


def test_content_without_auth():
    """C15: PUT /api/admin/content without token -> 401"""
    print("\n" + "="*80)
    print("TEST C15: PUT /api/admin/content without auth (401)")
    print("="*80)
    
    try:
        payload = {"data": {"test": "data"}}
        response = requests.put(f"{ADMIN_BASE}/content", json=payload, timeout=10)
        
        if response.status_code == 401:
            log_pass("Content without auth", "Correctly returned 401")
            return True
        else:
            log_fail("Content without auth", f"Expected 401, got {response.status_code}")
            return False
            
    except Exception as e:
        log_fail("Content without auth", f"Exception: {str(e)}")
        return False


# ============================================================================
# D. MEDIA PIPELINE TESTS
# ============================================================================

def test_upload_media():
    """D1: POST /api/admin/media with processing options"""
    global test_media_id
    print("\n" + "="*80)
    print("TEST D1: POST /api/admin/media - Upload with Processing")
    print("="*80)
    
    # Use a logo from the frontend
    logo_path = Path("/app/frontend/public/logos/blysscafe.png")
    
    if not logo_path.exists():
        log_fail("Upload media", f"Test image not found: {logo_path}")
        return False
    
    try:
        with open(logo_path, "rb") as f:
            files = {"file": ("blysscafe.png", f, "image/png")}
            data = {
                "remove_bg": "auto",
                "trim": "true",
                "brightness": "1.2",
                "shape": "rounded",
                "radius_pct": "25",
                "max_dim": "320"
            }
            
            response = requests.post(
                f"{ADMIN_BASE}/media",
                files=files,
                data=data,
                headers=auth_headers(),
                timeout=20
            )
        
        if response.status_code != 200:
            log_fail("Upload media", f"Expected 200, got {response.status_code}. Response: {response.text}")
            return False
        
        result = response.json()
        
        errors = []
        if "id" not in result:
            errors.append("Missing 'id'")
        else:
            test_media_id = result["id"]
        
        if "url" not in result:
            errors.append("Missing 'url'")
        if "width" not in result:
            errors.append("Missing 'width'")
        if "height" not in result:
            errors.append("Missing 'height'")
        if "size" not in result:
            errors.append("Missing 'size'")
        
        # Check dimensions are <= 320
        if "width" in result and result["width"] > 320:
            errors.append(f"Width {result['width']} > 320")
        if "height" in result and result["height"] > 320:
            errors.append(f"Height {result['height']} > 320")
        
        if errors:
            log_fail("Upload media", "; ".join(errors))
            return False
        
        log_pass("Upload media", f"Uploaded: id={test_media_id}, {result['width']}x{result['height']}, {result['size']} bytes")
        return True
        
    except Exception as e:
        log_fail("Upload media", f"Exception: {str(e)}")
        return False


def test_get_media_public():
    """D2: GET /api/media/{id} without auth (public access)"""
    print("\n" + "="*80)
    print("TEST D2: GET /api/media/{id} - Public Access (No Auth)")
    print("="*80)
    
    if not test_media_id:
        log_fail("Get media public", "No media ID available")
        return False
    
    try:
        response = requests.get(f"{API_BASE}/media/{test_media_id}", timeout=10)
        
        if response.status_code != 200:
            log_fail("Get media public", f"Expected 200, got {response.status_code}")
            return False
        
        errors = []
        
        # Check content type
        content_type = response.headers.get("content-type", "")
        if "image/png" not in content_type:
            errors.append(f"Content-Type is '{content_type}', expected 'image/png'")
        
        # Check body is non-empty
        if len(response.content) == 0:
            errors.append("Response body is empty")
        
        # Check Cache-Control header
        cache_control = response.headers.get("cache-control", "")
        if not cache_control:
            errors.append("Missing Cache-Control header")
        
        if errors:
            log_fail("Get media public", "; ".join(errors))
            return False
        
        log_pass("Get media public", f"Image retrieved: {len(response.content)} bytes, Cache-Control: {cache_control}")
        return True
        
    except Exception as e:
        log_fail("Get media public", f"Exception: {str(e)}")
        return False


def test_list_media():
    """D3: GET /api/admin/media - List uploaded media"""
    print("\n" + "="*80)
    print("TEST D3: GET /api/admin/media - List Media")
    print("="*80)
    
    try:
        response = requests.get(f"{ADMIN_BASE}/media", headers=auth_headers(), timeout=10)
        
        if response.status_code != 200:
            log_fail("List media", f"Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        
        if "items" not in data:
            log_fail("List media", f"Missing 'items' field: {data}")
            return False
        
        items = data["items"]
        
        # Check if our uploaded item is in the list
        found = any(item.get("id") == test_media_id for item in items)
        
        if not found:
            log_fail("List media", f"Uploaded media {test_media_id} not found in list")
            return False
        
        log_pass("List media", f"Found {len(items)} media item(s), uploaded item present")
        return True
        
    except Exception as e:
        log_fail("List media", f"Exception: {str(e)}")
        return False


def test_delete_media():
    """D4: DELETE /api/admin/media/{id}"""
    print("\n" + "="*80)
    print("TEST D4: DELETE /api/admin/media/{id}")
    print("="*80)
    
    if not test_media_id:
        log_fail("Delete media", "No media ID available")
        return False
    
    try:
        response = requests.delete(f"{ADMIN_BASE}/media/{test_media_id}", headers=auth_headers(), timeout=10)
        
        if response.status_code != 200:
            log_fail("Delete media", f"Expected 200, got {response.status_code}")
            return False
        
        log_pass("Delete media", f"Media {test_media_id} deleted")
        return True
        
    except Exception as e:
        log_fail("Delete media", f"Exception: {str(e)}")
        return False


def test_get_deleted_media():
    """D5: GET /api/media/{id} after delete -> 404"""
    print("\n" + "="*80)
    print("TEST D5: GET /api/media/{id} After Delete (404)")
    print("="*80)
    
    if not test_media_id:
        log_fail("Get deleted media", "No media ID available")
        return False
    
    try:
        response = requests.get(f"{API_BASE}/media/{test_media_id}", timeout=10)
        
        if response.status_code == 404:
            log_pass("Get deleted media", "Correctly returned 404")
            return True
        else:
            log_fail("Get deleted media", f"Expected 404, got {response.status_code}")
            return False
            
    except Exception as e:
        log_fail("Get deleted media", f"Exception: {str(e)}")
        return False


def test_upload_non_image():
    """D6: POST /api/admin/media with non-image file -> 400"""
    print("\n" + "="*80)
    print("TEST D6: POST /api/admin/media - Non-Image File (400)")
    print("="*80)
    
    try:
        # Create a small text file
        files = {"file": ("test.txt", b"This is not an image", "text/plain")}
        
        response = requests.post(
            f"{ADMIN_BASE}/media",
            files=files,
            headers=auth_headers(),
            timeout=10
        )
        
        if response.status_code == 400:
            log_pass("Upload non-image", "Correctly returned 400")
            return True
        else:
            log_fail("Upload non-image", f"Expected 400, got {response.status_code}")
            return False
            
    except Exception as e:
        log_fail("Upload non-image", f"Exception: {str(e)}")
        return False


def test_upload_without_auth():
    """D7: POST /api/admin/media without token -> 401"""
    print("\n" + "="*80)
    print("TEST D7: POST /api/admin/media without auth (401)")
    print("="*80)
    
    logo_path = Path("/app/frontend/public/logos/blysscafe.png")
    
    if not logo_path.exists():
        log_fail("Upload without auth", f"Test image not found: {logo_path}")
        return False
    
    try:
        with open(logo_path, "rb") as f:
            files = {"file": ("test.png", f, "image/png")}
            response = requests.post(f"{ADMIN_BASE}/media", files=files, timeout=10)
        
        if response.status_code == 401:
            log_pass("Upload without auth", "Correctly returned 401")
            return True
        else:
            log_fail("Upload without auth", f"Expected 401, got {response.status_code}")
            return False
            
    except Exception as e:
        log_fail("Upload without auth", f"Exception: {str(e)}")
        return False


# ============================================================================
# E. INBOX / OVERVIEW TESTS
# ============================================================================

def test_overview():
    """E1: GET /api/admin/overview"""
    print("\n" + "="*80)
    print("TEST E1: GET /api/admin/overview")
    print("="*80)
    
    try:
        response = requests.get(f"{ADMIN_BASE}/overview", headers=auth_headers(), timeout=10)
        
        if response.status_code != 200:
            log_fail("Overview", f"Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        
        required_fields = ["contacts", "media", "clients", "revisions", "published_at", "dirty", "audit"]
        errors = []
        
        for field in required_fields:
            if field not in data:
                errors.append(f"Missing '{field}' field")
        
        # Check clients count is 25
        if "clients" in data and data["clients"] != 25:
            errors.append(f"Expected 25 clients, got {data['clients']}")
        
        # Check audit is an array
        if "audit" in data and not isinstance(data["audit"], list):
            errors.append("'audit' is not an array")
        
        if errors:
            log_fail("Overview", "; ".join(errors))
            return False
        
        log_pass("Overview", f"contacts={data['contacts']}, media={data['media']}, clients={data['clients']}, revisions={data['revisions']}, dirty={data['dirty']}")
        return True
        
    except Exception as e:
        log_fail("Overview", f"Exception: {str(e)}")
        return False


def test_list_contacts():
    """E2: GET /api/admin/contacts"""
    print("\n" + "="*80)
    print("TEST E2: GET /api/admin/contacts")
    print("="*80)
    
    try:
        response = requests.get(f"{ADMIN_BASE}/contacts", headers=auth_headers(), timeout=10)
        
        if response.status_code != 200:
            log_fail("List contacts", f"Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        
        if "items" not in data or "total" not in data:
            log_fail("List contacts", f"Missing 'items' or 'total' field: {data.keys()}")
            return False
        
        log_pass("List contacts", f"Found {data['total']} contact(s)")
        return True
        
    except Exception as e:
        log_fail("List contacts", f"Exception: {str(e)}")
        return False


# ============================================================================
# F. REGRESSION TESTS (Contact Endpoint)
# ============================================================================

def test_contact_regression_health():
    """F1: GET /api/ - Health check"""
    print("\n" + "="*80)
    print("TEST F1: GET /api/ - Health Check (Regression)")
    print("="*80)
    
    try:
        response = requests.get(f"{API_BASE}/", timeout=10)
        
        if response.status_code != 200:
            log_fail("Health check regression", f"Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        
        if data.get("status") == "ok":
            log_pass("Health check regression", "API healthy")
            return True
        else:
            log_fail("Health check regression", f"Unexpected response: {data}")
            return False
            
    except Exception as e:
        log_fail("Health check regression", f"Exception: {str(e)}")
        return False


def test_contact_regression_create():
    """F2: POST /api/contact with valid payload"""
    print("\n" + "="*80)
    print("TEST F2: POST /api/contact - Create Contact (Regression)")
    print("="*80)
    
    payload = {
        "name": "Maria Konstantinou",
        "email": "maria.k@example.com",
        "business": "Fashion Boutique Athens",
        "message": "Θέλουμε να αυξήσουμε την παρουσία μας στο Instagram και TikTok. Έχουμε ένα νέο κατάστημα στο Κολωνάκι."
    }
    
    try:
        response = requests.post(f"{API_BASE}/contact", json=payload, timeout=20)
        
        if response.status_code != 200:
            log_fail("Contact regression create", f"Expected 200, got {response.status_code}. Response: {response.text}")
            return None
        
        data = response.json()
        
        # Check UUID
        if "id" not in data or not data["id"]:
            log_fail("Contact regression create", "Missing or empty 'id'")
            return None
        
        # Check email_delivered
        email_delivered = data.get("email_delivered", None)
        
        log_pass("Contact regression create", f"Contact created: id={data['id']}, email_delivered={email_delivered}")
        return email_delivered
        
    except Exception as e:
        log_fail("Contact regression create", f"Exception: {str(e)}")
        return None


def test_contact_regression_count():
    """F3: GET /api/contact/count - Verify increment"""
    print("\n" + "="*80)
    print("TEST F3: GET /api/contact/count - Verify Increment (Regression)")
    print("="*80)
    
    try:
        response = requests.get(f"{API_BASE}/contact/count", timeout=10)
        
        if response.status_code != 200:
            log_fail("Contact count regression", f"Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        count = data.get("count", 0)
        
        log_pass("Contact count regression", f"Count: {count}")
        return True
        
    except Exception as e:
        log_fail("Contact count regression", f"Exception: {str(e)}")
        return False


def test_contact_regression_validation_missing_name():
    """F4: POST /api/contact missing name -> 422"""
    print("\n" + "="*80)
    print("TEST F4: POST /api/contact - Missing Name (422)")
    print("="*80)
    
    payload = {
        "email": "test@example.com",
        "message": "Test message"
    }
    
    try:
        response = requests.post(f"{API_BASE}/contact", json=payload, timeout=10)
        
        if response.status_code == 422:
            log_pass("Contact validation missing name", "Correctly returned 422")
            return True
        else:
            log_fail("Contact validation missing name", f"Expected 422, got {response.status_code}")
            return False
            
    except Exception as e:
        log_fail("Contact validation missing name", f"Exception: {str(e)}")
        return False


def test_contact_regression_validation_empty_message():
    """F5: POST /api/contact empty message -> 422"""
    print("\n" + "="*80)
    print("TEST F5: POST /api/contact - Empty Message (422)")
    print("="*80)
    
    payload = {
        "name": "Test User",
        "email": "test@example.com",
        "message": ""
    }
    
    try:
        response = requests.post(f"{API_BASE}/contact", json=payload, timeout=10)
        
        if response.status_code == 422:
            log_pass("Contact validation empty message", "Correctly returned 422")
            return True
        else:
            log_fail("Contact validation empty message", f"Expected 422, got {response.status_code}")
            return False
            
    except Exception as e:
        log_fail("Contact validation empty message", f"Exception: {str(e)}")
        return False


def test_contact_regression_validation_bad_email():
    """F6: POST /api/contact bad email -> 422"""
    print("\n" + "="*80)
    print("TEST F6: POST /api/contact - Bad Email (422)")
    print("="*80)
    
    payload = {
        "name": "Test User",
        "email": "not-an-email",
        "message": "Test message"
    }
    
    try:
        response = requests.post(f"{API_BASE}/contact", json=payload, timeout=10)
        
        if response.status_code == 422:
            log_pass("Contact validation bad email", "Correctly returned 422")
            return True
        else:
            log_fail("Contact validation bad email", f"Expected 422, got {response.status_code}")
            return False
            
    except Exception as e:
        log_fail("Contact validation bad email", f"Exception: {str(e)}")
        return False


# ============================================================================
# G. BACKEND LOGS CHECK
# ============================================================================

def check_backend_logs():
    """G1: Check /var/log/supervisor/backend.err.log for tracebacks"""
    print("\n" + "="*80)
    print("TEST G1: Check Backend Error Logs")
    print("="*80)
    
    try:
        import subprocess
        result = subprocess.run(
            ["tail", "-n", "100", "/var/log/supervisor/backend.err.log"],
            capture_output=True,
            text=True,
            timeout=5
        )
        
        log_content = result.stdout
        
        # Look for Python tracebacks
        if "Traceback" in log_content:
            log_warning("Backend logs", "Found traceback(s) in error log")
            # Print last 20 lines for context
            lines = log_content.split("\n")
            print("   Last 20 lines of error log:")
            for line in lines[-20:]:
                print(f"   {line}")
            return False
        else:
            log_pass("Backend logs", "No tracebacks found in error log")
            return True
            
    except Exception as e:
        log_warning("Backend logs check", f"Could not check logs: {str(e)}")
        return False


# ============================================================================
# FINAL VERIFICATION
# ============================================================================

def test_final_verification():
    """Final: Verify live site has original Greek hero title"""
    print("\n" + "="*80)
    print("FINAL VERIFICATION: Live Site Has Original Greek Title")
    print("="*80)
    
    try:
        response = requests.get(f"{API_BASE}/content", timeout=10)
        
        if response.status_code != 200:
            log_fail("Final verification", f"Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        current_title = data.get("data", {}).get("hero", {}).get("titleA", {}).get("el", "")
        
        # Check if it contains the original Greek text
        if "Κάνουμε τα μαγαζιά" in current_title:
            log_pass("Final verification", f"✅ Live site clean: '{current_title}'")
            return True
        else:
            log_fail("Final verification", f"Live site title is '{current_title}', expected to contain 'Κάνουμε τα μαγαζιά'")
            return False
            
    except Exception as e:
        log_fail("Final verification", f"Exception: {str(e)}")
        return False


# ============================================================================
# MAIN TEST RUNNER
# ============================================================================

def print_summary():
    """Print test summary"""
    print("\n" + "="*80)
    print("TEST SUMMARY")
    print("="*80)
    
    print(f"\n✅ PASSED: {len(results['passed'])}")
    for item in results['passed']:
        print(f"  {item}")
    
    if results['warnings']:
        print(f"\n⚠️  WARNINGS: {len(results['warnings'])}")
        for item in results['warnings']:
            print(f"  {item}")
    
    if results['failed']:
        print(f"\n❌ FAILED: {len(results['failed'])}")
        for item in results['failed']:
            print(f"  {item}")
    
    print("\n" + "="*80)
    
    total = len(results['passed']) + len(results['failed'])
    pass_rate = (len(results['passed']) / total * 100) if total > 0 else 0
    print(f"PASS RATE: {pass_rate:.1f}% ({len(results['passed'])}/{total})")
    print("="*80)
    
    return len(results['failed']) == 0


def main():
    """Run all tests"""
    print("="*80)
    print("SocialGrowth Studio (Round 2) - Backend API Test Suite")
    print("="*80)
    print(f"Backend URL: {BACKEND_URL}")
    print(f"API Base: {API_BASE}")
    print(f"Admin Base: {ADMIN_BASE}")
    print("="*80)
    print("⚠️  CRITICAL: Using correct password FIRST, then max 1 wrong attempt")
    print("="*80)
    
    # A. AUTH TESTS (CRITICAL: Do successful login FIRST)
    if not test_login_success():
        print("\n❌ CRITICAL: Login failed, cannot continue with authenticated tests")
        print_summary()
        return 1
    
    test_session_with_token()
    test_session_without_token()
    test_session_with_garbage_token()
    test_login_wrong_password()  # Only ONE wrong attempt
    
    # B. PUBLIC CONTENT TESTS
    test_public_content()
    
    # C. DRAFT/PUBLISH WORKFLOW TESTS
    test_get_draft_content()
    test_edit_draft()
    test_draft_not_live()
    test_draft_shows_changes()
    test_publish()
    test_published_content_live()
    test_get_revisions()
    test_restore_revision()
    test_draft_after_restore()
    test_publish_clean()
    test_verify_clean_live()
    test_discard()
    test_invalid_stage()
    test_empty_content()
    test_content_without_auth()
    
    # D. MEDIA PIPELINE TESTS
    test_upload_media()
    test_get_media_public()
    test_list_media()
    test_delete_media()
    test_get_deleted_media()
    test_upload_non_image()
    test_upload_without_auth()
    
    # E. INBOX / OVERVIEW TESTS
    test_overview()
    test_list_contacts()
    
    # F. REGRESSION TESTS (Contact Endpoint)
    test_contact_regression_health()
    email_delivered = test_contact_regression_create()
    test_contact_regression_count()
    test_contact_regression_validation_missing_name()
    test_contact_regression_validation_empty_message()
    test_contact_regression_validation_bad_email()
    
    # G. BACKEND LOGS CHECK
    check_backend_logs()
    
    # FINAL VERIFICATION
    test_final_verification()
    
    # Print summary
    all_passed = print_summary()
    
    # Report email_delivered value
    print("\n" + "="*80)
    print("ADDITIONAL INFO")
    print("="*80)
    if email_delivered is not None:
        print(f"email_delivered value from contact regression: {email_delivered}")
    else:
        print("email_delivered: Not captured (contact creation may have failed)")
    
    if original_hero_title:
        print(f"Original Greek hero title: '{original_hero_title}'")
    
    print("="*80)
    
    return 0 if all_passed else 1


if __name__ == "__main__":
    sys.exit(main())
