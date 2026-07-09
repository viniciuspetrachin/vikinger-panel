# Contributing to Vikinger Panel

Thank you for considering a contribution! This project is open to the community under
[Polyform Shield 1.0.0](LICENSE).

## Before you start

- Read the [README](README.md) and [commercial license](COMMERCIAL-LICENSE.md) to understand
  the usage model.
- Contributions are accepted under the **same terms** as the project license.
- Issues and discussions in English or Portuguese are welcome.

## How to contribute

1. **Fork** the repository
2. Create a branch: `git checkout -b feat/my-feature`
3. Make your changes with tests
4. Open a **Pull Request** describing the problem and solution

## Local development

### Prerequisites

- Docker and Docker Compose
- Python 3.12+
- Node.js 22+ (for frontend rebuild)

### Dev with hot-reload (recommended)

```bash
./scripts/dev.sh
```

Starts the panel with `uvicorn --reload` and a frontend watcher. Edit `panel/**` and
refresh with F5 — no image rebuild needed.

### Tests (required for API/UI features)

```bash
cd panel
python -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/playwright install chromium

# Unit tests (fast, no browser)
.venv/bin/pytest tests/unit -q

# E2E (hermetic panel with fake docker)
.venv/bin/pytest tests/e2e -q
```

### Frontend

```bash
cd panel
npm install
npm run build   # generates app.css, app.bundle.js, editor.bundle.js
npm run watch   # watch mode (used by dev.sh)
```

### Production deploy (Docker)

Outside dev mode, the panel serves embedded assets. After changes in `panel/`,
rebuild the container — **F5 alone is not enough**:

```bash
./scripts/reload-panel.sh           # docker compose build panel && up -d
./scripts/reload-panel.sh --tests   # pytest unit + e2e, then deploy
```

### Conventions

- Mutating routes (`POST`/`PUT`/`DELETE`) are audited in `panel-data/logs/audit.jsonl`
- UI actions use `withBusy(key, fn)` — buttons with `:disabled="isBusy('key')"`
- New routes: unit test in `tests/unit/test_api.py`
- New UI flows: E2E test in `tests/e2e/test_features.py`

## CI/CD and branch protection

### Workflows (GitHub Actions)

| Workflow | Trigger | What it does |
|----------|---------|--------------|
| `ci.yml` | PR and push to `main` | Runs `pytest tests/unit` and `pytest tests/e2e` |
| `release.yml` | Push to `main` (except `[skip ci]`) | Tests → patch bump → Docker build → GHCR → ZIP → tag → GitHub Release |

### Automatic versioning

- Source of truth: `panel/version.py` (`__version__`)
- Each release on `main` auto-increments patch (`2.1.0` → `2.1.1`)
- To change major or minor, edit `__version__` manually in the desired commit; patch stays automatic after that
- The bot release commit uses `[skip ci]` to avoid triggering another release loop

### Protecting the `main` branch (GitHub settings)

To ensure no code lands on `main` without tests:

1. Go to **Settings → Branches → Add branch protection rule**
2. Branch name pattern: `main`
3. Enable **Require status checks to pass before merging**
4. Select the **`test`** check (CI workflow job)
5. (Recommended) **Require a pull request before merging**

### Release package for end users

The `release.yml` workflow generates a source-free ZIP on [GitHub Releases](https://github.com/viniciuspetrachin/vikinger-panel/releases), including:

- Pre-built Docker image (`.tar` + GHCR publish)
- `docker-compose.yml` without `build:`
- `start.sh` and `reload-panel.sh` scripts
- `README-INSTALL.md` with step-by-step instructions

Templates in `release/`; assembly via `scripts/assemble-release.sh`.

## What to avoid

- Commits with secrets (`.env`, passwords, tokens)
- Changes that break the licensing model without prior discussion
- Large PRs without an issue or context — prefer focused changes

## Code of conduct

Be respectful. Focus on constructive feedback and collaboration.
