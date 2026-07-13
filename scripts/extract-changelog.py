#!/usr/bin/env python3
"""Generate panel/changelog_data.json from CHANGELOG.md."""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "panel"))

from changelog import CHANGELOG_JSON, CHANGELOG_MD, write_changelog_json  # noqa: E402


def main() -> int:
    if not CHANGELOG_MD.exists():
        print(f"Missing {CHANGELOG_MD}", file=sys.stderr)
        return 1
    data = write_changelog_json(CHANGELOG_JSON)
    count = len(data.get("versions", []))
    print(f"Wrote {CHANGELOG_JSON} ({count} versions)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
