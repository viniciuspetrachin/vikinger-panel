"""Parse, serialize and match BepInEx plugin .cfg files (R2ModMan-style metadata)."""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional

PROTECTED_CFG_NAMES = frozenset({"BepInEx.cfg", "org.tristan.rcon.cfg"})
SETTING_TYPE_RE = re.compile(r"^#\s*Setting type:\s*(.+)$", re.IGNORECASE)
DEFAULT_VALUE_RE = re.compile(r"^#\s*Default value:\s*(.*)$", re.IGNORECASE)
ACCEPTABLE_RE = re.compile(r"^#\s*Acceptable values:\s*(.+)$", re.IGNORECASE)
GUID_RE = re.compile(r"^##\s*Plugin GUID:\s*(.+)$", re.IGNORECASE)
SECTION_RE = re.compile(r"^\[([^\]]+)\]\s*$")
KV_RE = re.compile(r"^([^=]+?)\s*=\s*(.*)$")


def normalize_id(value: str) -> str:
    return re.sub(r"[^a-z0-9]", "", (value or "").lower())


def extract_plugin_guid(text: str) -> Optional[str]:
    for line in text.splitlines():
        m = GUID_RE.match(line.strip())
        if m:
            return m.group(1).strip()
    return None


def is_bepinex_plugin_cfg_path(path: str) -> bool:
    p = (path or "").replace("\\", "/").lower()
    if not p.startswith("config/bepinex/"):
        return False
    name = p.rsplit("/", 1)[-1]
    return name.endswith(".cfg") and name not in {n.lower() for n in PROTECTED_CFG_NAMES}


@dataclass
class CfgSetting:
    key: str
    value: str
    label: str = ""
    setting_type: str = ""
    default_value: str = ""
    acceptable: list[str] = field(default_factory=list)
    line_index: int = -1

    def to_dict(self) -> dict:
        return {
            "key": self.key,
            "value": self.value,
            "label": self.label,
            "type": self.setting_type,
            "default": self.default_value,
            "acceptable": self.acceptable,
            "line": self.line_index,
        }


@dataclass
class CfgSection:
    name: str
    settings: list[CfgSetting] = field(default_factory=list)

    def to_dict(self) -> dict:
        return {"name": self.name, "settings": [s.to_dict() for s in self.settings]}


@dataclass
class CfgDocument:
    header: list[str] = field(default_factory=list)
    sections: list[CfgSection] = field(default_factory=list)
    plugin_guid: str = ""
    structured: bool = False

    def to_dict(self) -> dict:
        return {
            "header": self.header,
            "plugin_guid": self.plugin_guid,
            "structured": self.structured,
            "sections": [s.to_dict() for s in self.sections],
        }


def _parse_acceptable(raw: str) -> list[str]:
    return [part.strip() for part in raw.split(",") if part.strip()]


def parse_bepinex_cfg(text: str) -> CfgDocument:
    lines = text.splitlines()
    doc = CfgDocument(header=[], sections=[], plugin_guid=extract_plugin_guid(text) or "")
    current_section: Optional[CfgSection] = None
    pending_label = ""
    pending_type = ""
    pending_default = ""
    pending_acceptable: list[str] = []
    structured_count = 0
    in_header = True

    for idx, raw_line in enumerate(lines):
        line = raw_line.strip()
        if not line:
            pending_label = ""
            pending_type = ""
            pending_default = ""
            pending_acceptable = []
            continue

        if in_header and line.startswith("##"):
            doc.header.append(raw_line.rstrip())
            m = GUID_RE.match(line)
            if m:
                doc.plugin_guid = m.group(1).strip()
            continue

        sec = SECTION_RE.match(line)
        if sec:
            in_header = False
            current_section = CfgSection(name=sec.group(1).strip())
            doc.sections.append(current_section)
            pending_label = ""
            pending_type = ""
            pending_default = ""
            pending_acceptable = []
            continue

        in_header = False

        if line.startswith("##") and not line.startswith("###"):
            pending_label = line[2:].strip()
            continue

        m_type = SETTING_TYPE_RE.match(line)
        if m_type:
            pending_type = m_type.group(1).strip()
            continue

        m_def = DEFAULT_VALUE_RE.match(line)
        if m_def:
            pending_default = m_def.group(1).strip()
            continue

        m_acc = ACCEPTABLE_RE.match(line)
        if m_acc:
            pending_acceptable = _parse_acceptable(m_acc.group(1))
            continue

        if line.startswith("#"):
            continue

        kv = KV_RE.match(line)
        if kv and current_section is not None:
            key = kv.group(1).strip()
            value = kv.group(2).strip()
            setting = CfgSetting(
                key=key,
                value=value,
                label=pending_label,
                setting_type=pending_type,
                default_value=pending_default,
                acceptable=list(pending_acceptable),
                line_index=idx,
            )
            current_section.settings.append(setting)
            if pending_type:
                structured_count += 1
            pending_label = ""
            pending_type = ""
            pending_default = ""
            pending_acceptable = []

    doc.structured = structured_count > 0 and bool(doc.sections)
    return doc


