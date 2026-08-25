"""Keep frontend/src/content/defaults.json in sync with backend/default_content.py."""
import json
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "backend"))

from default_content import fresh_defaults  # noqa: E402

target = ROOT / "frontend" / "src" / "content" / "defaults.json"
target.write_text(json.dumps(fresh_defaults(), ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"wrote {target}")
