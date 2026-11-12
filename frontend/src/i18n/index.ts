import { parsePo, Translations } from './po';

export type Language = 'en' | 'sv';
type Params = Readonly<Record<string, string | number>>;

const SOURCE_LANGUAGE: Language = 'en';
let translations: Translations = {};

function detectLanguage(): Language {
    const stored = localStorage.getItem('lang');
    const preferred = stored || navigator.language || SOURCE_LANGUAGE;
    return preferred.toLowerCase().startsWith('sv') ? 'sv' : SOURCE_LANGUAGE;
}

/**
 * Loads `/assets/i18n/<lang>.po`. English is the source language (the msgids),
 * so it needs no file. Override the browser language with
 * `localStorage.setItem('lang', 'sv' | 'en')`.
 */
export async function loadTranslations(
    language: Language = detectLanguage()
): Promise<void> {
    document.documentElement.lang = language;
    translations = {};
    if (language === SOURCE_LANGUAGE) {
        return;
    }

    try {
        const response = await fetch(`/assets/i18n/${language}.po`);
        if (response.ok) {
            translations = parsePo(await response.text());
        }
    } catch (error) {
        console.warn('Could not load translations, falling back to English', error);
    }
}

/** Translates `msgid` and fills in `{placeholders}` from `params`. */
export function t(msgid: string, params?: Params): string {
    const template = translations[msgid] || msgid;
    if (!params) {
        return template;
    }
    return template.replace(/\{(\w+)\}/g, (match, key: string) =>
        key in params ? String(params[key]) : match
    );
}
