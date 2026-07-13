import enUS from "../../locales/en-US.json";
import ptBR from "../../locales/pt-BR.json";
import deDE from "../../locales/de-DE.json";
import ruRU from "../../locales/ru-RU.json";
import esES from "../../locales/es-ES.json";

export const LOCALE_STORAGE_KEY = "vikinger-panel-locale";
export const FALLBACK_LOCALE = "en-US";

export const SUPPORTED_LOCALES = [
  { code: "en-US", label: "English", nativeName: "English", dir: "ltr" },
  { code: "pt-BR", label: "Portuguese (Brazil)", nativeName: "Português (Brasil)", dir: "ltr" },
  { code: "de-DE", label: "German", nativeName: "Deutsch", dir: "ltr" },
  { code: "ru-RU", label: "Russian", nativeName: "Русский", dir: "ltr" },
  { code: "es-ES", label: "Spanish", nativeName: "Español", dir: "ltr" },
];

const MESSAGES = {
  "en-US": enUS,
  "pt-BR": ptBR,
  "de-DE": deDE,
  "ru-RU": ruRU,
  "es-ES": esES,
};

const SUPPORTED_CODES = new Set(SUPPORTED_LOCALES.map((l) => l.code));

let _locale = FALLBACK_LOCALE;
let _localeVersion = 0;
let _onChange = null;

function isSupported(code) {
  return SUPPORTED_CODES.has(code);
}

export function resolveLocale(apiDefault) {
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (stored && isSupported(stored)) return stored;
  } catch {
    /* private browsing */
  }
  if (apiDefault && isSupported(apiDefault)) return apiDefault;
  return FALLBACK_LOCALE;
}

function lookup(messages, key) {
  if (!messages || !key) return undefined;
  const parts = key.split(".");
  let cur = messages;
  for (const part of parts) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = cur[part];
  }
  return cur;
}

function interpolate(text, params) {
  if (!params || typeof text !== "string") return text;
  return text.replace(/\{(\w+)\}/g, (_, name) =>
    params[name] !== undefined && params[name] !== null ? String(params[name]) : `{${name}}`,
  );
}

export function getLocale() {
  return _locale;
}

export function getLocaleVersion() {
  return _localeVersion;
}

export function getMessages(locale = _locale) {
  return MESSAGES[locale] || MESSAGES[FALLBACK_LOCALE];
}

export function t(key, params, locale = _locale) {
  let value = lookup(getMessages(locale), key);
  if (value === undefined && locale !== FALLBACK_LOCALE) {
    value = lookup(MESSAGES[FALLBACK_LOCALE], key);
  }
  if (value === undefined) return key;
  if (typeof value === "string") return interpolate(value, params);
  return value;
}

export function tHtml(key, params) {
  return t(key, params);
}

export function tObj(key, locale = _locale) {
  const value = t(key, null, locale);
  return value === key ? lookup(MESSAGES[FALLBACK_LOCALE], key) : value;
}

export function setLocale(locale, { persist = true } = {}) {
  const next = isSupported(locale) ? locale : FALLBACK_LOCALE;
  if (next === _locale) return;
  _locale = next;
  _localeVersion += 1;
  if (persist) {
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }
  document.documentElement.lang = next;
  document.title = t("meta.appTitle");
  _onChange?.();
}

export function initI18n(apiDefault, onChange) {
  _onChange = onChange;
  _locale = resolveLocale(apiDefault);
  document.documentElement.lang = _locale;
  document.title = t("meta.appTitle");
}

export function createI18nMixin(onChange) {
  const translate = t;
  const translateHtml = tHtml;
  const translateObj = tObj;

  return {
    locale: FALLBACK_LOCALE,
    localeVersion: 0,
    locales: SUPPORTED_LOCALES,

    initI18nFromApi(apiDefault) {
      initI18n(apiDefault, () => {
        this.locale = getLocale();
        this.localeVersion = getLocaleVersion();
        this.syncNetChartLabels?.();
        onChange?.call(this);
      });
      this.locale = getLocale();
      this.localeVersion = getLocaleVersion();
    },

    t(key, params) {
      void this.localeVersion;
      return translate(key, params);
    },

    tHtml(key, params) {
      void this.localeVersion;
      return translateHtml(key, params);
    },

    tObj(key) {
      void this.localeVersion;
      return translateObj(key);
    },

    setLocale(code) {
      setLocale(code);
      this.locale = getLocale();
      this.localeVersion = getLocaleVersion();
      this.syncNetChartLabels?.();
    },
  };
}
