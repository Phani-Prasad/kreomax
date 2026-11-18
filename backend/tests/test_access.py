"""Studio access codes: creation, checking, switching off, and protection of the AI endpoints."""
import os
import sys

import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

import access  # noqa: E402
import db  # noqa: E402
import main  # noqa: E402
import security  # noqa: E402

ADMIN = {"X-Admin-Token": "s3cret"}


@pytest.fixture()
def client(monkeypatch):
    monkeypatch.setenv("ADMIN_API_TOKEN", "s3cret")
    for limiter in (security.ai_limit, security.form_limit, security.access_limit):
        limiter._hits.clear()
    return TestClient(main.app)


def make_code(client, name="Maya Rao", phone="9876543210"):
    res = client.post("/api/admin/access", json={"name": name, "phone": phone}, headers=ADMIN)
    assert res.status_code == 200
    return res.json()["access"]


def test_admin_routes_need_the_admin_token(client):
    assert client.get("/api/admin/access").status_code in (401, 503)
    assert client.get("/api/admin/access", headers={"X-Admin-Token": "wrong"}).status_code == 401
    assert client.post("/api/admin/access", json={"name": "A"}).status_code in (401, 503)


def test_created_code_is_readable_and_valid(client):
    rec = make_code(client)
    assert len(rec["code"]) == 8
    assert not set(rec["code"]) & set("01OIL")  # no look-alike characters
    assert rec["display"] == f"{rec['code'][:4]}-{rec['code'][4:]}"
    res = client.post("/api/access/verify", json={"code": rec["display"].lower()})  # case and dash tolerant
    assert res.status_code == 200
    assert res.json()["name"] == "Maya Rao"


def test_unknown_code_is_rejected(client):
    assert client.post("/api/access/verify", json={"code": "ZZZZ-ZZZZ"}).status_code == 401


def test_revoked_code_stops_working_and_can_be_restored(client):
    rec = make_code(client)
    assert client.post(f"/api/admin/access/{rec['code']}/revoke", headers=ADMIN).status_code == 200
    assert client.post("/api/access/verify", json={"code": rec["code"]}).status_code == 401
    assert client.post(f"/api/admin/access/{rec['code']}/restore", headers=ADMIN).status_code == 200
    assert client.post("/api/access/verify", json={"code": rec["code"]}).status_code == 200


def test_use_is_recorded(client):
    rec = make_code(client)
    client.post("/api/access/verify", json={"code": rec["code"]})
    client.post("/api/access/verify", json={"code": rec["code"]})
    listed = client.get("/api/admin/access", headers=ADMIN).json()["access"]
    assert listed[0]["uses"] == 2 and listed[0]["lastUsedAt"]


def test_verify_is_rate_limited(client):
    codes = [client.post("/api/access/verify", json={"code": "AAAAAAAA"}).status_code for _ in range(12)]
    assert codes[:10] == [401] * 10
    assert 429 in codes[10:]


@pytest.mark.parametrize("path", [
    "/api/ai/image-generate", "/api/ai/story-generate", "/api/ai/notebooklm-chat",
    "/api/ai/trainer-chat", "/api/ai/elevenlabs-voice",
])
def test_ai_routes_need_an_access_code(client, path):
    assert client.post(path, json={}).status_code == 401
    assert client.post(path, json={}, headers={"X-Access-Code": "NOPE"}).status_code == 401


def test_ai_route_accepts_a_valid_code(client):
    rec = make_code(client)
    res = client.post("/api/ai/image-generate", json={"prompt": "a lilac robot"}, headers={"X-Access-Code": rec["code"]})
    assert res.status_code == 200
    # ...and stops once the code is switched off
    client.post(f"/api/admin/access/{rec['code']}/revoke", headers=ADMIN)
    assert client.post("/api/ai/image-generate", json={}, headers={"X-Access-Code": rec["code"]}).status_code == 401


def test_codes_survive_a_restart(client, _isolated_db):
    rec = make_code(client)
    db.reset(_isolated_db)  # simulate a fresh process connecting to the same database
    assert client.post("/api/access/verify", json={"code": rec["code"]}).status_code == 200
