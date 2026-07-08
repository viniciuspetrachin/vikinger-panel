"""Leitura/escrita de arquivos .fwl (metadados de mundo Valheim)."""

from __future__ import annotations

import io
import random
import re
import shutil
import struct
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Optional

WORLD_VERSION = 36
GEN_VERSION = 2

PRESETS = ("", "easy", "normal", "hard", "hardcore", "casual", "hammer", "immersive")
COMBAT_VALUES = ("", "veryeasy", "easy", "normal", "hard", "veryhard")
DEATH_VALUES = ("", "casual", "veryeasy", "easy", "normal", "hard", "hardcore")
RESOURCES_VALUES = ("", "muchless", "less", "normal", "more", "muchmore", "most")
RAIDS_VALUES = ("", "none", "muchless", "less", "normal", "more", "muchmore")
PORTALS_VALUES = ("", "casual", "normal", "hard", "veryhard")

BOOL_FLAGS = ("nobuildcost", "playerevents", "fire", "passivemobs", "nomap")
EXTRA_FLAGS = (
    "deathkeepequip",
    "deathdeleteunequipped",
    "deathdeleteitems",
    "deathskillsreset",
    "teleportall",
    "nobossportals",
    "noportals",
)
NAMED_PRESETS = ("easy", "normal", "hard", "hardcore", "casual", "hammer", "immersive")


def stable_hash(text: str) -> int:
    """Equivalente a StringExtensions.GetStableHashCode do Valheim."""
    num = 5381
    num1 = num
    i = 0
    while i < len(text) and text[i] != "\0":
        num = ((num << 5) + num) ^ ord(text[i])
        if i == len(text) - 1 or text[i + 1] == "\0":
            break
        num1 = ((num1 << 5) + num1) ^ ord(text[i + 1])
        i += 2
    return _to_int32(num + num1 * 1566083941)


def _to_int32(value: int) -> int:
    value &= 0xFFFFFFFF
    if value >= 0x80000000:
        return value - 0x100000000
    return value


def _to_int64(value: int) -> int:
    value &= 0xFFFFFFFFFFFFFFFF
    if value >= 0x8000000000000000:
        return value - 0x10000000000000000
    return value


def _read_7bit_int(stream: io.BufferedIOBase) -> int:
    result = 0
    shift = 0
    while True:
        b = stream.read(1)
        if not b:
            raise EOFError("Unexpected EOF reading 7-bit int")
        byte = b[0]
        result |= (byte & 0x7F) << shift
        if not (byte & 0x80):
            return result
        shift += 7
        if shift > 35:
            raise ValueError("Invalid 7-bit int")


def _write_7bit_int(stream: io.BufferedIOBase, value: int) -> None:
    while value >= 0x80:
        stream.write(bytes([value & 0x7F | 0x80]))
        value >>= 7
    stream.write(bytes([value]))


def _read_string(stream: io.BufferedIOBase) -> str:
    length = _read_7bit_int(stream)
    data = stream.read(length)
    if len(data) != length:
        raise EOFError("Unexpected EOF reading string")
    return data.decode("ascii", errors="replace")


def _write_string(stream: io.BufferedIOBase, text: str) -> None:
    data = text.encode("ascii")
    _write_7bit_int(stream, len(data))
    stream.write(data)


def _generate_seed_name() -> str:
    chars = "abcdefghijklmnpqrstuvwxyzABCDEFGHIJKLMNPQRSTUVWXYZ023456789"
    return "".join(random.choice(chars) for _ in range(10))


