"""Database connection and tables.

Set DATABASE_URL to a hosted Postgres database (for example Neon or Supabase) so enquiries and studio
access codes survive redeploys, and so the website and the admin on your computer share the same data.

With no DATABASE_URL the app falls back to a local SQLite file (backend/kreomax.db). That is fine for
trying things out on your computer, but it is NOT shared with the live website.
"""
import os
import threading

from sqlalchemy import BigInteger, Column, Integer, MetaData, String, Table, Text, create_engine
from sqlalchemy.engine import Engine

metadata = MetaData()

access_codes = Table(
    "access_codes", metadata,
    Column("code", String(8), primary_key=True),
    Column("name", String(100), nullable=False),
    Column("phone", String(20), nullable=False, default=""),
    Column("application_id", String(40)),
    Column("note", String(300), nullable=False, default=""),
    Column("status", String(10), nullable=False, default="active"),
    Column("created_at", BigInteger, nullable=False),
    Column("last_used_at", BigInteger),
    Column("uses", Integer, nullable=False, default=0),
)

applications = Table(
    "applications", metadata,
    Column("application_id", String(40), primary_key=True),
    Column("plan_id", String(64), nullable=False),
    Column("plan_name", String(120), nullable=False, default=""),
    Column("student_name", String(100), nullable=False),
    Column("student_email", String(200), nullable=False, default=""),
    Column("student_phone", String(20), nullable=False, default=""),
    Column("student_grade", String(40), nullable=False, default=""),
    Column("notes", Text, nullable=False, default=""),
    Column("created_at", BigInteger, nullable=False),
    Column("status", String(40), nullable=False, default="pending_consultation"),
)

_engine: Engine | None = None
_lock = threading.Lock()
_override_url: str | None = None


def database_url() -> str:
    url = (_override_url or os.environ.get("DATABASE_URL", "")).strip()
    if not url:
        path = os.path.join(os.path.dirname(__file__), "kreomax.db")
        return f"sqlite:///{path}"
    # Hosted providers hand out postgres:// or postgresql:// URLs; use the psycopg 3 driver explicitly.
    for prefix in ("postgres://", "postgresql://"):
        if url.startswith(prefix):
            return "postgresql+psycopg://" + url[len(prefix):]
    return url


def get_engine() -> Engine:
    """Created on first use, so the environment (.env) is already loaded."""
    global _engine
    with _lock:
        if _engine is None:
            url = database_url()
            kwargs = {"pool_pre_ping": True}
            if url.startswith("sqlite"):
                kwargs["connect_args"] = {"check_same_thread": False}
            _engine = create_engine(url, **kwargs)
        return _engine


def init_db() -> None:
    """Create the tables if they do not exist yet. Safe to run on every start."""
    metadata.create_all(get_engine())


def reset(url: str | None = None) -> None:
    """Point at a different database and make sure its tables exist (used by tests)."""
    global _engine, _override_url
    with _lock:
        if _engine is not None:
            _engine.dispose()
            _engine = None
        _override_url = url
    init_db()


def describe() -> str:
    """Which database is in use, without leaking the password."""
    url = database_url()
    if url.startswith("sqlite"):
        return "local SQLite file (not shared with the live website)"
    try:
        host = url.split("@", 1)[1].split("/", 1)[0]
    except IndexError:
        host = "hosted database"
    return f"hosted database at {host}"
