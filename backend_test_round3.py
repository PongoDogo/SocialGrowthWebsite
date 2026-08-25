#!/usr/bin/env python3
"""
ROUND 3 Backend Testing — Extended content schema verification
Tests the new design controls added to default_content.py
"""

import sys
import httpx
import json
from typing import Any, Dict

BASE_URL = "https://cautious-update.preview.emergentagent.com"
PASSWORD = "mU7P0TEwNI4ozC7L"

# Test state
token = None
test_results = []
failed_tests = []


def log(msg: str, level: str = "INFO"):
    """Log test messages"""
    prefix = "✅" if level == "PASS" else "❌" if level == "FAIL" else "ℹ️"
    print(f"{prefix} {msg}")


def test(name: str):
    """Decorator for test functions"""
    def decorator(func):
        def wrapper(*args, **kwargs):
            try:
                result = func(*args, **kwargs)
                test_results.append((name, True, None))
                log(f"{name}: PASSED", "PASS")
                return result
            except AssertionError as e:
                test_results.append((name, False, str(e)))
                failed_tests.append((name, str(e)))
                log(f"{name}: FAILED - {e}", "FAIL")
                raise
            except Exception as e:
                test_results.append((name, False, f"Exception: {e}"))
                failed_tests.append((name, f"Exception: {e}"))
                log(f"{name}: ERROR - {e}", "FAIL")
                raise
        return wrapper
    return decorator


def deep_get(data: Dict[str, Any], path: str, default=None) -> Any:
    """Get nested dict value using dot notation"""
    keys = path.split('.')
    val = data
    for key in keys:
        if isinstance(val, dict):
            val = val.get(key, default)
        elif isinstance(val, list) and key.isdigit():
            idx = int(key)
            val = val[idx] if 0 <= idx < len(val) else default
        else:
            return default
    return val


# ============================================================================
# TEST 1: Login (MUST DO SUCCESSFUL LOGIN FIRST)
# ============================================================================

@test("1. POST /api/admin/login with correct password")
def test_login():
    global token
    with httpx.Client(timeout=30) as client:
        r = client.post(f"{BASE_URL}/api/admin/login", json={"password": PASSWORD})
        assert r.status_code == 200, f"Expected 200, got {r.status_code}: {r.text}"
        data = r.json()
        assert "token" in data, f"No token in response: {data}"
        token = data["token"]
        assert len(token) > 50, f"Token too short: {len(token)}"
        log(f"  Token obtained: {token[:20]}...")


# ============================================================================
# TEST 2: GET /api/content - Verify all new schema keys
# ============================================================================

@test("2.1. GET /api/content returns 200 with data")
def test_public_content_structure():
    with httpx.Client(timeout=30) as client:
        r = client.get(f"{BASE_URL}/api/content")
        assert r.status_code == 200, f"Expected 200, got {r.status_code}"
        data = r.json()
        assert "data" in data, "No 'data' key in response"
        assert "updated_at" in data, "No 'updated_at' key in response"
        return data["data"]


@test("2.2. Verify theme.fonts schema")
def test_theme_fonts():
    with httpx.Client(timeout=30) as client:
        r = client.get(f"{BASE_URL}/api/content")
        content = r.json()["data"]
        
        # Check theme.fonts exists
        assert "theme" in content, "No 'theme' key"
        assert "fonts" in content["theme"], "No 'fonts' in theme"
        
        fonts = content["theme"]["fonts"]
        assert fonts["display"] == "Bricolage Grotesque", f"display font wrong: {fonts.get('display')}"
        assert fonts["body"] == "Manrope", f"body font wrong: {fonts.get('body')}"
        assert fonts["scale"] == 100, f"scale wrong: {fonts.get('scale')}"
        assert fonts["headingWeight"] == 800, f"headingWeight wrong: {fonts.get('headingWeight')}"
        log(f"  ✓ theme.fonts: display={fonts['display']}, body={fonts['body']}, scale={fonts['scale']}, headingWeight={fonts['headingWeight']}")


