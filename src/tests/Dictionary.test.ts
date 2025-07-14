import * as cheerio from 'cheerio';
import { expect, test, describe } from "bun:test";

const freeDictionaryApi = async (word: string) =>
    await fetch("https://api.dictionaryapi.dev/api/v2/entries/en/" + word);

const priberamApi = async (palavra: string) =>
    await fetch('https://dicionario.priberam.org/' + palavra);

describe('FreeDictionaryApi fetch tests', () => {
    test('Checks with valid word', async () => {
        const response = await freeDictionaryApi("hello");
        expect(response.ok).toBe(true);
        const data = await response.json();
        expect(data).toBeArray();
    });

    test('Checks with invalid word', async () => {
        const response = await freeDictionaryApi("invalidword123");
        expect(response.ok).toBe(false);
        const data = await response.json();
        expect(data).toBeObject();
    });
});

describe('PriberamApi fetch tests', () => {
    test('Checks with valid word', async () => {
        const response = await priberamApi("casa");
        expect(response.ok).toBe(true);
        const data = await response.text();
        const $ = cheerio.load(data);
        const primaryImageLink = $('img[loading="lazy"]').first().attr('src');
        expect(primaryImageLink).toBeString();
    });

    test('Checks with invalid word', async () => {
        const response = await priberamApi("palavrainvalida");
        expect(response.ok).toBe(true);
        const data = await response.text();
        const $ = cheerio.load(data);
        const primaryImageLink = $('img[loading="lazy"]').first().attr('src');
        expect(primaryImageLink).toBeUndefined();
    });
});