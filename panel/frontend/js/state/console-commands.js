/** RCON catalog (ValheimRcon) + terminal-style autocomplete. */

export const RCON_COMMANDS = [
  { name: "save", usage: "save", desc: "Saves the current world", category: "Server", playerArg: false },
  { name: "list", usage: "list", desc: "Lists all commands on the server", category: "Server", playerArg: false },
  { name: "players", usage: "players", desc: "Shows online players with position", category: "Server", playerArg: false },
  { name: "serverStats", usage: "serverStats", desc: "Server statistics (FPS, RAM, players)", category: "Server", playerArg: false },
  { name: "time", usage: "time", desc: "Shows server time and day", category: "Server", playerArg: false },
  { name: "logs", usage: "logs", desc: "Latest server log lines", category: "Server", playerArg: false },
  { name: "consoleCommand", usage: "consoleCommand <command>", desc: "Runs a Valheim console command", category: "Server", playerArg: false },

  { name: "kick", usage: "kick <player|SteamID>", desc: "Kicks a player", category: "Moderation", playerArg: true },
  { name: "ban", usage: "ban <player|SteamID>", desc: "Bans by name or Steam ID", category: "Moderation", playerArg: true },
  { name: "banSteamId", usage: "banSteamId <SteamID>", desc: "Bans by Steam ID", category: "Moderation", playerArg: true },
  { name: "unban", usage: "unban <player|SteamID>", desc: "Removes a ban", category: "Moderation", playerArg: true },
  { name: "addAdmin", usage: "addAdmin <SteamID>", desc: "Adds an administrator", category: "Moderation", playerArg: true },
  { name: "removeAdmin", usage: "removeAdmin <SteamID>", desc: "Removes an administrator", category: "Moderation", playerArg: true },
  { name: "addPermitted", usage: "addPermitted <SteamID>", desc: "Adds to permitted list", category: "Moderation", playerArg: true },
  { name: "removePermitted", usage: "removePermitted <SteamID>", desc: "Removes from permitted list", category: "Moderation", playerArg: true },
  { name: "adminlist", usage: "adminlist", desc: "Lists administrators", category: "Moderation", playerArg: false },
  { name: "banlist", usage: "banlist", desc: "Lists banned players", category: "Moderation", playerArg: false },
  { name: "permitted", usage: "permitted", desc: "Lists permitted players", category: "Moderation", playerArg: false },
  { name: "disconnectAll", usage: "disconnectAll", desc: "Disconnects all players", category: "Moderation", playerArg: false },

  { name: "give", usage: "give <player|SteamID> <item> [options]", desc: "Gives an item to a player", category: "Players", playerArg: true },
  { name: "heal", usage: "heal <player|SteamID> <health>", desc: "Heals player to health value", category: "Players", playerArg: true },
  { name: "damage", usage: "damage <player|SteamID> <damage>", desc: "Deals damage to a player", category: "Players", playerArg: true },
  { name: "teleport", usage: "teleport <player|SteamID> <x> <y> <z>", desc: "Teleports a player", category: "Players", playerArg: true },
  { name: "findPlayer", usage: "findPlayer <name>", desc: "Finds a player and shows details", category: "Players", playerArg: true },

  { name: "say", usage: "say <message>", desc: "Sends a chat message (shout)", category: "Chat", playerArg: false },
  { name: "showMessage", usage: "showMessage <message>", desc: "Center-screen message for everyone", category: "Chat", playerArg: false },
  { name: "ping", usage: "ping <x> <y> <z>", desc: "Map ping for everyone", category: "Chat", playerArg: false },

  { name: "spawn", usage: "spawn <prefab> <x> <y> <z> [options]", desc: "Spawns objects/creatures", category: "Objects", playerArg: false },
  { name: "findObjects", usage: "findObjects [options]", desc: "Searches for objects in the world", category: "Objects", playerArg: false },

  { name: "addGlobalKey", usage: "addGlobalKey <key>", desc: "Adds a global key (e.g. boss defeated)", category: "World", playerArg: false },
  { name: "removeGlobalKey", usage: "removeGlobalKey <key>", desc: "Removes a global key", category: "World", playerArg: false },
  { name: "globalKeys", usage: "globalKeys", desc: "Lists active global keys", category: "World", playerArg: false },
];

const COMMAND_BY_NAME = Object.fromEntries(RCON_COMMANDS.map((c) => [c.name.toLowerCase(), c]));

function longestCommonPrefix(strings) {
  if (!strings.length) return "";
  let prefix = strings[0];
  for (let i = 1; i < strings.length; i++) {
    while (!strings[i].toLowerCase().startsWith(prefix.toLowerCase())) {
      prefix = prefix.slice(0, -1);
      if (!prefix) return "";
    }
  }
  return prefix;
}

function matchCommands(prefix) {
  const p = prefix.toLowerCase();
  return RCON_COMMANDS.filter((c) => c.name.toLowerCase().startsWith(p)).map((c) => c.name);
}

