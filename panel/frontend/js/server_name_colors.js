/** Valheim server name color tags (Unity Rich Text). */

/** Characters that break Valheim launch args or rich-text parsing. */
export const SERVER_NAME_FORBIDDEN_CHARS_RE = /["<>]/;

/** Named colors known to work in the server browser (multi-color names). */
export const SERVER_NAME_NAMED_COLORS = [
  "red", "green", "blue", "yellow", "orange", "cyan", "purple", "white",
];

/** Hex presets for single-color names (Valheim hex rule: one colored fragment). */
export const SERVER_NAME_HEX_PRESETS = ["#FFD700", "#FF6600", "#FFFFFF"];

export const SERVER_NAME_COLOR_OPTIONS = [
  ...SERVER_NAME_NAMED_COLORS.map((c) => ({ value: c, display: c })),
  { value: "#FFD700", labelKey: "hexGold" },
  { value: "#FF6600", labelKey: "hexOrange" },
  { value: "#FFFFFF", labelKey: "hexWhite" },
];

/** @deprecated kept for parsing legacy saved names */
export const VALHEIM_NAMED_COLORS = [
  "red", "blue", "green", "yellow", "cyan", "magenta", "white", "black",
  "silver", "grey", "gray", "maroon", "olive", "lime", "navy", "teal", "orange", "purple",
];

const ALLOWED_COLORS = new Set([
  ...SERVER_NAME_NAMED_COLORS,
  ...SERVER_NAME_HEX_PRESETS.map((h) => h.toUpperCase()),
]);

const COLOR_TAG_RE = /<color=([^>]+)>([\s\S]*?)(?:<\/color>|(?=<color=)|$)/gi;
const HEX_SHORT_RE = /<#([0-9A-Fa-f]{3,8})>([\s\S]*?)(?=<#|$)/g;

export function sanitizeServerNameFragment(text) {
  return String(text ?? "").replace(SERVER_NAME_FORBIDDEN_CHARS_RE, "");
}

export function normalizeColorValue(raw) {
  const value = String(raw || "").trim().replace(/^["']|["']$/g, "");
  if (!value) return "";
  if (/^#[0-9A-Fa-f]{3,8}$/.test(value)) return value.toUpperCase();
  const lower = value.toLowerCase();
  if (lower === "gray") return "grey";
  return lower;
}

export function isHexColor(color) {
  return /^#[0-9A-Fa-f]{3,8}$/.test(String(color || "").trim());
}

export function isAllowedServerNameColor(color) {
  const c = normalizeColorValue(color);
  if (!c) return true;
  if (isHexColor(c)) return ALLOWED_COLORS.has(c.toUpperCase());
  return ALLOWED_COLORS.has(c);
}

export function stripColorTags(name) {
  return String(name || "")
    .replace(COLOR_TAG_RE, "$2")
    .replace(HEX_SHORT_RE, "$2")
    .replace(/<\/?color[^>]*>/gi, "")
    .replace(/<#[0-9A-Fa-f]{3,8}>/gi, "");
}

function parseSegments(raw) {
  const text = String(raw || "");
  if (!text) return [];

  const segments = [];
  const combined = [];
  let m;

  COLOR_TAG_RE.lastIndex = 0;
  while ((m = COLOR_TAG_RE.exec(text)) !== null) {
    combined.push({ index: m.index, len: m[0].length, color: normalizeColorValue(m[1]), text: m[2] });
  }

  HEX_SHORT_RE.lastIndex = 0;
  while ((m = HEX_SHORT_RE.exec(text)) !== null) {
    combined.push({
      index: m.index,
      len: m[0].length,
      color: normalizeColorValue(`#${m[1]}`),
      text: m[2],
    });
  }

  combined.sort((a, b) => a.index - b.index);

  let cursor = 0;
  for (const part of combined) {
    if (part.index > cursor) {
      const plain = text.slice(cursor, part.index);
      if (plain) segments.push({ text: plain, color: "" });
    }
    if (part.text) segments.push({ text: part.text, color: part.color });
    cursor = part.index + part.len;
  }
  if (cursor < text.length) {
    const tail = text.slice(cursor);
    if (tail) segments.push({ text: tail, color: "" });
  }

  if (!segments.length && text) return [{ text: stripColorTags(text), color: "" }];
  return segments;
}

/** Map stored name into editable fragments (one row per colored/plain segment). */
export function parseColoredServerName(raw) {
  const text = String(raw || "");
  const segments = parseSegments(text);
  if (segments.length) {
    return segments.map((s) => ({
      text: sanitizeServerNameFragment(s.text),
      color: isAllowedServerNameColor(s.color) ? normalizeColorValue(s.color) : "",
    }));
  }
  if (text) return [{ text: sanitizeServerNameFragment(stripColorTags(text)), color: "" }];
  return [{ text: "", color: "" }];
}

export function emptyColorPart() {
  return { text: "", color: "" };
}

export function findHexPartIndex(parts) {
  return (parts || []).findIndex((p) => isHexColor(normalizeColorValue(p.color)));
}

export function buildColoredServerName(parts) {
  const slots = Array.isArray(parts) ? parts : [];
  let out = "";
  for (const slot of slots) {
    const text = sanitizeServerNameFragment(slot?.text ?? "");
    const color = normalizeColorValue(slot?.color);
    if (!text) continue;
    if (!color) {
      out += text;
      continue;
    }
    if (!isAllowedServerNameColor(color)) continue;
    const tagColor = isHexColor(color) ? color : color;
    out += `<color=${tagColor}>${text}</color>`;
  }
  return out;
}

export function validateColoredServerName(parts) {
  const slots = (parts || []).filter((p) => String(p?.text ?? "").length);
  const colors = slots
    .map((p) => normalizeColorValue(p.color))
    .filter(Boolean);
  const unique = [...new Set(colors)];

  for (const slot of slots) {
    const text = String(slot?.text ?? "");
    if (SERVER_NAME_FORBIDDEN_CHARS_RE.test(text)) {
      return { ok: false, code: "invalidCharacters" };
    }
    const color = normalizeColorValue(slot.color);
    if (color && !isAllowedServerNameColor(color)) {
      return { ok: false, code: "unsupportedColor" };
    }
  }

  if (!unique.length) return { ok: true };

  const hasHex = unique.some(isHexColor);
  if (hasHex) {
    if (unique.length > 1) {
      return { ok: false, code: "hexSingleOnly" };
    }
    const coloredSlots = slots.filter((p) => normalizeColorValue(p.color));
    if (coloredSlots.length > 1) {
      return { ok: false, code: "hexSingleOnly" };
    }
    return { ok: true };
  }

  if (unique.length > 2) {
    return { ok: false, code: "maxTwoColors" };
  }
  return { ok: true };
}

const CSS_NAMED = {
  grey: "#808080",
  gray: "#808080",
  maroon: "#800000",
  olive: "#808000",
  lime: "#00FF00",
  navy: "#000080",
  teal: "#008080",
  silver: "#C0C0C0",
  black: "#000000",
  magenta: "#FF00FF",
};

export function cssColorForTag(color) {
  const c = normalizeColorValue(color);
  if (!c) return null;
  if (isHexColor(c)) return c;
  if (CSS_NAMED[c]) return CSS_NAMED[c];
  return c;
}

export function previewColoredServerName(parts, { suffix = "" } = {}) {
  const slots = Array.isArray(parts) ? parts : [];
  let html = "";
  for (const slot of slots) {
    const text = sanitizeServerNameFragment(slot?.text ?? "");
    if (!text) continue;
    const css = cssColorForTag(slot?.color);
    const safe = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    html += css
      ? `<span style="color:${css}">${safe}</span>`
      : safe;
  }
  if (suffix) {
    html += `<span class="text-gray-500">${suffix
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")}</span>`;
  }
  return html || '<span class="text-gray-600">—</span>';
}

export function serverNameUsesHex(parts) {
  return (parts || []).some((p) => isHexColor(normalizeColorValue(p.color)));
}
