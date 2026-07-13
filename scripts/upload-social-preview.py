#!/usr/bin/env python3
"""Upload .github/social-preview.jpg to GitHub repo Settings (Social preview).

GitHub has no public API for this. Options:

  A) Browser session cookie (recommended on headless servers):

     1. In any browser where you are logged into GitHub, open DevTools →
        Application → Cookies → https://github.com → copy **user_session**
     2. Run:
        GH_SESSION_TOKEN='paste-here' panel/.venv/bin/python scripts/upload-social-preview.py

  B) Playwright saved session (machine with a display):

     panel/.venv/bin/python scripts/upload-social-preview.py --login
     panel/.venv/bin/python scripts/upload-social-preview.py
"""

from __future__ import annotations

import argparse
import os
import re
import sys
import time
from pathlib import Path

REPO = "viniciuspetrachin/vikinger-panel"
OWNER, NAME = REPO.split("/")
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


def _logged_in_meta(page) -> str:
    loc = page.locator('meta[name="user-login"]')
    if not loc.count():
        return ""
    return (loc.first.get_attribute("content") or "").strip()


def _wait_logged_in(page, timeout_s: int = 300) -> str:
    deadline = time.time() + timeout_s
    while time.time() < deadline:
        user = _logged_in_meta(page)
        if user:
            return user
        time.sleep(1)
    return ""


def login(base_url: str, headless: bool) -> None:
    sync_playwright = _require_playwright()
    STATE_DIR.mkdir(parents=True, exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=headless)
        context = browser.new_context(viewport={"width": 1280, "height": 720})
        page = context.new_page()
        page.goto(f"{base_url}/login", wait_until="domcontentloaded", timeout=60_000)

        user = _logged_in_meta(page)
        if not user:
            print("\n=== GitHub login ===")
            print(f"Sign in at {base_url}/login in the browser window (2FA if enabled).")
            print("Waiting up to 5 minutes...\n")
            user = _wait_logged_in(page, timeout_s=300)
            if not user:
                raise SystemExit("Login timed out.")

        print(f"Signed in as @{user}")
        context.storage_state(path=str(STATE_FILE))
        browser.close()

    print(f"Session saved to {STATE_FILE}")


def upload_playwright(image: Path, base_url: str, headless: bool) -> None:
    if not STATE_FILE.exists():
        raise SystemExit(f"No session at {STATE_FILE}. Use GH_SESSION_TOKEN or --login.")
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

        if "login" in page.url or not _logged_in_meta(page):
            raise SystemExit("Session expired. Use GH_SESSION_TOKEN or --login again.")

        page.locator("h2", has_text="Social preview").first.wait_for(timeout=30_000)

        edit = page.locator("#edit-social-preview-button")
        if edit.count():
            edit.first.click()
        else:
            page.locator("summary", has_text="Edit").first.click()

        file_input = page.locator("input#repo-image-file-input")
        if file_input.count():
            file_input.first.set_input_files(str(image))
        else:
            with page.expect_file_chooser() as fc_info:
                page.get_by_text("Upload an image", exact=False).first.click()
            fc_info.value.set_files(str(image))

        image_id = page.locator("input.js-repository-image-id")
        deadline = time.time() + 30
        value = ""
        while time.time() < deadline:
            if image_id.count():
                value = (image_id.first.input_value() or "").strip()
                if value:
                    break
            time.sleep(0.5)
        if not value:
            raise SystemExit("Upload did not complete — image id missing.")

        context.storage_state(path=str(STATE_FILE))
        page.goto(f"{base_url}/{REPO}", wait_until="domcontentloaded")
        og_loc = page.locator('meta[property="og:image"]')
        og = og_loc.first.get_attribute("content") if og_loc.count() else ""
        browser.close()

    print("Social preview uploaded.")
    if og:
        print(f"og:image → {og}")