def apply_setting_values(text: str, updates: list[dict]) -> str:
    """Apply key/value updates; each item: {section, key, value}."""
    if not updates:
        return text
    lines = text.splitlines()
    index: dict[tuple[str, str], int] = {}
    current_section = ""
    for idx, raw_line in enumerate(lines):
        line = raw_line.strip()
        sec = SECTION_RE.match(line)
        if sec:
            current_section = sec.group(1).strip()
            continue
        kv = KV_RE.match(line)
        if kv and current_section:
            key = kv.group(1).strip()
            index[(current_section, key)] = idx

    for item in updates:
        section = (item.get("section") or "").strip()
        key = (item.get("key") or "").strip()
        value = item.get("value")
        if value is None or not section or not key:
            continue
        pos = index.get((section, key))
        if pos is None:
            continue
        lines[pos] = f"{key} = {value}"
    return "\n".join(lines) + ("\n" if text.endswith("\n") else "")


@dataclass
class CfgIndexEntry:
    name: str
    stem: str
    guid: str
    norm_stem: str
    norm_guid: str


def build_cfg_index(cfg_dir: Path) -> list[CfgIndexEntry]:
    entries: list[CfgIndexEntry] = []
    if not cfg_dir.exists():
        return entries
    for cfg in sorted(cfg_dir.glob("*.cfg")):
        if cfg.name in PROTECTED_CFG_NAMES:
            continue
        text = cfg.read_text(encoding="utf-8", errors="replace")
        guid = extract_plugin_guid(text) or ""
        entries.append(
            CfgIndexEntry(
                name=cfg.name,
                stem=cfg.stem,
                guid=guid,
                norm_stem=normalize_id(cfg.stem),
                norm_guid=normalize_id(guid),
            )
        )
    return entries


def _match_score(norm_dll: str, entry: CfgIndexEntry) -> int:
    if not norm_dll:
        return 0
    if entry.norm_guid and entry.norm_guid == norm_dll:
        return 100
    if entry.norm_stem == norm_dll:
        return 95
    if entry.norm_guid and norm_dll in entry.norm_guid:
        return 80 + min(len(norm_dll), 10)
    if entry.norm_stem and norm_dll in entry.norm_stem:
        return 70 + min(len(norm_dll), 10)
    if entry.norm_guid and entry.norm_guid in norm_dll:
        return 60 + min(len(entry.norm_guid), 10)
    if entry.norm_stem and entry.norm_stem in norm_dll:
        return 50 + min(len(entry.norm_stem), 10)
    return 0


def match_dll_to_cfg(dll_stem: str, index: list[CfgIndexEntry]) -> Optional[str]:
    norm_dll = normalize_id(dll_stem)
    best_name: Optional[str] = None
    best_score = 0
    for entry in index:
        score = _match_score(norm_dll, entry)
        if score > best_score:
            best_score = score
            best_name = entry.name
    return best_name if best_score >= 50 else None


def list_installed_dll_stems(plugins_dir: Path, disabled_dir: Path) -> set[str]:
    stems: set[str] = set()
    for base in (plugins_dir, disabled_dir):
        if not base.exists():
            continue
        for dll in base.glob("*.dll"):
            stems.add(dll.stem)
    return stems


def find_plugin_for_cfg(
    cfg_name: str,
    cfg_dir: Path,
    plugins_dir: Path,
    disabled_dir: Path,
) -> Optional[dict]:
    """Return the plugin (.dll) linked to a BepInEx cfg file, if any."""
    index = build_cfg_index(cfg_dir)
    entry = next((e for e in index if e.name == cfg_name), None)
    if not entry:
        return None
    for enabled, base in ((True, plugins_dir), (False, disabled_dir)):
        if not base.exists():
            continue
        for dll in sorted(base.glob("*.dll")):
            if match_dll_to_cfg(dll.stem, [entry]):
                return {"name": dll.name, "enabled": enabled}
    return None


def find_orphaned_configs(
    cfg_dir: Path,
    plugins_dir: Path,
    disabled_dir: Path,
) -> list[dict]:
    index = build_cfg_index(cfg_dir)
    dll_stems = list_installed_dll_stems(plugins_dir, disabled_dir)
    orphaned: list[dict] = []
    for entry in index:
        matched = any(match_dll_to_cfg(stem, [entry]) for stem in dll_stems)
        if not matched:
            path = cfg_dir / entry.name
            stat = path.stat()
            orphaned.append({
                "name": entry.name,
                "path": f"config/bepinex/{entry.name}",
                "size": stat.st_size,
                "guid": entry.guid,
            })
    return orphaned