function playerTargets(players) {
  const list = players?.players || players || [];
  if (!Array.isArray(list)) return [];
  const targets = [];
  for (const p of list) {
    if (p.name) targets.push(String(p.name));
    if (p.steam_id) targets.push(String(p.steam_id));
  }
  return [...new Set(targets)];
}

function matchPlayers(prefix, players) {
  const p = prefix.toLowerCase();
  return playerTargets(players).filter((t) => t.toLowerCase().startsWith(p));
}

function parseInput(input) {
  const trimmed = (input || "").trimEnd();
  const endsWithSpace = /\s$/.test(input || "");
  const parts = trimmed.split(/\s+/).filter(Boolean);
  return { trimmed, endsWithSpace, parts };
}

function buildFromParts(parts, endsWithSpace) {
  if (!parts.length) return "";
  const body = parts.join(" ");
  return endsWithSpace ? body + " " : body;
}

function applyMatch(baseParts, endsWithSpace, match, replaceIndex) {
  const parts = [...baseParts];
  parts[replaceIndex] = match;
  return buildFromParts(parts, endsWithSpace);
}

/**
 * Returns suggestions for Tab completion.
 * @returns {{ text: string, matches: string[], cycleIndex: number } | null}
 */
export function getConsoleCompletions(input, players, cycleState) {
  const { trimmed, endsWithSpace, parts } = parseInput(input);
  if (!trimmed && !endsWithSpace) return null;

  let matches = [];
  let replaceIndex = 0;
  let baseParts = [...parts];

  if (parts.length === 0 || (parts.length === 1 && !endsWithSpace)) {
    const prefix = parts[0] || "";
    matches = matchCommands(prefix);
    replaceIndex = 0;
    baseParts = prefix ? [prefix] : [];
  } else {
    const cmdName = parts[0].toLowerCase();
    const cmd = COMMAND_BY_NAME[cmdName];
    if (!cmd) return null;

    if (cmd.playerArg) {
      const argIndex = endsWithSpace ? parts.length : parts.length - 1;
      const prefix = endsWithSpace ? "" : parts[parts.length - 1] || "";
      if (argIndex === 1) {
        matches = matchPlayers(prefix, players);
        replaceIndex = 1;
        baseParts = endsWithSpace ? [...parts, ""] : [...parts];
        if (endsWithSpace) baseParts.pop();
      } else {
        return null;
      }
    } else if (!endsWithSpace && parts.length === 1) {
      matches = matchCommands(parts[0]);
      replaceIndex = 0;
    } else {
      return null;
    }
  }

  if (!matches.length) return null;

  const prev = cycleState;
  const sameInput = prev && prev.input === input;
  let index = 0;
  if (sameInput && prev.matches?.length === matches.length &&
      prev.matches.every((m, i) => m === matches[i])) {
    index = ((prev.index ?? 0) + 1) % matches.length;
  }

  const prefix = baseParts[replaceIndex] || "";
  const lcp = longestCommonPrefix(matches);
  let chosen = matches[index];

  if (matches.length > 1 && lcp.length > prefix.length && index === 0 && !sameInput) {
    chosen = lcp;
  }

  const newParts = [...baseParts];
  while (newParts.length <= replaceIndex) newParts.push("");
  newParts[replaceIndex] = chosen;

  const addTrailingSpace =
    replaceIndex === 0 &&
    COMMAND_BY_NAME[chosen.toLowerCase()] &&
    !COMMAND_BY_NAME[chosen.toLowerCase()].playerArg &&
    chosen.length === matches[index]?.length;

  let text = buildFromParts(newParts, addTrailingSpace || (replaceIndex > 0 && chosen === matches[index]));
  if (replaceIndex > 0 && chosen === matches[index] && !text.endsWith(" ")) {
    text += " ";
  }

  return { text, matches, cycleIndex: index };
}

/** Ghost suffix for preview before Tab. */
export function getConsoleGhostSuffix(input, players) {
  const { trimmed, endsWithSpace, parts } = parseInput(input);
  if (!trimmed || endsWithSpace) return "";

  if (parts.length === 1) {
    const matches = matchCommands(parts[0]);
    if (matches.length !== 1) return "";
    const rest = matches[0].slice(parts[0].length);
    return rest;
  }

  const cmd = COMMAND_BY_NAME[parts[0]?.toLowerCase()];
  if (!cmd?.playerArg || parts.length !== 2) return "";

  const prefix = parts[1] || "";
  const matches = matchPlayers(prefix, players);
  if (matches.length !== 1) return "";
  return matches[0].slice(prefix.length);
}

/** Groups filtered commands by category (for modal). */
export function groupCommandsByCategory(commands, search) {
  const q = (search || "").trim().toLowerCase();
  const filtered = q
    ? commands.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.usage.toLowerCase().includes(q) ||
          c.desc.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q),
      )
    : commands;

  const groups = {};
  for (const cmd of filtered) {
    if (!groups[cmd.category]) groups[cmd.category] = [];
    groups[cmd.category].push(cmd);
  }
  return Object.entries(groups).map(([category, items]) => ({ category, items }));
}
