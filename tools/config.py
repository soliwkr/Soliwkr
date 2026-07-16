"""Shared config helpers for tools.

Every tool imports from here so credentials load consistently and
`.tmp/` paths resolve the same way regardless of the caller's CWD.
"""
from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv

# Project root = one level above this tools/ directory.
ROOT = Path(__file__).resolve().parent.parent
TMP = ROOT / ".tmp"

# Load .env from the project root exactly once on import.
load_dotenv(ROOT / ".env")


def require_env(name: str) -> str:
    """Return an env var or fail loudly with an actionable message."""
    value = os.getenv(name)
    if not value:
        raise RuntimeError(
            f"Missing required env var '{name}'. "
            f"Add it to {ROOT / '.env'} (see .env.example)."
        )
    return value


def get_env(name: str, default: str | None = None) -> str | None:
    """Return an env var or a default (no error if absent)."""
    return os.getenv(name, default)


def tmp_path(*parts: str) -> Path:
    """Build a path inside .tmp/, creating parent dirs as needed."""
    p = TMP.joinpath(*parts)
    p.parent.mkdir(parents=True, exist_ok=True)
    return p
