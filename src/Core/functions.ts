import axios from 'axios';
import { codeBlock } from 'discord.js';
import { readFileSync } from 'fs'
import { parseOpts, axiosMethods, twitchDataSuccessResponse, twitchDataFailureResponse } from '../Typings/functions.js';
import { responses, ResponseType } from '../Typings/Demantle.js';
import WebSocket from 'ws';

export const between = (min: number, max: number) => Math.floor(min + (Date.now() % (max - min + 1)));

export const GetRandom = <T>(array: T[]): T => array[between(0, array.length)];

export const parser = (response: any, response_parser: parseOpts) => {
    switch (response_parser) {
        case 'json':
            return codeBlock('json', JSON.stringify(response.data, null, 2));
        case 'text':
            return codeBlock('text', response.data);
        case 'html':
            return codeBlock('html', response.data);
        case 'js':
            return codeBlock('js', response.data);
        case 'python':
            return codeBlock('python', response.data);
        case 'diff':
            return codeBlock('diff', response.data);
        default:
            return 'Invalid response parser';
    }
}

export const axiosHandler = async (url: string, method: axiosMethods, headers?: object, data?: any) => {
    try {
        return await axios({
            method: method,
            url: url,
            headers: headers,
            data: data
        })
    } catch (error) {
        if (axios.isAxiosError(error)) return error.response?.data;
        else return error;
    }
}

export const fetchCheaters = (startingIndex = 0, endingIndex = Number.MAX_SAFE_INTEGER): string[] =>
    (Object.values(JSON.parse(readFileSync('./src/Config/cheaters.json', 'utf-8').toLowerCase())) as string[])
        .sort()
        .map((person) => person.includes("_") ? `\`${person}\`` : person)
        .slice(startingIndex, endingIndex);


export const numberAssign = <T>(arr: T[], startingIndex: number) => arr.map((person, i) => `${startingIndex + i + 1}. ${person}`);

export const handleSocketReply = (res: responses, ws: WebSocket, gameType: "Random" | "Today" | "Connect") => {
    if (res.reason === ResponseType.Found) {
        ws.send(`{ "Server": [ "D3_found", { "guessArr": ${JSON.stringify(res.guesses)} , "indexes": ${JSON.stringify(res.indexes)} , "gameType": "${gameType}", "word": "${res.word}" } ] }`)
    }

    else if (res.reason === ResponseType.AlreadyExists) {
        ws.send(`{ "Server": [ "D3_exist" ] }`)
    }

    else if (res.reason === ResponseType.InvalidWord || res.reason === ResponseType.EditSelfMessageContent) {
        ws.send(`{ "Server": [ "D3_invalid" ] }`)
    }

    else ws.send(`{ "Server": ["D3_guess", { "guessArr": ${JSON.stringify(res.guesses)} , "indexes": ${JSON.stringify(res.indexes)} , "gameType": "${gameType}" }] }`);
}

export const getTwitchData = async (username: string): Promise<twitchDataSuccessResponse | twitchDataFailureResponse> => {
    const { data } = await axios.get(`https://api.twitchinsights.net/v1/user/status/${username}`)
    return data;
}