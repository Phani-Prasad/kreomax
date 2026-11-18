"""Shared security helpers: admin authentication and per-client rate limiting."""
import hmac
import os
import time
from collections import defaultdict, deque
from threading import Lock

from fastapi import Header, HTTPException, Request


def require_admin(x_admin_token: str = Header(default="")) -> None:
    """FastAPI dependency. Fails closed: if ADMIN_API_TOKEN is unset, admin routes are disabled."""
    expected = os.environ.get("ADMIN_API_TOKEN", "").strip()
    if not expected:
        raise HTTPException(status_code=503, detail="Admin access is not configured on this server.")
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
