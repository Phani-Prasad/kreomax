"""Security regression tests for the public API surface."""
import os
import sys

import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

import main  # noqa: E402
import security  # noqa: E402


@pytest.fixture()
def client(monkeypatch):
    monkeypatch.setattr(main, "send_email_notification", lambda record: True)
    for limiter in (security.ai_limit, security.form_limit):
        limiter._hits.clear()
    return TestClient(main.app)


ADMIN_ROUTES = [
    ("get", "/api/admissions/list"),
    ("get", "/api/admissions/test-email"),
    ("post", "/api/ai/gateway/save-keys"),
    ("post", "/api/ai/set-key"),
]


@pytest.mark.parametrize("method,path", ADMIN_ROUTES)
def test_admin_routes_disabled_without_configured_token(client, monkeypatch, method, path):
    monkeypatch.delenv("ADMIN_API_TOKEN", raising=False)
    res = getattr(client, method)(path, headers={"X-Admin-Token": "anything"})
    assert res.status_code == 503


@pytest.mark.parametrize("method,path", ADMIN_ROUTES)
def test_admin_routes_reject_wrong_token(client, monkeypatch, method, path):
    monkeypatch.setenv("ADMIN_API_TOKEN", "s3cret")
    res = getattr(client, method)(path, headers={"X-Admin-Token": "wrong"})
    assert res.status_code == 401


def test_admin_list_allows_correct_token(client, monkeypatch):
    monkeypatch.setenv("ADMIN_API_TOKEN", "s3cret")
    res = client.get("/api/admissions/list", headers={"X-Admin-Token": "s3cret"})
    assert res.status_code == 200


def test_admission_rejects_bad_input(client):
    res = client.post("/api/admissions/apply", json={
        "planId": "cohort-24h", "studentName": "A", "studentEmail": "nope",
        "studentPhone": "abc",
    })
    assert res.status_code == 422


def test_admission_rate_limited(client):
    body = {"planId": "cohort-24h", "studentName": "Asha Rao",
            "studentEmail": "asha@example.com", "studentPhone": "9876543210"}
    codes = [client.post("/api/admissions/apply", json=body).status_code for _ in range(7)]
    assert codes[:5] == [200] * 5
    assert 429 in codes[5:]


def test_payment_endpoints_are_gone(client):
    for method, path in [("get", "/api/payment/config"), ("post", "/api/payment/create-order"),
                         ("post", "/api/payment/verify"), ("get", "/api/payment/transactions")]:
        assert getattr(client, method)(path).status_code in (404, 405)


def test_public_config_lists_programmes_without_prices(client):
    res = client.get("/api/public/config")
    assert res.status_code == 200
    plans = res.json()["plans"]
    assert {p["id"] for p in plans} == {"cohort-24h", "training-1on1-30h"}
    for p in plans:
        assert "price" not in p and "originalPrice" not in p and "currency" not in p


def test_cors_does_not_allow_arbitrary_origin(client):
    res = client.options("/api/health", headers={
        "Origin": "https://evil.example", "Access-Control-Request-Method": "GET"})
    assert "access-control-allow-origin" not in res.headers
