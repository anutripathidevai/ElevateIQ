"""Bounded recovery from Windows sharing/access conflicts on generated outputs."""
from __future__ import annotations

import json
import logging
from pathlib import Path
import time
from typing import Callable, TypeVar
import uuid


T = TypeVar("T")
RETRY_DELAYS = (0.1, 0.2, 0.4, 0.8, 1.6, 2.0)


def retry_io(operation: Callable[[], T]) -> T:
    """Retry Windows access/sharing conflicts; propagate all other failures."""
    for attempt in range(len(RETRY_DELAYS) + 1):
        try:
            return operation()
        except OSError as error:
            if getattr(error, "winerror", None) not in (5, 32, 33) or attempt == len(RETRY_DELAYS):
                raise
            logging.getLogger("audit").warning(
                "file_access_retry attempt=%s/%s delay_seconds=%s error=%s",
                attempt + 1, len(RETRY_DELAYS), RETRY_DELAYS[attempt], error,
            )
            time.sleep(RETRY_DELAYS[attempt])
    raise AssertionError("Unreachable retry state")


def atomic_write_text(path: Path, text: str, encoding: str = "utf-8") -> None:
    """Keep the previous output intact until its unique temporary file replaces it."""
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_name(f".{path.name}.{uuid.uuid4().hex}.tmp")
    retry_io(lambda: temporary.write_text(text, encoding=encoding))
    retry_io(lambda: temporary.replace(path))


def write_json(path: Path, value: object) -> None:
    atomic_write_text(
        path, json.dumps(value, indent=2, ensure_ascii=True, allow_nan=False) + "\n",
    )
