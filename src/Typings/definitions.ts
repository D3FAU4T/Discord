interface dictionaryAPIPhonetics {
    text?: string;
    audio?: string;
    sourceUrl?: string;
    license?: {
        name: string;
        url: string;
    }
}

interface dictionaryAPIMeanings {
    partOfSpeech: "noun" | "verb" | "interjection";
    definitions: {
        definition: string;
        synonyms: string[] | [];
        antonyms: string[] | [];
        example?: string;
    }[],
    synonyms?: string[] | [];
    antonyms?: string[] | [];
}

export interface dictionaryAPI {
    word: string;
    phonetics: dictionaryAPIPhonetics[];
    meanings: dictionaryAPIMeanings[];
    license: {
        name: string;
        url: string;
    },
    sourceUrls: string[];
}