@test("2.3. Verify theme colors and layout")
def test_theme_colors_layout():
    with httpx.Client(timeout=30) as client:
        r = client.get(f"{BASE_URL}/api/content")
        content = r.json()["data"]
        theme = content["theme"]
        
        assert theme["bg"] == "#050505", f"bg wrong: {theme.get('bg')}"
        assert theme["surface"] == "#0a0a0c", f"surface wrong: {theme.get('surface')}"
        assert theme["borderColor"] == "#ffffff", f"borderColor wrong: {theme.get('borderColor')}"
        assert theme["borderOpacity"] == 8, f"borderOpacity wrong: {theme.get('borderOpacity')}"
        assert theme["cardRadius"] == 24, f"cardRadius wrong: {theme.get('cardRadius')}"
        assert theme["containerWidth"] == 1240, f"containerWidth wrong: {theme.get('containerWidth')}"
        assert theme["accent"] == "#60d6ff", f"accent wrong: {theme.get('accent')}"
        log(f"  ✓ theme colors/layout: bg={theme['bg']}, accent={theme['accent']}, cardRadius={theme['cardRadius']}")


@test("2.4. Verify theme.buttons schema")
def test_theme_buttons():
    with httpx.Client(timeout=30) as client:
        r = client.get(f"{BASE_URL}/api/content")
        content = r.json()["data"]
        buttons = content["theme"]["buttons"]
        
        assert buttons["shape"] == "pill", f"shape wrong: {buttons.get('shape')}"
        assert buttons["size"] == "md", f"size wrong: {buttons.get('size')}"
        assert buttons["primaryBg"] == "#ffffff", f"primaryBg wrong: {buttons.get('primaryBg')}"
        assert buttons["primaryText"] == "#000000", f"primaryText wrong: {buttons.get('primaryText')}"
        assert buttons["secondaryStyle"] == "outline", f"secondaryStyle wrong: {buttons.get('secondaryStyle')}"
        assert buttons["showIcons"] == True, f"showIcons wrong: {buttons.get('showIcons')}"
        log(f"  ✓ theme.buttons: shape={buttons['shape']}, size={buttons['size']}, showIcons={buttons['showIcons']}")


@test("2.5. Verify theme.icons schema")
def test_theme_icons():
    with httpx.Client(timeout=30) as client:
        r = client.get(f"{BASE_URL}/api/content")
        content = r.json()["data"]
        icons = content["theme"]["icons"]
        
        assert icons["style"] == "soft", f"style wrong: {icons.get('style')}"
        assert icons["size"] == 100, f"size wrong: {icons.get('size')}"
        log(f"  ✓ theme.icons: style={icons['style']}, size={icons['size']}")


@test("2.6. Verify nav schema (showCta, logoPosition, linksAlign, sticky, blur)")
def test_nav_schema():
    with httpx.Client(timeout=30) as client:
        r = client.get(f"{BASE_URL}/api/content")
        content = r.json()["data"]
        nav = content["nav"]
        
        assert nav["showCta"] == True, f"showCta wrong: {nav.get('showCta')}"
        assert nav["logoPosition"] == "left", f"logoPosition wrong: {nav.get('logoPosition')}"
        assert nav["linksAlign"] == "center", f"linksAlign wrong: {nav.get('linksAlign')}"
        assert nav["sticky"] == True, f"sticky wrong: {nav.get('sticky')}"
        assert nav["blur"] == True, f"blur wrong: {nav.get('blur')}"
        log(f"  ✓ nav: showCta={nav['showCta']}, logoPosition={nav['logoPosition']}, sticky={nav['sticky']}, blur={nav['blur']}")


@test("2.7. Verify nav.items have type and url fields")
def test_nav_items():
    with httpx.Client(timeout=30) as client:
        r = client.get(f"{BASE_URL}/api/content")
        content = r.json()["data"]
        items = content["nav"]["items"]
        
        assert len(items) >= 4, f"Expected at least 4 nav items, got {len(items)}"
        for i, item in enumerate(items):
            assert "type" in item, f"nav.items[{i}] missing 'type'"
            assert "url" in item, f"nav.items[{i}] missing 'url'"
            assert item["type"] == "section", f"nav.items[{i}].type should be 'section', got {item['type']}"
            assert item["url"] == "", f"nav.items[{i}].url should be empty, got {item['url']}"
        log(f"  ✓ nav.items: {len(items)} items, all have type='section' and url=''")


