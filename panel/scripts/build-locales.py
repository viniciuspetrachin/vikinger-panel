#!/usr/bin/env python3
"""Regenerate Vikinger Panel locale JSON files from en-US + per-locale overrides."""

from __future__ import annotations

import json
import sys
from copy import deepcopy
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LOCALES_DIR = ROOT / "frontend" / "locales"
LOCALE_CODES = ("en-US", "pt-BR", "de-DE", "ru-RU", "es-ES")


def deep_merge(base: dict, extra: dict) -> dict:
    out = deepcopy(base)
    for key, value in extra.items():
        if key in out and isinstance(out[key], dict) and isinstance(value, dict):
            out[key] = deep_merge(out[key], value)
        else:
            out[key] = deepcopy(value)
    return out


def apply_string_map(obj, mapping: dict[str, str]):
    if isinstance(obj, dict):
        return {k: apply_string_map(v, mapping) for k, v in obj.items()}
    if isinstance(obj, list):
        return [apply_string_map(v, mapping) for v in obj]
    if isinstance(obj, str):
        return mapping.get(obj, obj)
    return obj


def collect_strings(obj, out: set[str] | None = None) -> set[str]:
    out = out or set()
    if isinstance(obj, dict):
        for v in obj.values():
            collect_strings(v, out)
    elif isinstance(obj, list):
        for v in obj:
            collect_strings(v, out)
    elif isinstance(obj, str):
        out.add(obj)
    return out


def count_strings(obj) -> int:
    if isinstance(obj, dict):
        return sum(count_strings(v) for v in obj.values())
    if isinstance(obj, list):
        return sum(count_strings(v) for v in obj)
    if isinstance(obj, str):
        return 1
    return 0


def load_overrides() -> dict[str, dict]:
    from locale_translations import LOCALE_OVERRIDES, STRING_MAPS  # noqa: PLC0415

    return LOCALE_OVERRIDES, STRING_MAPS


def build_locale(locale: str, en_base: dict, overrides: dict, string_maps: dict) -> dict:
    if locale == "en-US":
        out = deepcopy(en_base)
        out["meta"]["locale"] = "en-US"
        return out
    path = LOCALES_DIR / f"{locale}.json"
    if path.exists():
        out = json.loads(path.read_text(encoding="utf-8"))
    else:
        out = deepcopy(en_base)
    if locale in overrides:
        out = deep_merge(out, overrides[locale])
    if locale in string_maps:
        out = apply_string_map(out, string_maps[locale])
    out["meta"]["locale"] = locale
    return out


def main() -> int:
    en_path = LOCALES_DIR / "en-US.json"
    if not en_path.exists():
        print(f"Missing {en_path}", file=sys.stderr)
        return 1

    en_base = json.loads(en_path.read_text(encoding="utf-8"))
    overrides, string_maps = load_overrides()

    for locale in LOCALE_CODES:
        if locale == "en-US":
            continue
        mapped = set(string_maps.get(locale, {}))
        missing = sorted(collect_strings(en_base) - mapped - set(overrides.get(locale, {}).keys()))
        if missing and locale == "pt-BR":
            print(f"Note: {locale} has {len(missing)} strings still in English (fallback at runtime)", file=sys.stderr)

    for locale in LOCALE_CODES:
        data = build_locale(locale, en_base, overrides, string_maps)
        path = LOCALES_DIR / f"{locale}.json"
        path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"Wrote {path} ({count_strings(data)} strings)")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
