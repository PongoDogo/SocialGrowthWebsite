#!/usr/bin/env python3
"""
Full regression test suite for SocialGrowth FastAPI backend.
Tests all endpoints, validation, MongoDB persistence, and CORS headers.
"""

import requests
import json
import sys
from datetime import datetime
from uuid import UUID

# Backend URL from frontend/.env
BACKEND_URL = "https://stable-deploy-18.preview.emergentagent.com"
API_BASE = f"{BACKEND_URL}/api"

# Test results tracking
results = {
    "passed": [],
    "failed": [],
    "warnings": []
}


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


def is_valid_uuid(val):
    """Check if a string is a valid UUID."""
    try:
        UUID(val)
        return True
    except (ValueError, AttributeError, TypeError):
        return False


def is_valid_iso_datetime(val):
    """Check if a string is a valid ISO 8601 datetime."""
    try:
        datetime.fromisoformat(val.replace('Z', '+00:00'))
        return True
    except (ValueError, AttributeError, TypeError):
        return False


def test_health_endpoint():
    """Test 1: GET /api/ health endpoint"""
    print("\n" + "="*80)
    print("TEST 1: GET /api/ - Health Endpoint")
    print("="*80)
    
    try:
        response = requests.get(f"{API_BASE}/", timeout=10)
        
        if response.status_code != 200:
            log_fail("Health endpoint status", f"Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        
        if data.get("message") == "SocialGrowth API" and data.get("status") == "ok":
            log_pass("Health endpoint", f"Response: {data}")
            return True
        else:
            log_fail("Health endpoint response", f"Unexpected response: {data}")
            return False
            
    except Exception as e:
        log_fail("Health endpoint", f"Exception: {str(e)}")
        return False


def test_contact_count_initial():
    """Test 2: GET /api/contact/count - Get initial count"""
    print("\n" + "="*80)
    print("TEST 2: GET /api/contact/count - Initial Count")
    print("="*80)
    
    try:
        response = requests.get(f"{API_BASE}/contact/count", timeout=10)
        
        if response.status_code != 200:
            log_fail("Contact count endpoint", f"Expected 200, got {response.status_code}")
            return None
        
        data = response.json()
        
        if "count" not in data:
            log_fail("Contact count response", f"Missing 'count' field: {data}")
            return None
        
        count = data["count"]
        log_pass("Contact count endpoint", f"Initial count: {count}")
        return count
        
    except Exception as e:
        log_fail("Contact count endpoint", f"Exception: {str(e)}")
        return None


def test_create_contact_valid():
    """Test 3: POST /api/contact with valid payload"""
    print("\n" + "="*80)
    print("TEST 3: POST /api/contact - Valid Payload")
    print("="*80)
    
    payload = {
        "name": "Dimitris Papadopoulos",
        "email": "dimitris@example.com",
        "business": "Tech Startup",
        "message": "We are interested in growing our social media presence for our new product launch."
    }
    
    try:
        response = requests.post(f"{API_BASE}/contact", json=payload, timeout=20)
        
        if response.status_code != 200:
            log_fail("Create contact", f"Expected 200, got {response.status_code}. Response: {response.text}")
            return None
        
        data = response.json()
        
        # Validate response structure
        errors = []
        
        # Check id is a valid UUID
        if "id" not in data:
            errors.append("Missing 'id' field")
        elif not is_valid_uuid(data["id"]):
            errors.append(f"'id' is not a valid UUID: {data['id']}")
        
        # Check created_at is a valid ISO datetime
        if "created_at" not in data:
            errors.append("Missing 'created_at' field")
        elif not is_valid_iso_datetime(data["created_at"]):
            errors.append(f"'created_at' is not a valid ISO datetime: {data['created_at']}")
        
        # Check email_delivered is a boolean
        if "email_delivered" not in data:
            errors.append("Missing 'email_delivered' field")
        elif not isinstance(data["email_delivered"], bool):
            errors.append(f"'email_delivered' is not a boolean: {data['email_delivered']}")
        
        # Check all input fields are present
        for field in ["name", "email", "business", "message"]:
            if field not in data:
                errors.append(f"Missing '{field}' field in response")
        
        if errors:
            log_fail("Create contact response validation", "; ".join(errors))
            return None
        
        # Log email_delivered status (false is acceptable per requirements)
        email_status = "delivered" if data["email_delivered"] else "not delivered (acceptable - formsubmit.co requires activation)"
        log_pass("Create contact", f"Contact created with UUID {data['id']}, email {email_status}")
        
        return data["id"]
        
    except Exception as e:
        log_fail("Create contact", f"Exception: {str(e)}")
        return None


def test_contact_persistence(contact_id):
    """Test 4: Verify contact was persisted and count increased"""
    print("\n" + "="*80)
    print("TEST 4: Verify MongoDB Persistence & Count Increment")
    print("="*80)
    
    if contact_id is None:
        log_fail("Contact persistence check", "Skipped - no contact_id from previous test")
        return False
    
    try:
        # Get new count
        response = requests.get(f"{API_BASE}/contact/count", timeout=10)
        
        if response.status_code != 200:
            log_fail("Contact count after creation", f"Expected 200, got {response.status_code}")
            return False
        
        new_count = response.json()["count"]
        
        # We can't directly verify the exact increment without the initial count stored
        # But we can verify the count is at least 1
        if new_count >= 1:
            log_pass("Contact persistence", f"Count after creation: {new_count} (contact persisted)")
            return True
        else:
            log_fail("Contact persistence", f"Count is {new_count}, expected at least 1")
            return False
        
    except Exception as e:
        log_fail("Contact persistence check", f"Exception: {str(e)}")
        return False


def test_validation_missing_name():
    """Test 5a: POST /api/contact with missing name"""
    print("\n" + "="*80)
    print("TEST 5a: POST /api/contact - Missing Name (Validation)")
    print("="*80)
    
    payload = {
        "email": "test@example.com",
        "business": "Test Business",
        "message": "Test message"
    }
    
    try:
        response = requests.post(f"{API_BASE}/contact", json=payload, timeout=10)
        
        if response.status_code == 422:
            log_pass("Validation - missing name", "Correctly returned 422")
            return True
        else:
            log_fail("Validation - missing name", f"Expected 422, got {response.status_code}")
            return False
            
    except Exception as e:
        log_fail("Validation - missing name", f"Exception: {str(e)}")
        return False


def test_validation_empty_message():
    """Test 5b: POST /api/contact with empty message"""
    print("\n" + "="*80)
    print("TEST 5b: POST /api/contact - Empty Message (Validation)")
    print("="*80)
    
    payload = {
        "name": "Test User",
        "email": "test@example.com",
        "business": "Test Business",
        "message": ""
    }
    
    try:
        response = requests.post(f"{API_BASE}/contact", json=payload, timeout=10)
        
        if response.status_code == 422:
            log_pass("Validation - empty message", "Correctly returned 422")
            return True
        else:
            log_fail("Validation - empty message", f"Expected 422, got {response.status_code}")
            return False
            
    except Exception as e:
        log_fail("Validation - empty message", f"Exception: {str(e)}")
        return False


def test_validation_invalid_email():
    """Test 5c: POST /api/contact with invalid email format"""
    print("\n" + "="*80)
    print("TEST 5c: POST /api/contact - Invalid Email (Validation)")
    print("="*80)
    
    payload = {
        "name": "Test User",
        "email": "not-an-email",
        "business": "Test Business",
        "message": "Test message"
    }
    
    try:
        response = requests.post(f"{API_BASE}/contact", json=payload, timeout=10)
        
        if response.status_code == 422:
            log_pass("Validation - invalid email", "Correctly returned 422")
            return True
        else:
            log_fail("Validation - invalid email", f"Expected 422, got {response.status_code}")
            return False
            
    except Exception as e:
        log_fail("Validation - invalid email", f"Exception: {str(e)}")
        return False


def test_validation_name_too_long():
    """Test 5d: POST /api/contact with name > 120 chars"""
    print("\n" + "="*80)
    print("TEST 5d: POST /api/contact - Name Too Long (Validation)")
    print("="*80)
    
    payload = {
        "name": "A" * 121,  # 121 characters
        "email": "test@example.com",
        "business": "Test Business",
        "message": "Test message"
    }
    
    try:
        response = requests.post(f"{API_BASE}/contact", json=payload, timeout=10)
        
        if response.status_code == 422:
            log_pass("Validation - name too long", "Correctly returned 422")
            return True
        else:
            log_fail("Validation - name too long", f"Expected 422, got {response.status_code}")
            return False
            
    except Exception as e:
        log_fail("Validation - name too long", f"Exception: {str(e)}")
        return False


def test_validation_message_too_long():
    """Test 5e: POST /api/contact with message > 4000 chars"""
    print("\n" + "="*80)
    print("TEST 5e: POST /api/contact - Message Too Long (Validation)")
    print("="*80)
    
    payload = {
        "name": "Test User",
        "email": "test@example.com",
        "business": "Test Business",
        "message": "A" * 4001  # 4001 characters
    }
    
    try:
        response = requests.post(f"{API_BASE}/contact", json=payload, timeout=10)
        
        if response.status_code == 422:
            log_pass("Validation - message too long", "Correctly returned 422")
            return True
        else:
            log_fail("Validation - message too long", f"Expected 422, got {response.status_code}")
            return False
            
    except Exception as e:
        log_fail("Validation - message too long", f"Exception: {str(e)}")
        return False


def test_cors_headers():
    """Test 6: Verify CORS headers are present"""
    print("\n" + "="*80)
    print("TEST 6: CORS Headers Verification")
    print("="*80)
    
    try:
        response = requests.get(f"{API_BASE}/", timeout=10)
        
        cors_headers = {
            "access-control-allow-origin": response.headers.get("access-control-allow-origin"),
            "access-control-allow-methods": response.headers.get("access-control-allow-methods"),
            "access-control-allow-headers": response.headers.get("access-control-allow-headers"),
        }
        
        missing_headers = [k for k, v in cors_headers.items() if v is None]
        
        if missing_headers:
            log_fail("CORS headers", f"Missing headers: {', '.join(missing_headers)}")
            return False
        else:
            log_pass("CORS headers", f"All CORS headers present: {cors_headers}")
            return True
            
    except Exception as e:
        log_fail("CORS headers check", f"Exception: {str(e)}")
        return False


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
    print("SocialGrowth Backend API - Full Regression Test Suite")
    print("="*80)
    print(f"Backend URL: {BACKEND_URL}")
    print(f"API Base: {API_BASE}")
    print("="*80)
    
    # Test 1: Health endpoint
    test_health_endpoint()
    
    # Test 2: Get initial contact count
    initial_count = test_contact_count_initial()
    
    # Test 3: Create valid contact
    contact_id = test_create_contact_valid()
    
    # Test 4: Verify persistence and count increment
    if initial_count is not None and contact_id is not None:
        # Verify count increased
        try:
            response = requests.get(f"{API_BASE}/contact/count", timeout=10)
            new_count = response.json()["count"]
            if new_count == initial_count + 1:
                log_pass("Count increment verification", f"Count increased from {initial_count} to {new_count}")
            else:
                log_warning("Count increment verification", f"Expected {initial_count + 1}, got {new_count}")
        except Exception as e:
            log_fail("Count increment verification", f"Exception: {str(e)}")
    else:
        test_contact_persistence(contact_id)
    
    # Test 5: Validation tests
    test_validation_missing_name()
    test_validation_empty_message()
    test_validation_invalid_email()
    test_validation_name_too_long()
    test_validation_message_too_long()
    
    # Test 6: CORS headers
    test_cors_headers()
    
    # Print summary
    all_passed = print_summary()
    
    return 0 if all_passed else 1


if __name__ == "__main__":
    sys.exit(main())