@test("2.8. Verify hero layout fields")
def test_hero_layout():
    with httpx.Client(timeout=30) as client:
        r = client.get(f"{BASE_URL}/api/content")
        content = r.json()["data"]
        hero = content["hero"]
        
        assert hero["align"] == "left", f"align wrong: {hero.get('align')}"
        assert hero["imageSide"] == "right", f"imageSide wrong: {hero.get('imageSide')}"
        assert hero["buttonsAlign"] == "left", f"buttonsAlign wrong: {hero.get('buttonsAlign')}"
        assert hero["padding"] == "normal", f"padding wrong: {hero.get('padding')}"
        assert hero["bgImage"] == "", f"bgImage should be empty, got {hero.get('bgImage')}"
        assert hero["bgOverlay"] == 60, f"bgOverlay wrong: {hero.get('bgOverlay')}"
        log(f"  ✓ hero: align={hero['align']}, imageSide={hero['imageSide']}, padding={hero['padding']}")


@test("2.9. Verify clients layout fields")
def test_clients_layout():
    with httpx.Client(timeout=30) as client:
        r = client.get(f"{BASE_URL}/api/content")
        content = r.json()["data"]
        clients = content["clients"]
        
        assert clients["align"] == "left", f"align wrong: {clients.get('align')}"
        assert clients["padding"] == "normal", f"padding wrong: {clients.get('padding')}"
        assert clients["cardSize"] == "md", f"cardSize wrong: {clients.get('cardSize')}"
        assert clients["cardRadius"] == 22, f"cardRadius wrong: {clients.get('cardRadius')}"
        assert clients["socialsPosition"] == "below", f"socialsPosition wrong: {clients.get('socialsPosition')}"
        assert clients["logoMax"] == 100, f"logoMax wrong: {clients.get('logoMax')}"
        assert len(clients["items"]) == 25, f"Expected 25 client items, got {len(clients['items'])}"
        log(f"  ✓ clients: cardSize={clients['cardSize']}, cardRadius={clients['cardRadius']}, 25 items")


@test("2.10. Verify stats layout fields")
def test_stats_layout():
    with httpx.Client(timeout=30) as client:
        r = client.get(f"{BASE_URL}/api/content")
        content = r.json()["data"]
        stats = content["stats"]
        
        assert stats["align"] == "left", f"align wrong: {stats.get('align')}"
        assert stats["padding"] == "normal", f"padding wrong: {stats.get('padding')}"
        assert stats["columns"] == 4, f"columns wrong: {stats.get('columns')}"
        log(f"  ✓ stats: align={stats['align']}, padding={stats['padding']}, columns={stats['columns']}")


@test("2.11. Verify services and process layout fields")
def test_services_process_layout():
    with httpx.Client(timeout=30) as client:
        r = client.get(f"{BASE_URL}/api/content")
        content = r.json()["data"]
        
        services = content["services"]
        assert services["align"] == "left", f"services.align wrong: {services.get('align')}"
        assert services["padding"] == "normal", f"services.padding wrong: {services.get('padding')}"
        
        process = content["process"]
        assert process["align"] == "left", f"process.align wrong: {process.get('align')}"
        assert process["padding"] == "normal", f"process.padding wrong: {process.get('padding')}"
        log(f"  ✓ services: align={services['align']}, padding={services['padding']}")
        log(f"  ✓ process: align={process['align']}, padding={process['padding']}")


@test("2.12. Verify contact layout fields")
def test_contact_layout():
    with httpx.Client(timeout=30) as client:
        r = client.get(f"{BASE_URL}/api/content")
        content = r.json()["data"]
        contact = content["contact"]
        
        assert contact["align"] == "left", f"align wrong: {contact.get('align')}"
        assert contact["padding"] == "normal", f"padding wrong: {contact.get('padding')}"
        assert contact["formSide"] == "right", f"formSide wrong: {contact.get('formSide')}"
        log(f"  ✓ contact: align={contact['align']}, padding={contact['padding']}, formSide={contact['formSide']}")


