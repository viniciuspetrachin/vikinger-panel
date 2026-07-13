#!/usr/bin/env python3
"""Bulk-apply x-text bindings to index.html using en-US.json string values."""

from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
HTML = ROOT / "static" / "index.html"
EN = ROOT / "frontend/locales/en-US.json"

SKIP_VALUES = {"", "—", "✕", "OK", "CPU", "RAM", "DB", "v", "ms"}
MIN_LEN = 3


def flatten(obj, prefix=""):
    out = {}
    if isinstance(obj, dict):
        for k, v in obj.items():
            p = f"{prefix}.{k}" if prefix else k
            out.update(flatten(v, p))
    elif isinstance(obj, list):
        for i, v in enumerate(obj):
            if isinstance(v, str):
                out.setdefault(v, prefix)
            else:
                out.update(flatten(v, prefix))
    elif isinstance(obj, str):
        out.setdefault(obj, prefix)
    return out


def main():
    en = json.loads(EN.read_text(encoding="utf-8"))
    rev = flatten(en)
    # prefer longer / more specific keys — keep first seen for dupes
    items = sorted(rev.items(), key=lambda x: (-len(x[0]), x[0]))

    html = HTML.read_text(encoding="utf-8")
    applied = 0

    for text, key in items:
        if len(text) < MIN_LEN or text in SKIP_VALUES:
            continue
        if "{" in text or text.startswith("http"):
            continue
        esc = re.escape(text)
        # >Text</tag> without existing x-text on same tag
        pat = re.compile(
            rf"(<(?:p|h[1-6]|span|label|button|th|td|option|legend|a)\b(?![^>]*\bx-text=)[^>]*)(>)\s*{esc}\s*(</)",
            re.IGNORECASE,
        )
        def repl_tag(m):
            return f'{m.group(1)} x-text="t(\'{key}\')"{m.group(2)}{text}{m.group(3)}'
        new_html, n = pat.subn(repl_tag, html, count=1)
        if n:
            html = new_html
            applied += 1

        # placeholder="Text"
        pat2 = re.compile(rf'placeholder="{esc}"(?![^>]*:placeholder)')
        new_html, n2 = pat2.subn(f':placeholder="t(\'{key}\')"', html, count=1)
        if n2:
            html = new_html
            applied += 1

    HTML.write_text(html, encoding="utf-8")
    print(f"Applied ~{applied} bindings to {HTML}")


if __name__ == "__main__":
    main()