@dataclass
class WorldConfig:
    preset: str = ""
    combat: str = ""
    deathpenalty: str = ""
    resources: str = ""
    raids: str = ""
    portals: str = ""
    nobuildcost: Optional[bool] = None
    playerevents: Optional[bool] = None
    fire: Optional[bool] = None
    passivemobs: Optional[bool] = None
    nomap: Optional[bool] = None
    seed: Optional[str] = None

    def to_dict(self) -> dict[str, Any]:
        return {
            "preset": self.preset or "",
            "combat": self.combat or "",
            "deathpenalty": self.deathpenalty or "",
            "resources": self.resources or "",
            "raids": self.raids or "",
            "portals": self.portals or "",
            "nobuildcost": self.nobuildcost,
            "playerevents": self.playerevents,
            "fire": self.fire,
            "passivemobs": self.passivemobs,
            "nomap": self.nomap,
            "seed": self.seed,
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> WorldConfig:
        return cls(
            preset=str(data.get("preset") or ""),
            combat=str(data.get("combat") or ""),
            deathpenalty=str(data.get("deathpenalty") or ""),
            resources=str(data.get("resources") or ""),
            raids=str(data.get("raids") or ""),
            portals=str(data.get("portals") or ""),
            nobuildcost=data.get("nobuildcost"),
            playerevents=data.get("playerevents"),
            fire=data.get("fire"),
            passivemobs=data.get("passivemobs"),
            nomap=data.get("nomap"),
            seed=data.get("seed") or None,
        )

    def summary(self) -> dict[str, str]:
        """Valores efetivos para exibição (preset + overrides)."""
        effective = _effective_presets(self)
        return {
            "preset": self.preset or "normal",
            "combat": effective.get("combat", "normal"),
            "deathpenalty": effective.get("deathpenalty", "normal"),
            "resources": effective.get("resources", "normal"),
            "raids": effective.get("raids", "normal"),
            "portals": effective.get("portals", "normal"),
        }


@dataclass
class WorldMeta:
    name: str
    seed_name: str
    seed_hash: int
    uid: int
    world_version: int = WORLD_VERSION
    gen_version: int = GEN_VERSION
    has_db_required: bool = False
    modifier_strings: list[str] = field(default_factory=list)
    config: WorldConfig = field(default_factory=WorldConfig)
    warnings: list[str] = field(default_factory=list)


def _effective_presets(config: WorldConfig) -> dict[str, str]:
    presets = {
        "combat": "default",
        "deathpenalty": "default",
        "resources": "default",
        "raids": "default",
        "portals": "default",
    }
    preset = (config.preset or "").lower()
    if preset == "easy":
        presets.update({"combat": "easy", "raids": "less"})
    elif preset == "hard":
        presets.update({"combat": "hard", "raids": "more"})
    elif preset == "hardcore":
        presets.update({
            "combat": "veryhard",
            "deathpenalty": "hardcore",
            "raids": "more",
            "portals": "hard",
        })
    elif preset == "casual":
        presets.update({
            "combat": "veryeasy",
            "deathpenalty": "casual",
            "resources": "more",
            "raids": "none",
            "portals": "casual",
        })
    elif preset == "hammer":
        presets.update({"raids": "none"})
    elif preset == "immersive":
        presets.update({"portals": "veryhard"})

    if config.combat:
        presets["combat"] = config.combat.lower()
    if config.deathpenalty:
        presets["deathpenalty"] = config.deathpenalty.lower()
    if config.resources:
        presets["resources"] = config.resources.lower()
    if config.raids:
        presets["raids"] = config.raids.lower()
    if config.portals:
        presets["portals"] = config.portals.lower()
    return presets


def build_modifier_strings(config: WorldConfig) -> list[str]:
    """Serializa config para strings de modifier (MakeFwl Modifiers.Serialize)."""
    presets = _effective_presets(config)
    flags: set[str] = set()

    preset = (config.preset or "").lower()
    if preset == "hardcore":
        flags.add("nomap")
    elif preset == "casual":
        flags.update({"playerevents", "passivemobs"})
    elif preset == "hammer":
        flags.update({"nobuildcost", "passivemobs"})
    elif preset == "immersive":
        flags.update({"fire", "nomap"})

    modifiers: dict[str, int] = {}

    combat = presets.get("combat", "default")
    if combat == "veryeasy":
        modifiers.update({"playerdamage": 125, "enemydamage": 50, "enemyspeedsize": 90})
    elif combat == "easy":
        modifiers.update({"playerdamage": 110, "enemydamage": 75, "enemyspeedsize": 95})
    elif combat == "hard":
        modifiers.update({"playerdamage": 85, "enemydamage": 150, "enemyspeedsize": 110})
    elif combat == "veryhard":
        modifiers.update({"playerdamage": 70, "enemydamage": 200, "enemyspeedsize": 120})

    death = presets.get("deathpenalty", "default")
    if death == "casual":
        flags.add("deathkeepequip")
        modifiers["skillreductionrate"] = 15
    elif death == "veryeasy":
        modifiers["skillreductionrate"] = 15
    elif death == "easy":
        modifiers["skillreductionrate"] = 50
    elif death == "hard":
        modifiers["skillreductionrate"] = 150
        flags.add("deathdeleteunequipped")
    elif death == "hardcore":
        flags.update({"deathdeleteitems", "deathskillsreset"})

    resources = presets.get("resources", "default")
    resource_map = {
        "muchless": 50, "less": 75, "more": 150, "muchmore": 200, "most": 300,
    }
    if resources in resource_map:
        modifiers["resourcerate"] = resource_map[resources]

    raids = presets.get("raids", "default")
    raid_map = {"none": 0, "muchless": 200, "less": 150, "more": 60, "muchmore": 30}
    if raids in raid_map:
        modifiers["eventrate"] = raid_map[raids]

    portals = presets.get("portals", "default")
    if portals == "casual":
        flags.add("teleportall")
    elif portals == "hard":
        flags.add("nobossportals")
    elif portals == "veryhard":
        flags.add("noportals")

    def check_flag(name: str, value: Optional[bool]) -> None:
        if value is True:
            flags.add(name)
        elif value is False:
            flags.discard(name)

    check_flag("nobuildcost", config.nobuildcost)
    check_flag("playerevents", config.playerevents)
    check_flag("fire", config.fire)
    check_flag("passivemobs", config.passivemobs)
    check_flag("nomap", config.nomap)

    if not modifiers and not flags:
        return []

    results: list[str] = []
    for key, val in modifiers.items():
        results.append(f"{key} {val}")
    results.extend(sorted(flags))
    summary = ":".join(f"{k}_{v}" for k, v in presets.items())
    results.append(summary)
    return results


def _flags_in_strings(strings: list[str]) -> set[str]:
    flags: set[str] = set()
    for entry in strings:
        entry = entry.strip().lower()
        if not entry or " " in entry or ":" in entry:
            continue
        flags.add(entry)
    return flags


def _modifier_set(strings: list[str]) -> frozenset[str]:
    return frozenset(s.strip() for s in strings if s.strip())


def _effective_summary(config: WorldConfig, *, inferred_preset: str = "") -> dict[str, str]:
    """Summary efetivo, usando preset inferido quando o config não define preset."""
    merged = WorldConfig.from_dict(config.to_dict())
    if not merged.preset and inferred_preset:
        merged.preset = inferred_preset
    return merged.summary()


def active_flags(config: WorldConfig, modifier_strings: list[str]) -> dict[str, bool]:
    """Flags booleanas ativas no mundo (UI + extras derivados do .fwl)."""
    seen = _flags_in_strings(modifier_strings)
    result = {name: name in seen for name in BOOL_FLAGS}
    if config.nobuildcost is True:
        result["nobuildcost"] = True
    if config.playerevents is True:
        result["playerevents"] = True
    if config.fire is True:
        result["fire"] = True
    if config.passivemobs is True:
        result["passivemobs"] = True
    if config.nomap is True:
        result["nomap"] = True
    return result


def infer_preset(config: WorldConfig, modifier_strings: list[str]) -> str:
    """Infere preset nomeado comparando strings de modifier do .fwl."""
    if config.preset:
        return config.preset.lower()

    actual = _modifier_set(modifier_strings)
    if not actual:
        return "normal"

    for name in NAMED_PRESETS:
        expected = _modifier_set(build_modifier_strings(WorldConfig(preset=name)))
        if actual == expected:
            return name
    return ""


def world_config_details(
    meta: Optional[WorldMeta] = None,
    *,
    stored: Optional[WorldConfig] = None,
) -> dict[str, Any]:
    """Detalhes completos para API/UI: config, preset inferido, efetivo, flags e strings brutas."""
    if meta:
        config_dict = meta.config.to_dict()
        if stored and stored.preset:
            config_dict["preset"] = stored.preset
        config = WorldConfig.from_dict(config_dict)
        modifier_strings = list(meta.modifier_strings)
    else:
        config = stored or WorldConfig()
        modifier_strings = build_modifier_strings(config) if stored else []

    inferred = infer_preset(config, modifier_strings)
    effective = _effective_summary(config, inferred_preset=inferred or config.preset)

    return {
        "config": config.to_dict(),
        "inferred_preset": inferred,
        "effective": effective,
        "flags": active_flags(config, modifier_strings),
        "modifier_strings": modifier_strings,
    }


def parse_modifiers(strings: list[str]) -> WorldConfig:
    """Interpreta strings de modifier de um .fwl existente."""
    config = WorldConfig()
    flags_seen = _flags_in_strings(strings)
    summary: dict[str, str] = {}

    for entry in strings:
        entry = entry.strip()
        if not entry:
            continue
        if ":" in entry and all("_" in part for part in entry.split(":")):
            for part in entry.split(":"):
                if "_" in part:
                    key, val = part.split("_", 1)
                    summary[key.lower()] = val.lower()
            continue

    if summary:
        combat = summary.get("combat", "")
        if combat != "default":
            config.combat = combat
        death = summary.get("deathpenalty", "")
        if death != "default":
            config.deathpenalty = death
        resources = summary.get("resources", "")
        if resources != "default":
            config.resources = resources
        raids = summary.get("raids", "")
        if raids != "default":
            config.raids = raids
        portals = summary.get("portals", "")
        if portals != "default":
            config.portals = portals

    if "teleportall" in flags_seen:
        config.portals = config.portals or "casual"
    if "noportals" in flags_seen:
        config.portals = "veryhard"
    elif "nobossportals" in flags_seen:
        config.portals = config.portals or "hard"

    if "deathdeleteitems" in flags_seen and "deathskillsreset" in flags_seen:
        config.deathpenalty = config.deathpenalty or "hardcore"
    elif "deathdeleteunequipped" in flags_seen:
        config.deathpenalty = config.deathpenalty or "hard"
    elif "deathkeepequip" in flags_seen:
        config.deathpenalty = config.deathpenalty or "casual"

    if "nomap" in flags_seen:
        config.nomap = True
    if "nobuildcost" in flags_seen:
        config.nobuildcost = True
    if "playerevents" in flags_seen:
        config.playerevents = True
    if "fire" in flags_seen:
        config.fire = True
    if "passivemobs" in flags_seen:
        config.passivemobs = True

    return config


def read_fwl(path: Path) -> WorldMeta:
    data = path.read_bytes()
    stream = io.BytesIO(data)
    size = struct.unpack("<i", stream.read(4))[0]
    end = 4 + size
    if end > len(data):
        raise ValueError("Arquivo .fwl truncado")

    world_version = struct.unpack("<i", stream.read(4))[0]
    name = _read_string(stream)
    seed_name = _read_string(stream)
    seed_hash = struct.unpack("<i", stream.read(4))[0]
    uid = struct.unpack("<q", stream.read(8))[0]
    gen_version = struct.unpack("<i", stream.read(4))[0]
    has_db = struct.unpack("<?", stream.read(1))[0]

    modifier_strings: list[str] = []
    if stream.tell() < end:
        count = struct.unpack("<i", stream.read(4))[0]
        for _ in range(count):
            modifier_strings.append(_read_string(stream))

    config = parse_modifiers(modifier_strings)
    warnings: list[str] = []
    if world_version != WORLD_VERSION:
        warnings.append(f"Versão do mundo {world_version} (esperado {WORLD_VERSION})")

    return WorldMeta(
        name=name,
        seed_name=seed_name,
        seed_hash=seed_hash,
        uid=uid,
        world_version=world_version,
        gen_version=gen_version,
        has_db_required=has_db,
        modifier_strings=modifier_strings,
        config=config,
        warnings=warnings,
    )


def write_fwl(
    path: Path,
    name: str,
    config: WorldConfig,
    *,
    seed_name: Optional[str] = None,
    uid: Optional[int] = None,
    backup: bool = True,
    backup_path: Optional[Path] = None,
) -> WorldMeta:
    if backup and path.exists():
        dest = backup_path if backup_path is not None else path.with_suffix(".fwl.bak")
        dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(path, dest)

    seed = seed_name or config.seed or _generate_seed_name()
    seed_hash = _to_int32(stable_hash(seed))
    world_uid = uid if uid is not None else _to_int64(stable_hash(name) + random.randint(1, 2147483646))
    modifier_strings = build_modifier_strings(config)

    buf = io.BytesIO()
    buf.write(struct.pack("<i", 0))
    buf.write(struct.pack("<i", WORLD_VERSION))
    _write_string(buf, name)
    _write_string(buf, seed)
    buf.write(struct.pack("<i", seed_hash))
    buf.write(struct.pack("<q", world_uid))
    buf.write(struct.pack("<i", GEN_VERSION))
    buf.write(struct.pack("<?", False))
    buf.write(struct.pack("<i", len(modifier_strings)))
    for mod in modifier_strings:
        _write_string(buf, mod)

    content = buf.getvalue()
    size = len(content) - 4
    content = struct.pack("<i", size) + content[4:]
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(content)

    return read_fwl(path)


def config_summary_from_meta(meta: Optional[WorldMeta]) -> Optional[dict[str, str]]:
    if meta is None:
        return None
    inferred = infer_preset(meta.config, meta.modifier_strings)
    return _effective_summary(meta.config, inferred_preset=inferred)