@test("2.13. Verify footer layout and links")
def test_footer_layout():
    with httpx.Client(timeout=30) as client:
        r = client.get(f"{BASE_URL}/api/content")
        content = r.json()["data"]
        footer = content["footer"]
        
        assert footer["layout"] == "spread", f"layout wrong: {footer.get('layout')}"
        assert footer["links"] == [], f"links should be empty array, got {footer.get('links')}"
        log(f"  ✓ footer: layout={footer['layout']}, links={footer['links']}")


@test("2.14. Verify layout.order")
def test_layout_order():
    with httpx.Client(timeout=30) as client:
        r = client.get(f"{BASE_URL}/api/content")
        content = r.json()["data"]
        layout = content["layout"]
        
        expected_order = ["hero", "clients", "stats", "services", "process", "contact"]
        assert layout["order"] == expected_order, f"order wrong: {layout.get('order')}"
        log(f"  ✓ layout.order: {layout['order']}")


# ============================================================================
# TEST 3: Round-trip - Draft editing and persistence
# ============================================================================

@test("3.1. GET /api/admin/content?stage=draft returns draft content")
def test_get_draft():
    with httpx.Client(timeout=30) as client:
        headers = {"Authorization": f"Bearer {token}"}
        r = client.get(f"{BASE_URL}/api/admin/content?stage=draft", headers=headers)
        assert r.status_code == 200, f"Expected 200, got {r.status_code}"
        data = r.json()
        assert "data" in data, "No 'data' in response"
        assert "dirty" in data, "No 'dirty' flag in response"
        log(f"  ✓ Draft retrieved, dirty={data['dirty']}")
        return data["data"]


@test("3.2. Modify draft: theme.fonts.display='Poppins', clients.cardSize='lg', nav.items[0].type='url'")
def test_modify_draft():
    with httpx.Client(timeout=30) as client:
        headers = {"Authorization": f"Bearer {token}"}
        
        # Get current draft
        r = client.get(f"{BASE_URL}/api/admin/content?stage=draft", headers=headers)
        draft = r.json()["data"]
        
        # Make modifications
        draft["theme"]["fonts"]["display"] = "Poppins"
        draft["clients"]["cardSize"] = "lg"
        draft["nav"]["items"][0]["type"] = "url"
        draft["nav"]["items"][0]["url"] = "https://example.com"
        
        # Save draft
        r = client.put(f"{BASE_URL}/api/admin/content", headers=headers, json={"data": draft})
        assert r.status_code == 200, f"PUT failed: {r.status_code} - {r.text}"
        log(f"  ✓ Draft modified and saved")
        return draft


@test("3.3. GET draft again and verify modifications persisted")
def test_verify_draft_persistence():
    with httpx.Client(timeout=30) as client:
        headers = {"Authorization": f"Bearer {token}"}
        r = client.get(f"{BASE_URL}/api/admin/content?stage=draft", headers=headers)
        draft = r.json()["data"]
        
        assert draft["theme"]["fonts"]["display"] == "Poppins", f"display not persisted: {draft['theme']['fonts']['display']}"
        assert draft["clients"]["cardSize"] == "lg", f"cardSize not persisted: {draft['clients']['cardSize']}"
        assert draft["nav"]["items"][0]["type"] == "url", f"nav type not persisted: {draft['nav']['items'][0]['type']}"
        assert draft["nav"]["items"][0]["url"] == "https://example.com", f"nav url not persisted: {draft['nav']['items'][0]['url']}"
        log(f"  ✓ All modifications persisted in draft")


@test("3.4. Verify public API still shows OLD values (draft isolation)")
def test_draft_isolation():
    with httpx.Client(timeout=30) as client:
        r = client.get(f"{BASE_URL}/api/content")
        content = r.json()["data"]
        
        # Should still have old values
        assert content["theme"]["fonts"]["display"] == "Bricolage Grotesque", f"Public API changed before publish! Got: {content['theme']['fonts']['display']}"
        assert content["clients"]["cardSize"] == "md", f"Public cardSize changed before publish! Got: {content['clients']['cardSize']}"
        assert content["nav"]["items"][0]["type"] == "section", f"Public nav type changed before publish! Got: {content['nav']['items'][0]['type']}"
        log(f"  ✓ Public API unchanged (draft isolation working)")


