#!/usr/bin/env python3
"""Auto-translate en-US.json to pt-BR, de-DE, ru-RU, es-ES using deep-translator."""

from __future__ import annotations

import json
import re
import sys
import time
from copy import deepcopy
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LOCALES_DIR = ROOT / "frontend" / "locales"
TARGETS = {
    "pt-BR": "pt",
    "de-DE": "de",
    "ru-RU": "ru",
    "es-ES": "es",
}

# Protect placeholders and HTML-ish tokens from translation
PLACEHOLDER_RE = re.compile(r"(\{[a-zA-Z_]+\}|<[^>]+>|`[^`]+`)")

# Short technical/gaming terms — never send to the translator
KEEP_AS_IS = frozenset({
    "RAM", "CPU", "FPS", "ms", "Mods", "mods", "mod", "Mod",
    "Plugins", "Docker", "Kick", "Ban", "Form", "Raw",
    "Config", "BepInEx", "RCON", "DLL", "DLLs", "UDP", "Steam",
    "Backups", "Backup", "Audit", "Overview", "Console",
})


def protect(text: str) -> tuple[str, list[str]]:
    tokens: list[str] = []

    def repl(m: re.Match) -> str:
        tokens.append(m.group(0))
        return f"@@{len(tokens) - 1}@@"

    return PLACEHOLDER_RE.sub(repl, text), tokens


def unprotect(text: str, tokens: list[str]) -> str:
    for i, tok in enumerate(tokens):
        text = text.replace(f"@@{i}@@", tok)
    return text


def collect_strings(obj, out: dict[str, None] | None = None) -> dict[str, None]:
    if out is None:
        out = {}
    if isinstance(obj, dict):
        for v in obj.values():
            collect_strings(v, out)
    elif isinstance(obj, list):
        for v in obj:
            collect_strings(v, out)
    elif isinstance(obj, str):
        out[obj] = None
    return out


def apply_map(obj, mapping: dict[str, str]):
    if isinstance(obj, dict):
        return {k: apply_map(v, mapping) for k, v in obj.items()}
    if isinstance(obj, list):
        return [apply_map(v, mapping) for v in obj]
    if isinstance(obj, str):
        return mapping.get(obj, obj)
    return obj


def translate_batch(translator, strings: list[str], cache: dict[str, str]) -> None:
    pending = [s for s in strings if s not in cache]
    for i, s in enumerate(pending):
        if not s.strip():
            cache[s] = s
            continue
        if s in KEEP_AS_IS:
            cache[s] = s
            continue
        protected, tokens = protect(s)
        try:
            translated = translator.translate(protected)
            translated = unprotect(translated, tokens)
            if not translated or translated == "null":
                translated = s
            cache[s] = translated
        except Exception as e:
            print(f"  warn: failed '{s[:50]}...': {e}", file=sys.stderr)
            cache[s] = s
        if (i + 1) % 25 == 0:
            print(f"  translated {i + 1}/{len(pending)}...")
            time.sleep(0.5)


def main() -> int:
    import argparse

    parser = argparse.ArgumentParser(description="Auto-translate en-US.json to target locales")
    parser.add_argument(
        "--locales",
        default="",
        help="Comma-separated locale codes (default: all targets)",
    )
    parser.add_argument(
        "--fresh-cache",
        action="store_true",
        help="Ignore existing .cache-*.json files",
    )
    args = parser.parse_args()

    try:
        from deep_translator import GoogleTranslator
    except ImportError:
        print("Install: panel/.venv/bin/pip install deep-translator", file=sys.stderr)
        return 1

    en_path = LOCALES_DIR / "en-US.json"
    en = json.loads(en_path.read_text(encoding="utf-8"))
    unique = list(collect_strings(en).keys())
    print(f"Translating {len(unique)} unique strings...")

    targets = TARGETS
    if args.locales.strip():
        codes = {c.strip() for c in args.locales.split(",") if c.strip()}
        targets = {k: v for k, v in TARGETS.items() if k in codes}
        if not targets:
            print("No matching locales", file=sys.stderr)
            return 1

    for locale, target in targets.items():
        print(f"\n=== {locale} ===")
        cache_path = LOCALES_DIR / f".cache-{locale}.json"
        cache: dict[str, str] = {}
        if cache_path.exists() and not args.fresh_cache:
            cache = json.loads(cache_path.read_text(encoding="utf-8"))

        translator = GoogleTranslator(source="en", target=target)
        translate_batch(translator, unique, cache)
        cache_path.write_text(json.dumps(cache, ensure_ascii=False, indent=2), encoding="utf-8")

        data = apply_map(deepcopy(en), cache)
        data["meta"]["locale"] = locale
        out_path = LOCALES_DIR / f"{locale}.json"
        out_path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"Wrote {out_path}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
