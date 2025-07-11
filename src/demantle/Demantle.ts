import path from 'node:path';
import { PrettyTable } from 'prettytable.js';
import type { DemantleType, guessData, guessResult, similarityResponse } from '../typings/demantle';
import { readJsonFile, fileExists } from '../core/runtime';

const britishEnglish: Record<string, string> = await readJsonFile("./src/Demantle/BritishEnglish.json");

export default class Demantle {
    public word: string = 'd3fau4t'; // Default
    public vector: number[] = [];
    public guesses: string[] = [];
    public table: guessData[] = [];

    constructor(gameType: DemantleType) {
        this.setHiddenWord(gameType);
    }

    private async setHiddenWord(gameType: DemantleType) {

        const wordList = await this.loadWordList(path.resolve('src', 'demantle', 'English.json'));

        if (!wordList)
            throw new Error('Word list not found. Please ensure `English.json` exists at `./src/demantle/English.json`.');

        if (gameType === 'Random') {
            this.word = wordList[Math.floor(0 + (Math.random() * (wordList.length - 0 + 1)))] ?? 'd3fau4t';
            const vec = (await this.getVector(this.word, this.word))!;
            this.vector = vec.vec;
        }

        else {
            const today = Math.floor(Date.now() / 86400000);
            const initialDay = 19021;
            const puzzleNumber = (today - initialDay) % wordList.length
            const word = wordList[puzzleNumber] ?? "d3fau4t";
            this.word = word;
            const vec = (await this.getVector(word, word))!;
            this.vector = vec.vec;
        }
    }

    private async loadWordList(filePath: string): Promise<string[] | null> {
        if (!await fileExists(filePath)) return null;
        return await readJsonFile(filePath);
    }

    private async getVector(word: string, guess: string): Promise<similarityResponse | null> {
        const response = await fetch(`https://legacy.semantle.com/model2/${word}/${guess}`);

        if (response.headers.get('content-type') !== 'application/json')
            return null;

        return await response.json() as similarityResponse;
    }

    private static getSimilarityText(similarity: number, isPercentile?: boolean) {
        if (isPercentile) {
            if (similarity === 1000)
                return 'found'.padEnd(35, ' ');
            else if (similarity >= 950)
                return `${similarity}/1000 🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩`;
            else if (similarity >= 850)
                return `${similarity}/1000 🟩🟩🟩🟩🟩🟩🟩🟩🟩⬛`;
            else if (similarity >= 750)
                return `${similarity}/1000 🟩🟩🟩🟩🟩🟩🟩🟩⬛⬛`;
            else if (similarity >= 650)
                return `${similarity}/1000 🟩🟩🟩🟩🟩🟩🟩⬛⬛⬛`;
            else if (similarity >= 550)
                return `${similarity}/1000 🟩🟩🟩🟩🟩🟩⬛⬛⬛⬛`;
            else if (similarity >= 450)
                return `${similarity}/1000 🟩🟩🟩🟩🟩⬛⬛⬛⬛⬛`;
            else if (similarity >= 350)
                return `${similarity}/1000 🟩🟩🟩🟩⬛⬛⬛⬛⬛⬛`;
            else if (similarity >= 250)
                return `${similarity}/1000 🟩🟩🟩⬛⬛⬛⬛⬛⬛⬛`;
            else if (similarity >= 150)
                return `${similarity}/1000 🟩🟩⬛⬛⬛⬛⬛⬛⬛⬛`;
            else
                return `${similarity}/1000 🟩⬛⬛⬛⬛⬛⬛⬛⬛⬛`;
        }

        else {
            if (similarity == 100)
                return 'found' + ' '.repeat(30);
            else if (similarity <= 20)
                return 'cold' + ' '.repeat(31);
            else if (similarity <= 30)
                return 'tepid' + ' '.repeat(30);
            else
                return 'warm' + ' '.repeat(31);
        }
    }

    public static getSimilarity(vecA: number[], vecB: number[]): number {

        const dot = (a: typeof vecA, b: typeof vecB) =>
            a.reduce((sum, val, i) => sum + val * b[i]!, 0);

        const magA = Math.sqrt(dot(vecA, vecA));
        const magB = Math.sqrt(dot(vecB, vecB));

        if (magA && magB)
            return dot(vecA, vecB) / (magA * magB);

        return 0;
    }

    public async guess(word: string, username: string): Promise<guessResult> {
        let gettingClose = 'Are we getting close?';
        word = word.toLowerCase();

        if (word in britishEnglish)
            word = britishEnglish[word] ?? word;

        if (this.guesses.includes(word))
            return { success: false, error: 'already_guessed' };

        const data = await this.getVector(this.word, word);

        if (!data)
            return { success: false, error: 'invalid_guess' };

        this.guesses.push(word);

        const similarity = Math.round(Demantle.getSimilarity(this.vector, data.vec) * 10000) / 100;

        if (data.percentile)
            gettingClose = Demantle.getSimilarityText(data.percentile, true);
        else
            gettingClose = Demantle.getSimilarityText(similarity);


        const currentGuess = {
            word,
            username,
            similarity,
            gettingClose
        };

        this.table.push(currentGuess);
        this.table.sort((a, b) => b.similarity - a.similarity);

        if (this.table.length > 9)
            this.table.pop();

        return {
            success: true,
            table: this.getTable(currentGuess),
            currentGuess
        };
    }

    public getTable(currentGuess: guessData): string {
        const table = new PrettyTable();

        table.setHeader(["From", "#", "Guess", "Similarity", "Getting Close?"]);

        table.addRow([
            currentGuess.username,
            this.guesses.indexOf(currentGuess.word) + 1,
            currentGuess.word,
            currentGuess.similarity,
            currentGuess.gettingClose
        ]);

        table.addRow(["________", "__", "___________", "___________", "__________________________________"]);
        table.addRow(["        ", "  ", "           ", "           ", "                                  "]);

        for (const row of this.table)
            table.addRow([
                row.username,
                this.guesses.indexOf(row.word) + 1,
                row.word,
                row.similarity,
                row.gettingClose
            ]);

        return "\`\`\`\n" + table.toString().replace(/[-+|]/g, '').replace(/_/g, '\\_') + "\n\`\`\`";        
    }
}
