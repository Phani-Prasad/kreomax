"""Every test gets its own empty database and a clean admin configuration."""
import os
import sys

import pytest

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

import db  # noqa: E402


@pytest.fixture(autouse=True)
def _isolated_db(tmp_path, monkeypatch):
    url = f"sqlite:///{tmp_path / 'test.db'}"
    monkeypatch.delenv("DATABASE_URL", raising=False)
    monkeypatch.delenv("ADMIN_LOCAL", raising=False)
    monkeypatch.delenv("ADMIN_API_TOKEN", raising=False)
    db.reset(url)
    return url
