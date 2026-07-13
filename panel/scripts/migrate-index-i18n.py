#!/usr/bin/env python3
"""Apply i18n x-text / :placeholder bindings to panel/static/index.html."""

from __future__ import annotations

import re
from pathlib import Path

HTML = Path(__file__).resolve().parent.parent / "static" / "index.html"

# (literal substring in HTML, replacement) — order matters for longer strings first
REPLACEMENTS: list[tuple[str, str]] = sorted([
    # Setup wizard
    ('<h2 class="font-display text-xl font-bold text-valheim-gold">Set up server</h2>',
     '<h2 class="font-display text-xl font-bold text-valheim-gold" x-text="t(\'setup.title\')">Set up server</h2>'),
    ('<p class="text-sm text-gray-400 mt-1">Choose how the Valheim server will run.</p>',
     '<p class="text-sm text-gray-400 mt-1" x-text="t(\'setup.subtitle\')">Choose how the Valheim server will run.</p>'),
    ('<label class="block text-xs text-gray-500 mb-2">Server mode</label>',
     '<label class="block text-xs text-gray-500 mb-2" x-text="t(\'setup.serverMode\')">Server mode</label>'),
    ('>Vanilla\n          </label>',
     ' x-text="t(\'setup.modes.vanilla\')">Vanilla\n          </label>'),
    ('>With mods (BepInEx)\n          </label>',
     ' x-text="t(\'setup.modes.bepinex\')">With mods (BepInEx)\n          </label>'),
    ('x-show="setupMode === \'vanilla\'">\n          No BepInEx and no mods.',
     'x-show="setupMode === \'vanilla\'" x-text="t(\'setup.vanillaHint\')">\n          No BepInEx and no mods.'),
    ('x-show="setupMode === \'bepinex\'">\n          Enables BepInEx',
     'x-show="setupMode === \'bepinex\'" x-text="t(\'setup.bepinexHint\')">\n          Enables BepInEx'),
    ('<label class="block text-xs text-gray-500 mb-1">Your Steam ID (admin)</label>',
     '<label class="block text-xs text-gray-500 mb-1" x-text="t(\'setup.adminSteamId\')">Your Steam ID (admin)</label>'),
    ('placeholder="76561198000000000"',
     ':placeholder="t(\'setup.adminSteamIdPlaceholder\')"'),
    ('<p class="text-xs text-gray-600 mt-1">Optional for now — you can edit later under Server → Player Lists.</p>',
     '<p class="text-xs text-gray-600 mt-1" x-text="t(\'setup.adminSteamIdHint\')">Optional for now — you can edit later under Server → Player Lists.</p>'),
    ('<label class="block text-xs text-gray-500 mb-1">First world (optional)</label>',
     '<label class="block text-xs text-gray-500 mb-1" x-text="t(\'setup.firstWorld\')">First world (optional)</label>'),
    ('placeholder="MyWorld"',
     ':placeholder="t(\'setup.firstWorldPlaceholder\')"'),
    ('>Create and activate this world\n        </label>',
     ' x-text="t(\'setup.createAndActivate\')">Create and activate this world\n        </label>'),
    ('<span x-show="actionPending !== \'completeSetup\'">Confirm and start</span>',
     '<span x-show="actionPending !== \'completeSetup\'" x-text="t(\'common.actions.confirmAndStart\')">Confirm and start</span>'),
    ('<span x-show="actionPending === \'completeSetup\'">Applying...</span>',
     '<span x-show="actionPending === \'completeSetup\'" x-text="t(\'common.loading.applying\')">Applying...</span>'),
    ('<h3 class="font-display text-lg font-semibold text-valheim-gold">Generated RCON password</h3>',
     '<h3 class="font-display text-lg font-semibold text-valheim-gold" x-text="t(\'setup.rconPassword.title\')">Generated RCON password</h3>'),
    ('<p class="text-sm text-gray-400">The panel has configured ValheimRcon. Copy the password — it will not be shown again.</p>',
     '<p class="text-sm text-gray-400" x-text="t(\'setup.rconPassword.body\')">The panel has configured ValheimRcon. Copy the password — it will not be shown again.</p>'),
    ('<button @click="copyText(setupRconPassword)" class="btn btn-sm btn-ghost shrink-0">Copy</button>',
     '<button @click="copyText(setupRconPassword)" class="btn btn-sm btn-ghost shrink-0" x-text="t(\'common.actions.copy\')">Copy</button>'),
    ('<button @click="dismissRconPassword()" class="btn btn-primary w-full">Got it</button>',
     '<button @click="dismissRconPassword()" class="btn btn-primary w-full" x-text="t(\'common.actions.gotIt\')">Got it</button>'),
    # Sidebar meta
    ('<h1 class="font-display text-xl font-bold text-valheim-gold tracking-wide">Vikinger Panel</h1>',
     '<h1 class="font-display text-xl font-bold text-valheim-gold tracking-wide" x-text="t(\'meta.appTitle\')">Vikinger Panel</h1>'),
    ('<p class="text-xs text-gray-500 mt-1">PsyDev Server Manager</p>',
     '<p class="text-xs text-gray-500 mt-1" x-text="t(\'meta.appSubtitle\')">PsyDev Server Manager</p>'),
    ("x-text=\"status.container === 'running' ? 'Container running' : 'Container stopped'\"",
     "x-text=\"status.container === 'running' ? t('nav.sidebar.containerRunning') : t('nav.sidebar.containerStopped')\""),
    # Language selector placeholder - inserted separately
    # Header refresh
    ('\n          Refresh\n        </button>',
     '\n          <span x-text="t(\'nav.refresh\')">Refresh</span>\n        </button>'),
    # Dashboard stats
    ('<p class="text-xs text-gray-500 uppercase tracking-wider">Server</p>',
     '<p class="text-xs text-gray-500 uppercase tracking-wider" x-text="t(\'dashboard.stats.server\')">Server</p>'),
    ('<p class="text-xs text-gray-500 uppercase tracking-wider">Active World</p>',
     '<p class="text-xs text-gray-500 uppercase tracking-wider" x-text="t(\'dashboard.stats.activeWorld\')">Active World</p>'),
    ('<p class="text-xs text-gray-500 uppercase tracking-wider">Players Online</p>',
     '<p class="text-xs text-gray-500 uppercase tracking-wider" x-text="t(\'dashboard.stats.playersOnline\')">Players Online</p>'),
    ('<p class="text-xs text-gray-500 uppercase tracking-wider">Mods</p>',
     '<p class="text-xs text-gray-500 uppercase tracking-wider" x-text="t(\'dashboard.stats.mods\')">Mods</p>'),
    ('<p class="text-xs text-gray-500 uppercase tracking-wider">Port</p>',
     '<p class="text-xs text-gray-500 uppercase tracking-wider" x-text="t(\'dashboard.stats.port\')">Port</p>'),
    ('<h3 class="font-display text-sm font-semibold text-valheim-gold">Performance</h3>',
     '<h3 class="font-display text-sm font-semibold text-valheim-gold" x-text="t(\'dashboard.performance\')">Performance</h3>'),
    ("x-text=\"metricsLoading ? 'Loading...' : 'Real-time'\"",
     "x-text=\"metricsLoading ? t('common.loading.loading') : t('common.status.realTime')\""),
    ('<p class="text-xs text-gray-500 uppercase tracking-wider mb-1">CPU</p>',
     '<p class="text-xs text-gray-500 uppercase tracking-wider mb-1" x-text="t(\'dashboard.metrics.cpu\')">CPU</p>'),
    ('<p class="text-xs text-gray-500 uppercase tracking-wider mb-1">RAM</p>',
     '<p class="text-xs text-gray-500 uppercase tracking-wider mb-1" x-text="t(\'dashboard.metrics.ram\')">RAM</p>'),
    # Help
    ('placeholder="Search FAQ..."',
     ':placeholder="t(\'help.searchPlaceholder\')"'),
    # Toast shadow fix
    ('<template x-for="(t, i) in toasts" :key="i">',
     '<template x-for="(toast, i) in toasts" :key="i">'),
    (':class="t.type === \'error\'',
     ':class="toast.type === \'error\''),
    ('x-text="t.msg"></div>',
     'x-text="toast.msg"></div>'),
], key=lambda x: -len(x[0]))


def main() -> None:
    text = HTML.read_text(encoding="utf-8")
    for old, new in REPLACEMENTS:
        if old in text:
            text = text.replace(old, new, 1)
    # Language selector in sidebar footer
    lang_select = '''
        <label class="block text-[10px] text-gray-600 mb-1" x-text="t('common.language')">Language</label>
        <select x-model="locale" @change="setLocale($event.target.value)"
                class="w-full bg-valheim-950 border border-valheim-600 rounded-lg px-2 py-1.5 text-xs text-gray-300">
          <template x-for="loc in locales" :key="loc.code">
            <option :value="loc.code" x-text="loc.nativeName"></option>
          </template>
        </select>
'''
    marker = '<div class="p-4 border-t border-valheim-700 space-y-3 shrink-0">'
    if 'common.language' not in text and marker in text:
        text = text.replace(marker, marker + lang_select, 1)
    # data-nav-id on nav buttons
    text = re.sub(
        r'(<button @click="goToPage\(item\.id\)")',
        r'\1 :data-nav-id="item.id"',
        text,
    )
    HTML.write_text(text, encoding="utf-8")
    print(f"Updated {HTML}")


if __name__ == "__main__":
    main()
