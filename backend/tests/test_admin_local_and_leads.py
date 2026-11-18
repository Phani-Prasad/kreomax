"""Admin only on the owner's computer, and enquiries stored in the database."""
import json
import os
import sys

import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

import db  # noqa: E402
import leads  # noqa: E402
import main  # noqa: E402
import security  # noqa: E402

THIS_COMPUTER = ("127.0.0.1", 50000)
ELSEWHERE = ("203.0.113.9", 50000)


def _as_caller(app, host):
    """Run the app as if the request came from `host` (the test client always reports 'testclient')."""
    async def wrapped(scope, receive, send):
        if scope["type"] in ("http", "websocket"):
            scope = {**scope, "client": host}
        await app(scope, receive, send)
    return wrapped


def make_client(host=THIS_COMPUTER):
    for limiter in (security.ai_limit, security.form_limit, security.access_limit):
        limiter._hits.clear()
    return TestClient(_as_caller(main.app, host))


@pytest.fixture(autouse=True)
def _no_email(monkeypatch):
    monkeypatch.setattr(main, "send_email_notification", lambda record: True)


# ── admin only on this computer ──────────────────────────────────────────────

def test_admin_works_from_this_computer_without_a_password(monkeypatch):
    monkeypatch.setenv("ADMIN_LOCAL", "1")
    assert make_client().get("/api/admin/access").status_code == 200


def test_admin_is_off_when_local_mode_is_not_switched_on():
    assert make_client().get("/api/admin/access").status_code == 503


def test_admin_refuses_other_computers_even_in_local_mode(monkeypatch):
    monkeypatch.setenv("ADMIN_LOCAL", "1")
    assert make_client(ELSEWHERE).get("/api/admin/access").status_code == 503


@pytest.mark.parametrize("header", ["x-forwarded-for", "x-real-ip", "forwarded"])
def test_admin_refuses_requests_that_came_through_a_proxy(monkeypatch, header):
    """On a host such as Render every request is proxied, so loopback tricks must not work."""
    monkeypatch.setenv("ADMIN_LOCAL", "1")
    res = make_client().get("/api/admin/access", headers={header: "198.51.100.7"})
    assert res.status_code == 503


def test_optional_password_still_works_from_anywhere(monkeypatch):
    monkeypatch.setenv("ADMIN_API_TOKEN", "s3cret")
    client = make_client(ELSEWHERE)
    assert client.get("/api/admin/access", headers={"X-Admin-Token": "wrong"}).status_code == 401
    assert client.get("/api/admin/access", headers={"X-Admin-Token": "s3cret"}).status_code == 200


def test_every_admin_route_is_protected(monkeypatch):
    client = make_client(ELSEWHERE)
    for method, path in [("get", "/api/admin/access"), ("post", "/api/admin/access"), ("get", "/api/admissions/list"),
                         ("post", "/api/admin/access/ABCD2345/revoke"), ("get", "/api/admissions/test-email"),
                         ("post", "/api/ai/gateway/save-keys")]:
        assert getattr(client, method)(path).status_code == 503, path


# ── enquiries in the database ────────────────────────────────────────────────

APPLICATION = {"planId": "cohort-24h", "planName": "Creator Cohort", "studentName": "Arjun Mehta",
               "studentEmail": "arjun@example.com", "studentPhone": "9123456780", "studentGrade": "Grade 9"}


def test_enquiry_is_saved_and_listed(monkeypatch):
    monkeypatch.setenv("ADMIN_LOCAL", "1")
    client = make_client()
    res = client.post("/api/admissions/apply", json=APPLICATION)
    assert res.status_code == 200
    app_id = res.json()["applicationId"]
    assert app_id.startswith("KMX-ADM-")
    rows = client.get("/api/admissions/list").json()["applications"]
    assert [r["applicationId"] for r in rows] == [app_id]
    assert rows[0]["studentName"] == "Arjun Mehta" and rows[0]["timestamp"]


def test_enquiries_survive_a_restart(monkeypatch, _isolated_db):
    monkeypatch.setenv("ADMIN_LOCAL", "1")
    client = make_client()
    client.post("/api/admissions/apply", json=APPLICATION)
    db.reset(_isolated_db)  # a fresh process, same database
    assert len(client.get("/api/admissions/list").json()["applications"]) == 1


def test_application_ids_are_unique():
    ids = {leads.add("cohort-24h", "Creator Cohort", f"Student {i}", "a@b.co", "9123456780", "Grade 8", "")["applicationId"] for i in range(50)}
    assert len(ids) == 50


def test_old_json_leads_are_imported_once(tmp_path):
    legacy = tmp_path / "leads_data.json"
    legacy.write_text(json.dumps([{
        "applicationId": "KMX-ADM-00123", "planId": "cohort-24h", "planName": "Creator Cohort", "studentName": "Old Lead",
        "studentEmail": "old@example.com", "studentPhone": "9000000000", "studentGrade": "Grade 8",
        "notes": "", "timestamp": 1700000000, "status": "pending_consultation",
    }]), encoding="utf-8")
    assert leads.import_legacy(str(legacy)) == 1
    assert leads.import_legacy(str(legacy)) == 0  # never twice
    assert leads.list_all()[0]["studentName"] == "Old Lead"


def test_database_url_accepts_the_formats_hosts_give_out(monkeypatch):
    monkeypatch.setattr(db, "_override_url", None)
    monkeypatch.setenv("DATABASE_URL", "postgres://u:p@host.example/dbname?sslmode=require")
    assert db.database_url().startswith("postgresql+psycopg://u:p@host.example/")
    monkeypatch.setenv("DATABASE_URL", "postgresql://u:p@host.example/dbname")
    assert db.database_url().startswith("postgresql+psycopg://")
    assert "p@" not in db.describe()  # never print the password
