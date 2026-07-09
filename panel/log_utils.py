"""Sanitização e normalização de logs Docker/Supervisord."""

import re

ANSI_RE = re.compile(r"\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])")
CARET_ANSI_RE = re.compile(r"\^\[\[[\d;]*[A-Za-z]")

DOCKER_LOG_RE = re.compile(
    r"^(?P<ts>\w{3}\s+\d{1,2}\s+\d{2}:\d{2}:\d{2})\s+supervisord:\s+(?P<proc>\S+)(?:\s+(?P<msg>.*))?$"
)

TAR_VERBOSE_RE = re.compile(r"^\.[rwxdlst.-]{8,}\s+[\./]")


def strip_ansi(text: str) -> str:
    text = ANSI_RE.sub("", text)
    return CARET_ANSI_RE.sub("", text)


def normalize_docker_log_line(line: str) -> str:
    line = strip_ansi(line).rstrip()
    if not line.strip():
        return ""
    match = DOCKER_LOG_RE.match(line)
    if match:
        msg = strip_ansi((match.group("msg") or "")).strip()
        if not msg or TAR_VERBOSE_RE.match(msg):
            return ""
        return f"[{match.group('ts')}] {msg}"
    return line


def clean_docker_logs(raw: str) -> str:
    lines = []
    for line in raw.splitlines():
        cleaned = normalize_docker_log_line(line)
        if cleaned:
            lines.append(cleaned)
    return "\n".join(lines)
