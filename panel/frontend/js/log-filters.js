// Client-side log filtering (mirrors panel/log_utils.py).

const DOCKER_TS = /^\[[A-Za-z]{3}\s+\d{1,2}\s+\d{2}:\d{2}:\d{2}\]\s*/;
const BEPINEX_BRACKET = /^\[(?:Info|Warning|Error|Message|Debug|Log)\s*:\s*[^\]]+\]\s*/i;

const VALHEIM_CHAT = /(\d+)\/([^\s(]+)\s*\([^)]+\):\s*(say|showMessage|shout|talk)\s+(.+)$/i;

const NOISE_PATTERNS = [
  /Command completed:\s*globalKeys/i,
  /^\s*Global Keys:\s*$/i,
  /^(?:combat_|deathpenalty_|resources_|raids_|portals_)/i,
  /^(?:activebosses|defeated_|killed|killedtroll|killed_surtling)\b/i,
  /^(?:playerdamage|enemydamage|enemyspeedsize|skillreductionrate|eventrate|playerevents)\b/i,
  /^crond\[/i,
  /^steamcmd\.sh\[/i,
  /Update state \(0x/i,
  /verifying install, progress:/i,
  /^adding:\s+config\/worlds_local\//i,
  /^\(deflated \d+%\)$/i,
  /^Redirecting stderr to/i,
  /^Checking for available updates/i,
  /^Logging directory:/i,
  /^-- type 'quit' to exit --/i,
  /^Connecting anonymously to Steam/i,
  /^Waiting for (?:client config|user info)/i,
  /^Unloading Steam API/i,
  /^Filesystem\s+Size\s+Used/i,
  /^overlay\s+\/ overlay/i,
  /^\/dev\/mapper\//i,
  /^DEBUG - \[\d+\] - (?:Received signal|Kernel:|Found CPU|Memory total|Storage configuration)/i,
  /^INFO - (?:Downloading\/updating|Backing up Valheim|Removing backups)/i,
  /^Connections \d+ ZDOS:/i,
  /Destroying abandoned non persistent zdo/i,
  /^Disposing socket$/i,
  /^send queue size:/i,
  /Got status changed msg k_ESteamNetworkingConnectionState_/i,
  /^Socket closed by peer/i,
  /^Compression: Tried to remove non-existent peer/i,
  /^Steamworks: k_ESteamNetworkingConfig_/i,
];

const CONNECTION_PATTERNS = [
  /\bNew connection\b/i,
  /\bAccepting connection\b/i,
  /\bConnected\b/i,
  /Got connection SteamID/i,
  /Got handshake from client/i,
  /RPC_Disconnect/i,
  /Peer \(?\d+\)? disconnected/i,
  /disconnected, removing from validated list/i,
  /Compression:.*\bconnected\b/i,
  /Compression:.*\bdisconnected\b/i,
  /Closing socket \d+/i,
  /Adding peer \(\d+\) to validated list/i,
];

const GAME_PATTERNS = [
  ...CONNECTION_PATTERNS,
  /Got character ZDOID from/i,
  /\bkilled by\b/i,
  /\bwas slain by\b/i,
  /\bkilled \S/i,
  /Random event set:/i,
  /World (?:saved|loaded)/i,
  /\bsave\b.*\bcomplete/i,
  /Sending .+ version/i,
  /Version check,/i,
  /Registered Server Events/i,
  VALHEIM_CHAT,
];

export function stripLogPrefixes(line) {
  let text = String(line || "").trim();
  if (!text) return "";
  text = text.replace(
    /^(?:[A-Z][a-z]{2}\s+\d+\s+\d+:\d+:\d+\s+)?(?:supervisord:\s+\S+\s+)?/,
    "",
  ).trim();
  for (;;) {
    let changed = false;
    const m1 = text.match(DOCKER_TS);
    if (m1) {
      text = text.slice(m1[0].length).trim();
      changed = true;
    }
    const m2 = text.match(BEPINEX_BRACKET);
    if (m2) {
      text = text.slice(m2[0].length).trim();
      changed = true;
    }
    if (!changed) break;
  }
  return text;
}

export function parseGameChatLine(line) {
  const cleaned = stripLogPrefixes(line);
  if (!cleaned) return null;
  const m = cleaned.match(VALHEIM_CHAT);
  if (m) {
    return {
      player: m[2].trim(),
      message: m[4].trim(),
      channel: m[3].trim().toLowerCase(),
    };
  }
  for (const pat of [
    /\[Chat\]\s*(.+?):\s*(.+)$/i,
    /(?:Got message|Shout|Say|Talk)\s*(?:from\s+)?(.+?):\s*(.+)$/i,
    /^(.+?)\s+shouts?:\s*(.+)$/i,
  ]) {
    const hit = cleaned.match(pat);
    if (hit && hit[1] && hit[2] && hit[1].length <= 40) {
      return { player: hit[1].trim(), message: hit[2].trim(), channel: "chat" };
    }
  }
  return null;
}

export function isLogNoise(line) {
  const cleaned = stripLogPrefixes(line);
  if (!cleaned) return true;
  return NOISE_PATTERNS.some((pat) => pat.test(cleaned));
}

export function isLogConnection(line) {
  const cleaned = stripLogPrefixes(line);
  if (!cleaned) return false;
  return CONNECTION_PATTERNS.some((pat) => pat.test(cleaned));
}

export function isGameEvent(line) {
  if (parseGameChatLine(line)) return true;
  const cleaned = stripLogPrefixes(line);
  if (!cleaned) return false;
  return GAME_PATTERNS.some((pat) => pat.test(cleaned));
}

export function filterLogLines(lines, { hideNoise = false, category = "all", search = "" } = {}) {
  const cat = String(category || "all").toLowerCase();
  const q = String(search || "").trim().toLowerCase();
  const out = [];
  for (const line of lines || []) {
    if (!line) continue;
    if (hideNoise && isLogNoise(line)) continue;
    if (cat === "game" && !isGameEvent(line)) continue;
    if (cat === "chat" && !parseGameChatLine(line)) continue;
    if (cat === "connections" && !isLogConnection(line)) continue;
    if (q && !line.toLowerCase().includes(q)) continue;
    out.push(line);
  }
  return out;
}

export function mergeLogBuffer(buffer, incoming, maxSize = 5000) {
  const newLines = String(incoming || "").split("\n").filter((l) => l.length > 0);
  if (!newLines.length) return buffer || [];
  let buf = [...(buffer || [])];
  if (!buf.length) return newLines.slice(-maxSize);

  let overlap = 0;
  const maxCheck = Math.min(buf.length, newLines.length, 200);
  for (let n = 1; n <= maxCheck; n++) {
    const suffix = buf.slice(-n);
    const prefix = newLines.slice(0, n);
    if (suffix.every((l, i) => l === prefix[i])) overlap = n;
  }
  buf = buf.concat(newLines.slice(overlap));
  if (buf.length > maxSize) buf = buf.slice(-maxSize);
  return buf;
}
