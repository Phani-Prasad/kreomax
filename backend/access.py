"""Studio access codes.

A code is created by the admin after someone registers or requests access (for example on WhatsApp),
and sent to them. The student enters it at "Launch Studio". Codes can be switched off at any time.

Storage is a small JSON file (like the enquiry leads). On hosts with a temporary disk (such as the
Render free tier) the file is lost on a redeploy, so use persistent storage before relying on it.
"""
import json
import os
import re
import secrets
import threading
import time
from typing import Optional

from fastapi import Header, HTTPException

ACCESS_PATH = os.environ.get("ACCESS_FILE") or os.path.join(os.path.dirname(__file__), "access_data.json")

# No 0/O, 1/I/L: easy to read out or type from a WhatsApp message.
_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"
_lock = threading.Lock()
_records: dict = {}


def _load() -> dict:
    try:
        with open(ACCESS_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
            return {r["code"]: r for r in data if isinstance(r, dict) and "code" in r}
    except (OSError, ValueError, KeyError):
        return {}


def _save() -> None:
    tmp = ACCESS_PATH + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(list(_records.values()), f, indent=2)
    os.replace(tmp, ACCESS_PATH)


def reset(path: Optional[str] = None) -> None:
    """Point the store at a different file and reload it (used by tests)."""
    global ACCESS_PATH, _records
    if path:
        ACCESS_PATH = path
    _records = _load()


_records = _load()


def normalize(code: str) -> str:
    return re.sub(r"[^A-Z0-9]", "", (code or "").upper())


def pretty(code: str) -> str:
    return f"{code[:4]}-{code[4:]}" if len(code) == 8 else code


def _new_code() -> str:
    while True:
        code = "".join(secrets.choice(_ALPHABET) for _ in range(8))
        if code not in _records:
            return code


def _public(rec: dict) -> dict:
    return {**rec, "display": pretty(rec["code"])}


def create(name: str, phone: str = "", application_id: Optional[str] = None, note: str = "") -> dict:
    with _lock:
        code = _new_code()
        rec = {
            "code": code,
            "name": name.strip(),
            "phone": phone.strip(),
            "applicationId": application_id,
            "note": note.strip(),
            "status": "active",
            "createdAt": int(time.time()),
            "lastUsedAt": None,
            "uses": 0,
        }
        _records[code] = rec
        _save()
        return _public(rec)


def list_records() -> list:
    with _lock:
        return [_public(r) for r in sorted(_records.values(), key=lambda r: r["createdAt"], reverse=True)]


def set_status(code: str, status: str) -> Optional[dict]:
    code = normalize(code)
    with _lock:
        rec = _records.get(code)
        if not rec:
            return None
        rec["status"] = status
        _save()
        return _public(rec)


def verify(code: str, touch: bool = True) -> Optional[dict]:
    """Return the record for an active code, or None."""
    code = normalize(code)
    with _lock:
        rec = _records.get(code)
        if not rec or rec["status"] != "active":
            return None
        if touch:
            rec["lastUsedAt"] = int(time.time())
            rec["uses"] = rec.get("uses", 0) + 1
            _save()
        return _public(rec)


def require_access(x_access_code: str = Header(default="")) -> dict:
    """FastAPI dependency: the request must carry a valid, active access code."""
    rec = verify(x_access_code, touch=False)
    if not rec:
        raise HTTPException(status_code=401, detail="Studio access is required. Enter your access code.")
    return rec
