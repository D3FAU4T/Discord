import { fetch as fetch } from 'bun';
import { Message } from 'discord.js';
import { PrettyTable, type Cell } from 'prettytable.js';
import {
    type GuessData,
    HiddenWordType,
    ResponseType,
    type d3mantleConfig,
    type responses,
    type metaData
} from '../Typings/Demantle.js';

const similarity = require('cosine-similarity');
const britishEnglish: Record<string, string> = await Bun.file("./src/Demantle/BritishEnglish.json").json();

export class Demantle {

    private mainWordVec: number[] = [];
    private guesses: GuessData[] = [];
    private indexes: string[] = [];
    private fetchWordArray: () => Promise<string[]>;
    private similarityHandler: (mainWord: string, yourGuess: string, guesser: string) => Promise<GuessData | undefined>;

    static similarityText: (similarity: number) => string;

    public ignoreList: string[] = [];
    public SetHiddenWord: (inputTypeNum: HiddenWordType) => Promise<void>;
    public reset: () => void;
    public getMetadata: () => metaData;
    public between: (min: number, max: number) => number;
    public GiveUp: () => string;
    public updateMessage: (message: Message<boolean>) => void;
    public guess: (word: string, username: string) => Promise<responses | undefined>;
    public tableMaker: (currentGuess: GuessData, guesses: GuessData[]) => string;
    public toJSON: () => { guesses: GuessData[]; indexes: string[]; mainWordVec: number[]; ignoreList: string[]; fetchWordArray: string; similarityHandler: string; similarityText: string; SetHiddenWord: string; reset: string; between: string; GiveUp: string; updateMessage: string; guess: string; tableMaker: string; configurations: d3mantleConfig; };
    public configurations: d3mantleConfig = {
        hiddenWord: "",
        findTheWord: true,
        message: null,
        initialMessage: true
    }

