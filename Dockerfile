# ── Frontend build ────────────────────────────────────────────────────────────
FROM node:22-alpine AS frontend
WORKDIR /build
COPY app/package.json app/package-lock.json* ./
RUN npm install --omit=dev=false 2>/dev/null || npm install
COPY app/tailwind.config.js app/build.mjs app/editor-src.js ./
COPY app/frontend ./frontend
COPY app/static/index.html app/static/vendor ./static/
RUN npm run build

# ── Python runtime ────────────────────────────────────────────────────────────
FROM python:3.12-slim-bookworm
RUN apt-get update \
    && apt-get install -y --no-install-recommends docker.io curl ca-certificates util-linux \
    && rm -rf /var/lib/apt/lists/* \
    && mkdir -p /usr/local/lib/docker/cli-plugins \
    && curl -fsSL "https://github.com/docker/compose/releases/download/v2.24.5/docker-compose-linux-x86_64" \
         -o /usr/local/lib/docker/cli-plugins/docker-compose \
    && chmod +x /usr/local/lib/docker/cli-plugins/docker-compose \
    && groupadd -g 1000 panel \
    && useradd -u 1000 -g panel -m -s /bin/bash panel

WORKDIR /app
COPY app/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app/ .
COPY --from=frontend /build/static/app.css ./static/app.css
COPY --from=frontend /build/static/app.bundle.js ./static/app.bundle.js
COPY --from=frontend /build/static/editor.bundle.js ./static/editor.bundle.js

COPY scripts/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh \
    && mkdir -p /app/data/world_fwl_backups /app/data/world_fwl_staging /app/logs \
    && chown -R panel:panel /app/data /app/logs

USER root
EXPOSE 8080
ENV VALHEIM_PANEL_ROOT=/home/vinicius/valheim-panel
ENV PANEL_UID=1000
ENV PANEL_GID=1000
ENTRYPOINT ["/entrypoint.sh"]
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
