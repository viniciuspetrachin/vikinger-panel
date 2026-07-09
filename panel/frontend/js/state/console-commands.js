/** Catálogo RCON (ValheimRcon) + autocomplete estilo terminal. */

export const RCON_COMMANDS = [
  { name: "save", usage: "save", desc: "Salva o mundo atual", category: "Servidor", playerArg: false },
  { name: "list", usage: "list", desc: "Lista todos os comandos no servidor", category: "Servidor", playerArg: false },
  { name: "players", usage: "players", desc: "Mostra jogadores online com posição", category: "Servidor", playerArg: false },
  { name: "serverStats", usage: "serverStats", desc: "Estatísticas do servidor (FPS, RAM, jogadores)", category: "Servidor", playerArg: false },
  { name: "time", usage: "time", desc: "Mostra hora e dia do servidor", category: "Servidor", playerArg: false },
  { name: "logs", usage: "logs", desc: "Últimas linhas do log do servidor", category: "Servidor", playerArg: false },
  { name: "consoleCommand", usage: "consoleCommand <comando>", desc: "Executa comando de console Valheim", category: "Servidor", playerArg: false },

  { name: "kick", usage: "kick <jogador|SteamID>", desc: "Expulsa um jogador", category: "Moderação", playerArg: true },
  { name: "ban", usage: "ban <jogador|SteamID>", desc: "Bane por nome ou Steam ID", category: "Moderação", playerArg: true },
  { name: "banSteamId", usage: "banSteamId <SteamID>", desc: "Bane pelo Steam ID", category: "Moderação", playerArg: true },
  { name: "unban", usage: "unban <jogador|SteamID>", desc: "Remove banimento", category: "Moderação", playerArg: true },
  { name: "addAdmin", usage: "addAdmin <SteamID>", desc: "Adiciona administrador", category: "Moderação", playerArg: true },
  { name: "removeAdmin", usage: "removeAdmin <SteamID>", desc: "Remove administrador", category: "Moderação", playerArg: true },
  { name: "addPermitted", usage: "addPermitted <SteamID>", desc: "Adiciona à lista de permitidos", category: "Moderação", playerArg: true },
  { name: "removePermitted", usage: "removePermitted <SteamID>", desc: "Remove da lista de permitidos", category: "Moderação", playerArg: true },
  { name: "adminlist", usage: "adminlist", desc: "Lista administradores", category: "Moderação", playerArg: false },
  { name: "banlist", usage: "banlist", desc: "Lista jogadores banidos", category: "Moderação", playerArg: false },
  { name: "permitted", usage: "permitted", desc: "Lista jogadores permitidos", category: "Moderação", playerArg: false },
  { name: "disconnectAll", usage: "disconnectAll", desc: "Desconecta todos os jogadores", category: "Moderação", playerArg: false },

  { name: "give", usage: "give <jogador|SteamID> <item> [opções]", desc: "Dá item a um jogador", category: "Jogadores", playerArg: true },
  { name: "heal", usage: "heal <jogador|SteamID> <vida>", desc: "Cura jogador até o valor de vida", category: "Jogadores", playerArg: true },
  { name: "damage", usage: "damage <jogador|SteamID> <dano>", desc: "Causa dano a um jogador", category: "Jogadores", playerArg: true },
  { name: "teleport", usage: "teleport <jogador|SteamID> <x> <y> <z>", desc: "Teleporta jogador", category: "Jogadores", playerArg: true },
  { name: "findPlayer", usage: "findPlayer <nome>", desc: "Busca jogador e mostra detalhes", category: "Jogadores", playerArg: true },

  { name: "say", usage: "say <mensagem>", desc: "Envia mensagem no chat (grito)", category: "Chat", playerArg: false },
  { name: "showMessage", usage: "showMessage <mensagem>", desc: "Mensagem central na tela de todos", category: "Chat", playerArg: false },
  { name: "ping", usage: "ping <x> <y> <z>", desc: "Ping no mapa para todos", category: "Chat", playerArg: false },

  { name: "spawn", usage: "spawn <prefab> <x> <y> <z> [opções]", desc: "Spawna objetos/creaturas", category: "Objetos", playerArg: false },
  { name: "findObjects", usage: "findObjects [opções]", desc: "Busca objetos no mundo", category: "Objetos", playerArg: false },

  { name: "addGlobalKey", usage: "addGlobalKey <chave>", desc: "Adiciona global key (ex: boss derrotado)", category: "Mundo", playerArg: false },
  { name: "removeGlobalKey", usage: "removeGlobalKey <chave>", desc: "Remove global key", category: "Mundo", playerArg: false },
  { name: "globalKeys", usage: "globalKeys", desc: "Lista global keys ativas", category: "Mundo", playerArg: false },
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
 * Retorna sugestões para Tab completion.
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

/** Sufixo fantasma para preview antes do Tab. */
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

/** Agrupa comandos filtrados por categoria (para modal). */
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
