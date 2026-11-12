import { parsePo } from './po';

describe('parsePo', () => {
    it('reads single- and multi-line entries and skips the header', () => {
        const po = [
            'msgid ""',
            'msgstr ""',
            '"Language: sv\\n"',
            '',
            '#, fuzzy',
            'msgid "Delete {name}?"',
            'msgstr "Ta bort {name}?"',
            '',
            'msgid ""',
            '"A long "',
            '"text"',
            'msgstr "En lång \\"text\\""',
            '',
            'msgid "Untranslated"',
            'msgstr ""',
        ].join('\n');

        expect(parsePo(po)).toEqual({
            'Delete {name}?': 'Ta bort {name}?',
            'A long text': 'En lång "text"',
        });
    });
});