# ============================================================================
# TEST 4: Publish and verify changes are live
# ============================================================================

@test("4.1. POST /api/admin/publish")
def test_publish():
    with httpx.Client(timeout=30) as client:
        headers = {"Authorization": f"Bearer {token}"}
        r = client.post(f"{BASE_URL}/api/admin/publish", headers=headers)
        assert r.status_code == 200, f"Publish failed: {r.status_code} - {r.text}"
        data = r.json()
        assert data["ok"] == True, "Publish did not return ok=True"
        log(f"  ✓ Published successfully")


@test("4.2. Verify public API now shows NEW values")
def test_verify_published_changes():
    with httpx.Client(timeout=30) as client:
        r = client.get(f"{BASE_URL}/api/content")
        content = r.json()["data"]
        
        assert content["theme"]["fonts"]["display"] == "Poppins", f"display not published: {content['theme']['fonts']['display']}"
        assert content["clients"]["cardSize"] == "lg", f"cardSize not published: {content['clients']['cardSize']}"
        assert content["nav"]["items"][0]["type"] == "url", f"nav type not published: {content['nav']['items'][0]['type']}"
        assert content["nav"]["items"][0]["url"] == "https://example.com", f"nav url not published: {content['nav']['items'][0]['url']}"
        log(f"  ✓ All changes now live on public API")


# ============================================================================
# TEST 5: CLEANUP - Reset and publish factory defaults
# ============================================================================

@test("5.1. POST /api/admin/reset")
def test_reset():
    with httpx.Client(timeout=30) as client:
        headers = {"Authorization": f"Bearer {token}"}
        r = client.post(f"{BASE_URL}/api/admin/reset", headers=headers)
        assert r.status_code == 200, f"Reset failed: {r.status_code} - {r.text}"
        log(f"  ✓ Reset to factory defaults")


@test("5.2. POST /api/admin/publish (publish factory defaults)")
def test_publish_reset():
    with httpx.Client(timeout=30) as client:
        headers = {"Authorization": f"Bearer {token}"}
        r = client.post(f"{BASE_URL}/api/admin/publish", headers=headers)
        assert r.status_code == 200, f"Publish failed: {r.status_code} - {r.text}"
        log(f"  ✓ Factory defaults published")


@test("5.3. Verify public API restored to factory defaults")
def test_verify_factory_defaults():
    with httpx.Client(timeout=30) as client:
        r = client.get(f"{BASE_URL}/api/content")
        content = r.json()["data"]
        
        # Verify all key factory defaults
        assert content["theme"]["fonts"]["display"] == "Bricolage Grotesque", f"display not reset: {content['theme']['fonts']['display']}"
        assert content["clients"]["cardSize"] == "md", f"cardSize not reset: {content['clients']['cardSize']}"
        assert content["nav"]["items"][0]["type"] == "section", f"nav type not reset: {content['nav']['items'][0]['type']}"
        assert content["theme"]["accent"] == "#60d6ff", f"accent not reset: {content['theme']['accent']}"
        assert content["layout"]["order"][0] == "hero", f"layout.order not reset: {content['layout']['order']}"
        log(f"  ✓ Factory defaults restored: display=Bricolage Grotesque, cardSize=md, nav.type=section, accent=#60d6ff, layout.order[0]=hero")


# ============================================================================
# TEST 6: Regression - Health and Contact endpoints
# ============================================================================

@test("6.1. GET /api/ health endpoint")
def test_health():
    with httpx.Client(timeout=30) as client:
        r = client.get(f"{BASE_URL}/api/")
        assert r.status_code == 200, f"Expected 200, got {r.status_code}"
        data = r.json()
        assert data["status"] == "ok", f"Status not ok: {data}"
        log(f"  ✓ Health check passed: {data}")


