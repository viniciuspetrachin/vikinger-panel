"""Per-locale translation maps (English source string -> translated)."""

META = {
    "pt-BR": {
        "locale": "pt-BR",
        "appTitle": "Vikinger Panel",
        "appSubtitle": "Gerenciador de Servidor PsyDev",
    },
    "de-DE": {
        "locale": "de-DE",
        "appTitle": "Vikinger Panel",
        "appSubtitle": "PsyDev Server-Manager",
    },
    "ru-RU": {
        "locale": "ru-RU",
        "appTitle": "Vikinger Panel",
        "appSubtitle": "Менеджер сервера PsyDev",
    },
    "es-ES": {
        "locale": "es-ES",
        "appTitle": "Vikinger Panel",
        "appSubtitle": "Gestor de servidor PsyDev",
    },
}

NAV = {
    "pt-BR": {
        "sections": {
            "painel": "Painel",
            "gerenciar": "Gerenciar",
            "ferramentas": "Ferramentas",
            "suporte": "Suporte",
        },
        "items": {
            "dashboard": "Visão geral",
            "server": "Servidor",
            "worlds": "Mundos",
            "mods": "Mods e Config",
            "backups": "Backups",
            "files": "Arquivos",
            "logs": "Console",
            "audit": "Auditoria",
            "help": "Ajuda",
            "donation": "Apoie o projeto",
            "about": "Sobre",
        },
        "sidebar": {
            "containerRunning": "Container em execução",
            "containerStopped": "Container parado",
        },
        "refresh": "Atualizar",
    },
    "de-DE": {
        "sections": {
            "painel": "Panel",
            "gerenciar": "Verwalten",
            "ferramentas": "Werkzeuge",
            "suporte": "Support",
        },
        "items": {
            "dashboard": "Übersicht",
            "server": "Server",
            "worlds": "Welten",
            "mods": "Mods & Config",
            "backups": "Backups",
            "files": "Dateien",
            "logs": "Konsole",
            "audit": "Audit",
            "help": "Hilfe",
            "donation": "Projekt unterstützen",
            "about": "Über",
        },
        "sidebar": {
            "containerRunning": "Container läuft",
            "containerStopped": "Container gestoppt",
        },
        "refresh": "Aktualisieren",
    },
    "ru-RU": {
        "sections": {
            "painel": "Панель",
            "gerenciar": "Управление",
            "ferramentas": "Инструменты",
            "suporte": "Поддержка",
        },
        "items": {
            "dashboard": "Обзор",
            "server": "Сервер",
            "worlds": "Миры",
            "mods": "Моды и настройки",
            "backups": "Резервные копии",
            "files": "Файлы",
            "logs": "Консоль",
            "audit": "Аудит",
            "help": "Справка",
            "donation": "Поддержать проект",
            "about": "О программе",
        },
        "sidebar": {
            "containerRunning": "Контейнер запущен",
            "containerStopped": "Контейнер остановлен",
        },
        "refresh": "Обновить",
    },
    "es-ES": {
        "sections": {
            "painel": "Panel",
            "gerenciar": "Gestionar",
            "ferramentas": "Herramientas",
            "suporte": "Soporte",
        },
        "items": {
            "dashboard": "Resumen",
            "server": "Servidor",
            "worlds": "Mundos",
            "mods": "Mods y config",
            "backups": "Copias de seguridad",
            "files": "Archivos",
            "logs": "Consola",
            "audit": "Auditoría",
            "help": "Ayuda",
            "donation": "Apoya el proyecto",
            "about": "Acerca de",
        },
        "sidebar": {
            "containerRunning": "Contenedor en ejecución",
            "containerStopped": "Contenedor detenido",
        },
        "refresh": "Actualizar",
    },
}

LOCALE_OVERRIDES = {
    locale: {
        "meta": META[locale],
        "nav": NAV[locale],
        "common": {"actions": {"close": "✕"}},
    }
    for locale in ("pt-BR", "de-DE", "ru-RU", "es-ES")
}

# English source strings that must not be auto-translated (technical / gaming terms).
KEEP_AS_IS: frozenset[str] = frozenset({
    "RAM", "CPU", "FPS", "ms", "Mods", "mods", "mod", "Mod",
    "Plugins", "Docker", "Kick", "Ban", "Form", "Raw",
    "Config", "BepInEx", "RCON", "DLL", "DLLs", "UDP", "Steam",
    "Backups", "Backup", "Audit", "Overview", "Console",
})

# English source string -> translated (applied on top of existing locale JSON)
STRING_MAPS: dict[str, dict[str, str]] = {
    "pt-BR": {
        "Download": "Baixar",
        "Console": "Console",
        "✕": "✕",
        "RAM": "RAM",
        "CPU": "CPU",
        "Mods": "Mods",
        "mods": "mods",
        "mod": "mod",
        "Mod": "Mod",
        "Plugins": "Plugins",
        "ms": "ms",
        "Kick": "Kick",
        "Ban": "Ban",
        "Form": "Form",
        "Raw": "Raw",
        "Docker": "Docker",
        "Mods ({count})": "Mods ({count})",
        "Mod: {name}": "Mod: {name}",
    },
    "de-DE": {
        "✕": "✕",
        "ms": "ms",
        "Ban": "Ban",
        "Form": "Form",
        "Raw": "Raw",
    },
    "ru-RU": {
        "✕": "✕",
        "RAM": "RAM",
        "CPU": "CPU",
        "ms": "ms",
        "Kick": "Kick",
        "Ban": "Ban",
        "Form": "Form",
        "Raw": "Raw",
        "Plugins": "Plugins",
    },
    "es-ES": {
        "✕": "✕",
        "RAM": "RAM",
        "CPU": "CPU",
        "Mods": "Mods",
        "mods": "mods",
        "mod": "mod",
        "Mod": "Mod",
        "Plugins": "Plugins",
        "ms": "ms",
        "Kick": "Kick",
        "Ban": "Ban",
        "Form": "Form",
        "Raw": "Raw",
        "Docker": "Docker",
        "Mods & BepInEx": "Mods & BepInEx",
        "Mods ({count})": "Mods ({count})",
        "BepInEx configs + player lists + .env.": "Configs de BepInEx + listas de jugadores + .env.",
        "Metrics on Overview; capacity (RAM and players) on Server tab; Tools with Files, Console, and Audit.": (
            "Métricas en descripción general; capacidad (RAM y jugadores) en la pestaña Servidor; "
            "Herramientas con Archivos, Consola y Auditoría."
        ),
    },
}
