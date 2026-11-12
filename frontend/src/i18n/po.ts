export type Translations = Record<string, string>;

const unescapePo = (value: string): string =>
    value.replace(/\\(.)/g, (_match, char: string) => {
        switch (char) {
            case 'n':
                return '\n';
            case 't':
                return '\t';
            default:
                return char;
        }
    });

/**
 * Minimal .po parser: reads msgid/msgstr pairs, including multi-line strings.
 * Plurals and contexts are not supported. Fuzzy entries are included.
 */
export function parsePo(content: string): Translations {
    const translations: Translations = {};
    let msgid: string | null = null;
    let msgstr: string | null = null;
    let current: 'msgid' | 'msgstr' | null = null;

    const flush = () => {
        if (msgid && msgstr) {
            translations[msgid] = msgstr;
        }
        msgid = msgstr = current = null;
    };

    for (const rawLine of content.split(/\r?\n/)) {
        const line = rawLine.trim();
        if (line === '') {
            flush();
            continue;
        }
        if (line.startsWith('#')) {
            continue;
        }

        const keyword = /^(msgid|msgstr)\s+"(.*)"$/.exec(line);
        if (keyword) {
            if (keyword[1] === 'msgid') {
                flush();
                current = 'msgid';
                msgid = unescapePo(keyword[2]);
            } else {
                current = 'msgstr';
                msgstr = unescapePo(keyword[2]);
            }
            continue;
        }

        const continuation = /^"(.*)"$/.exec(line);
        if (continuation && current === 'msgid') {
            msgid += unescapePo(continuation[1]);
        } else if (continuation && current === 'msgstr') {
            msgstr += unescapePo(continuation[1]);
        }
    }
    flush();

    return translations;
}
