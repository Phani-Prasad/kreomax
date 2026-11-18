"""Enquiries submitted through the website's application form, stored in the database."""
import json
import os
import secrets
import time
from typing import Optional

from sqlalchemy import insert, select
from sqlalchemy.exc import IntegrityError

from db import applications, get_engine


def _row_to_record(row) -> dict:
    """Same shape the API has always returned."""
    return {
        "applicationId": row["application_id"],
        "planId": row["plan_id"],
        "planName": row["plan_name"],
        "studentName": row["student_name"],
        "studentEmail": row["student_email"],
        "studentPhone": row["student_phone"],
        "studentGrade": row["student_grade"],
        "notes": row["notes"],
        "timestamp": row["created_at"],
        "status": row["status"],
    }


def add(plan_id: str, plan_name: str, name: str, email: str, phone: str, grade: str, notes: str) -> dict:
    """Save an enquiry and return it. The id is random, and retried in the unlikely event of a clash."""
    now = int(time.time())
    for _ in range(5):
        application_id = f"KMX-ADM-{secrets.token_hex(3).upper()}"
        try:
            with get_engine().begin() as conn:
                conn.execute(insert(applications).values(
                    application_id=application_id, plan_id=plan_id, plan_name=plan_name or "",
                    student_name=name, student_email=email or "", student_phone=phone or "",
                    student_grade=grade or "", notes=notes or "", created_at=now, status="pending_consultation",
                ))
            break
        except IntegrityError:
            continue
    else:
        raise RuntimeError("Could not allocate an application id.")
    return {
        "applicationId": application_id, "planId": plan_id, "planName": plan_name, "studentName": name,
        "studentEmail": email, "studentPhone": phone, "studentGrade": grade, "notes": notes,
        "timestamp": now, "status": "pending_consultation",
    }


def list_all() -> list:
    with get_engine().connect() as conn:
        rows = conn.execute(select(applications).order_by(applications.c.created_at.desc())).mappings().all()
    return [_row_to_record(r) for r in rows]


def import_legacy(path: Optional[str]) -> int:
    """One-off: bring in leads from the old leads_data.json when the table is still empty."""
    if not path or not os.path.exists(path):
        return 0
    with get_engine().connect() as conn:
        if conn.execute(select(applications.c.application_id).limit(1)).first():
            return 0
    try:
        with open(path, "r", encoding="utf-8") as f:
            old = json.load(f)
    except (OSError, ValueError):
        return 0
    imported = 0
    with get_engine().begin() as conn:
        for r in old if isinstance(old, list) else []:
            try:
                conn.execute(insert(applications).values(
                    application_id=str(r.get("applicationId")), plan_id=str(r.get("planId", "")),
                    plan_name=r.get("planName") or "", student_name=r.get("studentName") or "",
                    student_email=r.get("studentEmail") or "", student_phone=r.get("studentPhone") or "",
                    student_grade=r.get("studentGrade") or "", notes=r.get("notes") or "",
                    created_at=int(r.get("timestamp") or time.time()), status=r.get("status") or "pending_consultation",
                ))
                imported += 1
            except (IntegrityError, ValueError):
                continue
    return imported