@test("6.2. POST /api/contact with valid payload")
def test_contact_valid():
    with httpx.Client(timeout=30) as client:
        payload = {
            "name": "QA Round3 Test",
            "email": "qa.round3@example.com",
            "business": "Test Business",
            "message": "This is a test message for round 3 backend verification"
        }
        r = client.post(f"{BASE_URL}/api/contact", json=payload)
        assert r.status_code == 200, f"Expected 200, got {r.status_code}: {r.text}"
        data = r.json()
        assert "id" in data, "No id in response"
        assert "created_at" in data, "No created_at in response"
        assert "email_delivered" in data, "No email_delivered in response"
        log(f"  ✓ Contact created: id={data['id']}, email_delivered={data['email_delivered']}")


@test("6.3. POST /api/contact with invalid email")
def test_contact_invalid_email():
    with httpx.Client(timeout=30) as client:
        payload = {
            "name": "Test",
            "email": "not-an-email",
            "business": "Test",
            "message": "Test message"
        }
        r = client.post(f"{BASE_URL}/api/contact", json=payload)
        assert r.status_code == 422, f"Expected 422 for invalid email, got {r.status_code}"
        log(f"  ✓ Invalid email correctly rejected with 422")


@test("6.4. POST /api/contact with missing name")
def test_contact_missing_name():
    with httpx.Client(timeout=30) as client:
        payload = {
            "email": "test@example.com",
            "business": "Test",
            "message": "Test message"
        }
        r = client.post(f"{BASE_URL}/api/contact", json=payload)
        assert r.status_code == 422, f"Expected 422 for missing name, got {r.status_code}"
        log(f"  ✓ Missing name correctly rejected with 422")


# ============================================================================
# MAIN
# ============================================================================

def main():
    print("\n" + "="*80)
    print("ROUND 3 BACKEND TESTING — Extended Content Schema Verification")
    print("="*80 + "\n")
    
    try:
        # TEST 1: Login
        print("\n[TEST 1] Authentication")
        print("-" * 80)
        test_login()
        
        # TEST 2: Schema verification
        print("\n[TEST 2] GET /api/content - Verify all new schema keys")
        print("-" * 80)
        test_public_content_structure()
        test_theme_fonts()
        test_theme_colors_layout()
        test_theme_buttons()
        test_theme_icons()
        test_nav_schema()
        test_nav_items()
        test_hero_layout()
        test_clients_layout()
        test_stats_layout()
        test_services_process_layout()
        test_contact_layout()
        test_footer_layout()
        test_layout_order()
        
        # TEST 3: Round-trip
        print("\n[TEST 3] Round-trip - Draft editing and persistence")
        print("-" * 80)
        test_get_draft()
        test_modify_draft()
        test_verify_draft_persistence()
        test_draft_isolation()
        
        # TEST 4: Publish
        print("\n[TEST 4] Publish and verify changes are live")
        print("-" * 80)
        test_publish()
        test_verify_published_changes()
        
        # TEST 5: Cleanup
        print("\n[TEST 5] CLEANUP - Reset and publish factory defaults")
        print("-" * 80)
        test_reset()
        test_publish_reset()
        test_verify_factory_defaults()
        
        # TEST 6: Regression
        print("\n[TEST 6] Regression - Health and Contact endpoints")
        print("-" * 80)
        test_health()
        test_contact_valid()
        test_contact_invalid_email()
        test_contact_missing_name()
        
    except Exception as e:
        print(f"\n❌ CRITICAL ERROR: {e}")
        import traceback
        traceback.print_exc()
    
    # Summary
    print("\n" + "="*80)
    print("TEST SUMMARY")
    print("="*80)
    
    passed = sum(1 for _, success, _ in test_results if success)
    total = len(test_results)
    
    print(f"\nTotal: {total} tests")
    print(f"Passed: {passed} ✅")
    print(f"Failed: {total - passed} ❌")
    
    if failed_tests:
        print("\n" + "="*80)
        print("FAILED TESTS")
        print("="*80)
        for name, error in failed_tests:
            print(f"\n❌ {name}")
            print(f"   {error}")
    
    print("\n" + "="*80)
    
    if total - passed == 0:
        print("✅ ALL TESTS PASSED")
        return 0
    else:
        print(f"❌ {total - passed} TEST(S) FAILED")
        return 1


if __name__ == "__main__":
    sys.exit(main())
