"""Studio access codes, stored in the database (see db.py).

A code is created by the admin after someone registers or requests access (for example on WhatsApp),
and sent to them. The student enters it at "Launch Studio". Codes can be switched off at any time.
"""
import re
import secrets
import time
from typing import Optional

from fastapi import Header, HTTPException
from sqlalchemy import insert, select, update
from sqlalchemy.exc import IntegrityError

from db import access_codes, get_engine, reset as _db_reset

# No 0/O, 1/I/L: easy to read out or type from a WhatsApp message.
_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"


def reset(url: Optional[str] = None) -> None:
    """Switch to another database (used by tests)."""
    _db_reset(url)


def normalize(code: str) -> str:
    return re.sub(r"[^A-Z0-9]", "", (code or "").upper())


def pretty(code: str) -> str:
    return f"{code[:4]}-{code[4:]}" if len(code) == 8 else code


def _public(row) -> dict:
    return {
        "code": row["code"], "display": pretty(row["code"]), "name": row["name"], "phone": row["phone"],
        "applicationId": row["application_id"], "note": row["note"], "status": row["status"],
        "createdAt": row["created_at"], "lastUsedAt": row["last_used_at"], "uses": row["uses"],
    }


def _get(conn, code: str):
    return conn.execute(select(access_codes).where(access_codes.c.code == code)).mappings().first()


def create(name: str, phone: str = "", application_id: Optional[str] = None, note: str = "") -> dict:
    now = int(time.time())
    for _ in range(10):
        code = "".join(secrets.choice(_ALPHABET) for _ in range(8))
        try:
            with get_engine().begin() as conn:
                conn.execute(insert(access_codes).values(
                    code=code, name=name.strip(), phone=phone.strip(), application_id=application_id,
                    note=note.strip(), status="active", created_at=now, last_used_at=None, uses=0,
                ))
                return _public(_get(conn, code))
        except IntegrityError:
            continue
    raise RuntimeError("Could not allocate an access code.")


def list_records() -> list:
    with get_engine().connect() as conn:
        rows = conn.execute(select(access_codes).order_by(access_codes.c.created_at.desc())).mappings().all()
    return [_public(r) for r in rows]


def set_status(code: str, status: str) -> Optional[dict]:
    code = normalize(code)
    with get_engine().begin() as conn:
        if not _get(conn, code):
            return None
        conn.execute(update(access_codes).where(access_codes.c.code == code).values(status=status))
        return _public(_get(conn, code))


def verify(code: str, touch: bool = True) -> Optional[dict]:
    """Return the record for an active code, or None."""
    code = normalize(code)
    if len(code) != 8:
        return None
    with get_engine().begin() as conn:
        row = _get(conn, code)
        if not row or row["status"] != "active":
            return None
        if touch:
            conn.execute(update(access_codes).where(access_codes.c.code == code)
                         .values(last_used_at=int(time.time()), uses=access_codes.c.uses + 1))
            row = _get(conn, code)
        return _public(row)


def require_access(x_access_code: str = Header(default="")) -> dict:
    """FastAPI dependency: the request must carry a valid, active access code."""
    rec = verify(x_access_code, touch=False)
    if not rec:
        raise HTTPException(status_code=401, detail="Studio access is required. Enter your access code.")
    return rec