    constructor(hiddenWord: HiddenWordType | string) {
        this.SetHiddenWord = async (inputTypeNum: HiddenWordType): Promise<void> => {

            const wordList = await this.fetchWordArray();

            if (inputTypeNum === HiddenWordType.Senior) {
                const now = Date.now();
                const today = Math.floor(now / 86400000);
                const initialDay = 19021;
                const puzzleNumber = (today - initialDay) % wordList.length
                this.reset();
                const word = wordList[puzzleNumber] || "default";
                this.configurations.hiddenWord = word;
                const response = await fetch(`https://legacy.semantle.com/model2/${word}/${word}`);
                const data = await response.json() as { vec: number[] };
                this.mainWordVec = data.vec;
            }
            
            else {
                const randIndex = this.between(0, wordList.length);
                const word = wordList[randIndex] || ""; // Ensure word is a string
                this.configurations.hiddenWord = word;
                const response = await fetch(`https://legacy.semantle.com/model2/${word}/${word}`);
                const data = await response.json() as { vec: number[] };
                this.mainWordVec = data.vec;
            }
        }

        // Fetching wordlist from https://legacy.semantle.com website
        this.fetchWordArray = async (): Promise<string[]> => {
            const response = await fetch("https://legacy.semantle.com/assets/js/secretWords.js?ver2=");
            const text = await response.text();
            const wordList: string[] = JSON.parse(text.replace('secretWords = ', '').replace(/\n/g, '').replace(',]', ']'));
            return wordList;
        }

        this.reset = (): void => {
            this.configurations.hiddenWord = "";
            this.configurations.findTheWord = true;
            this.guesses = [];
        }

        this.between = (min: number, max: number): number => {
            return Math.floor(min + (Math.random() * (max - min + 1)));
        }

        this.GiveUp = (): string => {
            return this.configurations.hiddenWord;
        }

        this.updateMessage = (message: Message<boolean>): void => {
            this.configurations.message = message;
        }

        this.getMetadata = (): metaData => {
            return {
                "guesses": this.guesses,
                "indexes": this.indexes,
            }
        }

        this.similarityHandler = async (mainWord: string, yourGuess: string, guesser: string): Promise<GuessData | undefined> => {

            let text = '';
            let similarityNumber = 0;

            try {
                const response = await fetch(`https://legacy.semantle.com/model2/${mainWord}/${yourGuess}`);
                const data = await response.json() as { percentile?: number, vec: number[] } | '';
                if (data === '') return;

                similarityNumber = Math.round((similarity(this.mainWordVec, data.vec) * 100) * 100) / 100;

                if (data.percentile) {
                    if (data.percentile === 1000) text = 'found'.padEnd(35, ' ');
                    else if (data.percentile >= 950 && data.percentile < 1000) text = `${data.percentile}/1000 🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩`;
                    else if (data.percentile >= 850) text = `${data.percentile}/1000 🟩🟩🟩🟩🟩🟩🟩🟩🟩⬛`;
                    else if (data.percentile >= 750) text = `${data.percentile}/1000 🟩🟩🟩🟩🟩🟩🟩🟩⬛⬛`;
                    else if (data.percentile >= 650) text = `${data.percentile}/1000 🟩🟩🟩🟩🟩🟩🟩⬛⬛⬛`;
                    else if (data.percentile >= 550) text = `${data.percentile}/1000 🟩🟩🟩🟩🟩🟩⬛⬛⬛⬛`;
                    else if (data.percentile >= 450) text = `${data.percentile}/1000 🟩🟩🟩🟩🟩⬛⬛⬛⬛⬛`;
                    else if (data.percentile >= 350) text = `${data.percentile}/1000 🟩🟩🟩🟩⬛⬛⬛⬛⬛⬛`;
                    else if (data.percentile >= 250) text = `${data.percentile}/1000 🟩🟩🟩⬛⬛⬛⬛⬛⬛⬛`;
                    else if (data.percentile >= 150) text = `${data.percentile}/1000 🟩🟩⬛⬛⬛⬛⬛⬛⬛⬛`;
                }
                
                else 
                    text = Demantle.similarityText(similarityNumber);
            }
            
            catch (err) {
                console.error(err);
            }

            return {
                guesser,
                word: yourGuess,
                similarity: similarityNumber,
                gettingClose: text
            }

        }

        Demantle.similarityText = (similarity: number): string => {
            if (similarity == 100) return 'found' + ' '.repeat(35 - 'found'.length);
            else if (similarity <= 20) return 'cold' + ' '.repeat(35 - 'cold'.length);
            else if (similarity <= 30) return 'tepid' + ' '.repeat(35 - 'tepid'.length);
            else return 'warm' + ' '.repeat(35 - 'warm'.length);
        }

        this.guess = async (word: string, username: string): Promise<responses | undefined> => {

            word = word.toLowerCase().replace(/_/g, '\_');
            if (Object.keys(britishEnglish).includes(word)) word = britishEnglish[word] ?? word;

            // Word Checking process
            if (!this.configurations.findTheWord) return;

            if (this.indexes.includes(word)) return {
                reason: ResponseType.AlreadyExists,
                message: `The word \`${word}\` has already been guessed\n${this.configurations.message?.content}`,
                initialMessage: this.configurations.message,
                guesses: this.guesses,
                indexes: this.indexes
            }
            // Word pushing process
            else this.indexes.push(word);

            const data = await this.similarityHandler(this.configurations.hiddenWord, word, username.normalize('NFKC'));

            if (data === undefined) {
                if (this.configurations.initialMessage) return {
                    reason: ResponseType.InvalidWord,
                    message: `Idk the word \`${word}\` :'(`,
                    initialMessage: this.configurations.message,
                    guesses: this.guesses,
                    indexes: this.indexes
                }

                else return {
                    reason: ResponseType.EditSelfMessageContent,
                    message: `Idk the word \`${word}\` :'(\n${this.configurations.message?.content}`,
                    initialMessage: this.configurations.message,
                    guesses: this.guesses,
                    indexes: this.indexes
                }
            }

            if (data.similarity === 100) {

                this.configurations.findTheWord = false;
                return {
                    reason: ResponseType.Found,
                    message: `${username} found the word ${word}!\nPOG\nPOG\nPOG\nIt took ${this.indexes.length} no. of guesses to get the hidden word`,
                    initialMessage: this.configurations.message,
                    word,
                    scoreboard: this.tableMaker(data, this.guesses),
                    guessLength: this.indexes.length,
                    guesses: this.guesses,
                    indexes: this.indexes
                }
            }

            this.guesses.push(data);

            if (this.configurations.initialMessage) {

                this.configurations.initialMessage = false;
                return {
                    reason: ResponseType.UpdateInitialMessage,
                    message: this.tableMaker(data, this.guesses),
                    initialMessage: this.configurations.message,
                    guesses: this.guesses,
                    indexes: this.indexes
                }

            }
            else return {
                reason: ResponseType.UpdateInitialMessageEdit,
                message: this.tableMaker(data, this.guesses),
                initialMessage: this.configurations.message,
                guesses: this.guesses,
                indexes: this.indexes
            }
        }

        this.tableMaker = (currentGuess: GuessData, guesses: GuessData[]): string => {
            const table = new PrettyTable();
            const formattedGuesses: [string, number, string, number, string][] = []

            for (const guess of guesses.sort((a, b) => b.similarity - a.similarity)) {
                formattedGuesses.push([
                    guess.guesser,
                    this.indexes.indexOf(guess.word) + 1,
                    guess.word,
                    guess.similarity,
                    guess.gettingClose
                ])
            }

            formattedGuesses.unshift([
                currentGuess.guesser,
                this.indexes.indexOf(currentGuess.word) + 1,
                currentGuess.word,
                currentGuess.similarity,
                currentGuess.gettingClose
            ])


            table.setHeader(["From", "#", "Guess", "Similarity", "Getting Close?"]);
            table.addRow(formattedGuesses[0] as Cell[]);
            table.addRow(["________", "__", "___________", "___________", "__________________________________"]);
            table.addRow(["        ", "  ", "           ", "           ", "                                  "]);
            for (const guess of formattedGuesses.slice(1, 10)) {
                table.addRow(guess);
            }

            return "\`\`\`\n" + table.toString().replace(/[-+|]/g, '').replace(/_/g, '\_') + "\n\`\`\`"
        }

        this.toJSON = () => {
            return {
                guesses: this.guesses,
                indexes: this.indexes,
                mainWordVec: this.mainWordVec,
                ignoreList: this.ignoreList,
                fetchWordArray: this.fetchWordArray.toString(),
                similarityHandler: this.similarityHandler.toString(),
                similarityText: Demantle.similarityText.toString(),
                SetHiddenWord: this.SetHiddenWord.toString(),
                reset: this.reset.toString(),
                between: this.between.toString(),
                GiveUp: this.GiveUp.toString(),
                updateMessage: this.updateMessage.toString(),
                guess: this.guess.toString(),
                tableMaker: this.tableMaker.toString(),
                configurations: this.configurations
            }
        }

        if (typeof hiddenWord === 'string') this.configurations.hiddenWord = hiddenWord.toLowerCase();
        else if (hiddenWord === HiddenWordType.Senior || HiddenWordType.Random) this.SetHiddenWord(hiddenWord);
    }
}