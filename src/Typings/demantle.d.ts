import type { Message } from "discord.js";
import type Demantle from "../demantle/Demantle";

export type DemantleType = 'Random' | 'Daily'

export type similarityResponse = {
    percentile?: number;
    vec: number[];
}

export type guessData = {
    username: string;
    word: string;
    similarity: number;
    gettingClose: string;
}

export type guessResult = 
    | { success: true; table: string; currentGuess: guessData }
    | { success: false; error: 'already_guessed' }
    | { success: false; error: 'invalid_guess' };

export type demantleManager = {
    ignoreIds: string[];
    game: Demantle;
    message: Message<boolean> | null;
}

export type demantleDb = {
    userId: string;
    wins: number;
}