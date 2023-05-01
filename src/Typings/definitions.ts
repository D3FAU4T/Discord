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

export interface MerriamWebsterAPI {
    meta: {
        id: string;
        uuid: string;
        src: string;
        section: string;
        stems: string[];
        offensive: boolean;
    };
    hwi: {
        hw: string;
        prs: Prs[];
    };
    fl: string;
    def: Definition[];
    shortdef: string[];
}

interface Prs {
    mw: string;
    sound: {
        audio: string;
    };
}

interface Definition {
    sseq: Sseq[][][];
}

interface Sseq {
    dt: Dt[];
    sdsense?: Sdsense;
}

interface Dt {
    0: "text";
    1: string;
}

interface Sdsense {
    sd: string;
    dt: Dt[];
}