def upload_http(image: Path, session_token: str, base_url: str = "https://github.com") -> None:
    import requests

    if not image.is_file():
        raise SystemExit(f"Image not found: {image}")

    user = os.environ.get("GITHUB_USER") or ""
    if not user:
        try:
            import subprocess

            user = (
                subprocess.check_output(["gh", "api", "user", "--jq", ".login"], text=True).strip()
            )
        except Exception:
            pass

    session = requests.Session()
    session.cookies.set("user_session", session_token, domain=".github.com")
    session.cookies.set("__Host-user_session_same_site", session_token, domain="github.com")
    if user:
        session.cookies.set("dotcom_user", user, domain=".github.com")
        session.cookies.set("logged_in", "yes", domain=".github.com")

    headers = {
        "Accept": "text/html,application/xhtml+xml",
        "Origin": base_url,
        "Referer": f"{base_url}/{REPO}/settings",
        "User-Agent": "vikinger-panel-upload-social-preview",
    }

    settings = session.get(f"{base_url}/{REPO}/settings", headers=headers, timeout=60)
    if settings.status_code != 200 or "Social preview" not in settings.text:
        raise SystemExit(
            "Could not open repository settings with GH_SESSION_TOKEN. "
            "Cookie may be expired or account lacks admin access."
        )

    # CSRF token scoped to repository image upload (not the generic form token).
    auth_match = re.search(
        r'data-upload-policy-url="/upload/policies/repository-images"[^>]*>'
        r'<input type="hidden" value="([^"]+)"[^>]*class="js-data-upload-policy-url-csrf"',
        settings.text,
    )
    if not auth_match:
        auth_match = re.search(
            r'class="js-data-upload-policy-url-csrf"[^>]*value="([^"]+)"',
            settings.text,
        )
    if not auth_match:
        raise SystemExit("repository-images CSRF token not found on settings page.")
    authenticity_token = auth_match.group(1)

    repo_id = None
    try:
        import subprocess

        repo_id = int(
            subprocess.check_output(
                ["gh", "api", f"repos/{REPO}", "--jq", ".id"],
                text=True,
            ).strip()
        )
    except Exception as exc:
        raise SystemExit(f"Could not resolve repository id: {exc}") from exc

    size = image.stat().st_size
    policy_headers = {
        **headers,
        "Accept": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        "Referer": f"{base_url}/{REPO}/settings",
    }
    policy_data = {
        "name": image.name,
        "size": str(size),
        "content_type": "image/jpeg",
        "authenticity_token": authenticity_token,
        "repository_id": str(repo_id),
    }

    policy = session.post(
        f"{base_url}/upload/policies/repository-images",
        data=policy_data,
        headers=policy_headers,
        timeout=60,
    )
    if policy.status_code not in (200, 201):
        raise SystemExit(
            f"Upload policy failed ({policy.status_code}): {policy.text[:300]}"
        )
    payload = policy.json()

    upload_url = payload.get("upload_url") or base_url
    form = payload.get("form") or {}
    if not form:
        raise SystemExit(f"Unexpected policy response: {payload}")

    files = [(k, (None, v)) for k, v in form.items()]
    files.append(("file", (image.name, image.read_bytes(), "image/jpeg")))
    s3 = session.post(upload_url, files=files, timeout=120)
    if s3.status_code not in (200, 201, 204):
        raise SystemExit(f"S3 upload failed ({s3.status_code}): {s3.text[:300]}")

    finalize_path = payload.get("asset_upload_url")
    finalize_token = payload.get("asset_upload_authenticity_token") or payload.get(
        "upload_authenticity_token"
    )
    if finalize_path and finalize_token:
        finalize = session.put(
            f"{base_url}{finalize_path}",
            data={"authenticity_token": finalize_token},
            headers=policy_headers,
            timeout=60,
        )
        if finalize.status_code not in (200, 201):
            # S3 upload may still succeed; verify og:image below before failing.
            print(
                f"Warning: finalize returned {finalize.status_code}; checking og:image...",
                file=sys.stderr,
            )

    repo_page = session.get(f"{base_url}/{REPO}", headers=headers, timeout=60)
    og_match = re.search(r'property="og:image"\s+content="([^"]+)"', repo_page.text)
    print("Social preview uploaded via HTTP.")
    if og_match:
        print(f"og:image → {og_match.group(1)}")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--login", action="store_true", help="Save GitHub browser session")
    parser.add_argument("--image", type=Path, default=DEFAULT_IMAGE)
    parser.add_argument("--base-url", default="https://github.com")
    parser.add_argument("--headed", action="store_true", help="Show browser window")
    parser.add_argument(
        "--session-token",
        default=os.environ.get("GH_SESSION_TOKEN", ""),
        help="GitHub user_session cookie (or set GH_SESSION_TOKEN)",
    )
    args = parser.parse_args()

    headless = not args.headed

    if args.login:
        login(args.base_url, headless=headless)
        return

    if args.session_token:
        upload_http(args.image, args.session_token.strip(), args.base_url)
        return

    if STATE_FILE.exists():
        upload_playwright(args.image, args.base_url, headless=headless)
        return

    raise SystemExit(
        "No GitHub web session. Set GH_SESSION_TOKEN or run with --login.\n"
        "See script docstring for cookie instructions."
    )


if __name__ == "__main__":
    main()
