"""Shared security helpers: admin authentication and per-client rate limiting."""
import hmac
import os
import time
from collections import defaultdict, deque
from threading import Lock

from fastapi import Header, HTTPException, Request


def _is_this_computer(request: Request) -> bool:
    """True only for a direct connection from the same machine, not via any proxy or the internet."""
    if request.headers.get("x-forwarded-for") or request.headers.get("forwarded") or request.headers.get("x-real-ip"):
        return False
    host = request.client.host if request.client else ""
    return host in ("127.0.0.1", "::1", "localhost")


def admin_local_enabled() -> bool:
    return os.environ.get("ADMIN_LOCAL", "").strip().lower() in ("1", "true", "yes", "on")


def require_admin(request: Request, x_admin_token: str = Header(default="")) -> None:
    """Admin actions are allowed:
      1. from this computer, when ADMIN_LOCAL is switched on in backend/.env (no password needed), or
      2. with the ADMIN_API_TOKEN password, if one is set.
    The live website sets neither, so admin routes are simply unavailable there.
    """
    if admin_local_enabled() and _is_this_computer(request):
        return
    expected = os.environ.get("ADMIN_API_TOKEN", "").strip()
    if not expected:
        raise HTTPException(status_code=503, detail="Admin is only available on the computer where admin mode is switched on.")
    if not hmac.compare_digest(x_admin_token.encode("utf-8"), expected.encode("utf-8")):
        raise HTTPException(status_code=401, detail="Invalid admin token.")


def client_ip(request: Request) -> str:
    # Render / Vercel sit behind a proxy; the first X-Forwarded-For hop is the client.
    forwarded = request.headers.get("x-forwarded-for", "")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


class RateLimiter:
    """Sliding-window limiter, in-memory (per process). Use as `Depends(RateLimiter(10, 60))`."""

    def __init__(self, limit: int, window_seconds: int = 60):
        self.limit = limit
        self.window = window_seconds
        self._hits = defaultdict(deque)
        self._lock = Lock()

    def __call__(self, request: Request) -> None:
        key = client_ip(request)
        now = time.monotonic()
        with self._lock:
            hits = self._hits[key]
            while hits and now - hits[0] > self.window:
                hits.popleft()
            if len(hits) >= self.limit:
                retry = max(1, int(self.window - (now - hits[0])))
                raise HTTPException(
                    status_code=429,
                    detail="Too many requests. Please slow down.",
                    headers={"Retry-After": str(retry)},
                )
            hits.append(now)


ai_limit = RateLimiter(limit=20, window_seconds=60)
form_limit = RateLimiter(limit=5, window_seconds=60)
access_limit = RateLimiter(limit=10, window_seconds=60)
