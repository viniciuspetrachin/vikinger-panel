#!/usr/bin/env python3
"""Upload .github/social-preview.jpg to GitHub repo Settings (Social preview).

GitHub has no public API for this — uses Playwright with a saved browser session.
Run once after cloning:

  1. panel/.venv/bin/playwright install chromium
  2. panel/.venv/bin/python scripts/upload-social-preview.py --login
  3. panel/.venv/bin/python scripts/upload-social-preview.py

Requires admin access to the repository.
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

REPO = "viniciuspetrachin/vikinger-panel"
ROOT = Path(__file__).resolve().parents[1]
DEFAULT_IMAGE = ROOT / ".github" / "social-preview.jpg"
STATE_DIR = Path.home() / ".local" / "state" / "vikinger-panel"
STATE_FILE = STATE_DIR / "github-auth.json"


def _require_playwright():
    try:
        from playwright.sync_api import sync_playwright
    except ImportError as exc:
        raise SystemExit(
            "Playwright not installed. Run: panel/.venv/bin/pip install playwright && "
            "panel/.venv/bin/playwright install chromium"
        ) from exc
    return sync_playwright


def login(base_url: str) -> None:
    sync_playwright = _require_playwright()
    STATE_DIR.mkdir(parents=True, exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        context = browser.new_context(viewport={"width": 1280, "height": 720})
        page = context.new_page()
        page.goto(f"{base_url}/login", wait_until="domcontentloaded")
        print("Sign in to GitHub in the browser window. Waiting for login...")
        page.wait_for_function(
            "() => document.querySelector('meta[name=\"user-login\"]')?.content?.trim()",
            timeout=0,
        )
        context.storage_state(path=str(STATE_FILE))
        browser.close()
    print(f"Session saved to {STATE_FILE}")


def upload(image: Path, base_url: str, headless: bool) -> None:
    if not STATE_FILE.exists():
        raise SystemExit(f"No session at {STATE_FILE}. Run: {Path(__file__).name} --login")
    if not image.is_file():
        raise SystemExit(f"Image not found: {image}")

    sync_playwright = _require_playwright()
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=headless)
        context = browser.new_context(
            storage_state=str(STATE_FILE),
            viewport={"width": 1280, "height": 720},
        )
        page = context.new_page()
        settings_url = f"{base_url}/{REPO}/settings"
        print(f"Opening {settings_url}")
        page.goto(settings_url, wait_until="domcontentloaded", timeout=60_000)

        if "login" in page.url:
            raise SystemExit("Session expired. Run with --login again.")

        page.wait_for_function(
            "() => [...document.querySelectorAll('h2')]"
            ".some(h => h.textContent.includes('Social preview'))",
            timeout=30_000,
        )
        page.locator("summary:has-text('Edit'), #edit-social-preview-button").first.click()

        file_input = page.locator("input#repo-image-file-input")
        if file_input.count():
            file_input.first.set_input_files(str(image))
        else:
            with page.expect_file_chooser() as fc_info:
                page.get_by_text("Upload an image", exact=False).first.click()
            fc_info.value.set_files(str(image))

        page.wait_for_function(
            "() => {"
            "  const input = document.querySelector('input.js-repository-image-id');"
            "  return input && (input.value || '').trim();"
            "}",
            timeout=30_000,
        )
        context.storage_state(path=str(STATE_FILE))
        page.goto(f"{base_url}/{REPO}", wait_until="domcontentloaded")
        og = page.evaluate(
            "() => document.querySelector('meta[property=\"og:image\"]')?.content || ''"
        )
        browser.close()

    print("Social preview uploaded.")
    if og:
        print(f"og:image → {og}")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--login", action="store_true", help="Save GitHub browser session")
    parser.add_argument("--image", type=Path, default=DEFAULT_IMAGE)
    parser.add_argument("--base-url", default="https://github.com")
    parser.add_argument("--headed", action="store_true", help="Show browser during upload")
    args = parser.parse_args()

    if args.login:
        login(args.base_url)
        return
    upload(args.image, args.base_url, headless=not args.headed)


if __name__ == "__main__":
    main()
