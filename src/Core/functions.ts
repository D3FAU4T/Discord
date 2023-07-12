import axios from 'axios';
import WebSocket from 'ws';
import { codeBlock } from 'discord.js';
import { readFileSync, writeFileSync } from 'fs'
import { parseOpts, axiosMethods, twitchDataSuccessResponse, twitchDataFailureResponse } from '../Typings/functions.js';
import { responses, ResponseType } from '../Typings/Demantle.js';
import { WOSLevel, WOSboard } from '../Typings/WOS.js';
import { TwitchUser, TwitchUserData } from '../Typings/TwitchAPI.js';

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


export const numberAssign = <T>(arr: T[], startingIndex: number): string[] => arr.map((person, i) => `${startingIndex + i + 1}. ${person}`);

export const handleSocketReply = (res: responses, ws: WebSocket, gameType: "Random" | "Today" | "Connect"): void => {
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
    const { data } = await axios.get<twitchDataSuccessResponse | twitchDataFailureResponse>(`https://api.twitchinsights.net/v1/user/status/${username}`)
    return data;
}

const chunkArray = <T>(array: T[], chunkSize: number) => {
    const chunkedArray = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        const chunk = array.slice(i, i + chunkSize);
        chunkedArray.push(chunk);
    }
    return chunkedArray;
}

export const getTwitchDataFromId = async (arrOfIds: string[]) => {
    let dataArr: TwitchUserData[] = [];
    if (arrOfIds.length > 100) {

        const chunkedArray = chunkArray(arrOfIds, 100)
        
        for (const chunk of chunkedArray) {
            try {
                const { data } = await axios.get<TwitchUser>(`https://api.twitch.tv/helix/users?id=${chunk.join('&id=')}`, {
                    headers: {
                        Authorization: `Bearer ${process.env['TwitchAuth']}`,
                        'Client-Id': process.env['TwitchClientId'],
                        "Content-Type": "application/json"
                    }
                });
                dataArr.push(...data.data);
            } catch (error) {
                console.error(error);
            }
        }

        return dataArr;
    }

    else {
        try {
            const { data } = await axios.get<TwitchUser>(`https://api.twitch.tv/helix/users?id=${arrOfIds.join('&id=')}`, {
                headers: {
                    Authorization: `Bearer ${process.env['TwitchAuth']}`,
                    'Client-Id': process.env['TwitchClientId'],
                    "Content-Type": "application/json"
                }
            });
            dataArr.push(...data.data);
        } catch (error) {
            console.error(error);
        }
        return dataArr;
    }
}

export const updateCheaterNames = async () => {
    const cheaters: { [twitchId: string]: string } = JSON.parse(readFileSync('./src/Config/cheaters.json', 'utf-8').toLowerCase());
    const cheaterData = await getTwitchDataFromId(Object.keys(cheaters));
    const updatedCheatersList: { [twitchId: string]: string } = {};
    cheaterData.forEach(user => updatedCheatersList[user.id] = user.display_name);
    writeFileSync('./src/Config/cheaters.json', JSON.stringify(updatedCheatersList, null, 2));
}

const convertToPlayableWOSLevel = (obj: WOSLevel, parentFormat: WOSboard): WOSboard => {

    for (const col of ['column1', 'column2', 'column3'] as const) {
        parentFormat[col] = obj[col].map(slot => {
            return {
                word: slot.word,
                username: "",
                locked: false,
                index: slot.index
            }
        });
    }

    parentFormat.lang = obj.Language;
    parentFormat.timebar.locks.total = 5;
    parentFormat.timebar.locks.expired = 0;

    return parentFormat;
}

export const updateWOSLevels = async (): Promise<Record<string, WOSboard[]>> => {
    const boardFormat: WOSboard = JSON.parse(readFileSync('./src/Config/WOSboard.json', 'utf8'));
    const format: Record<string, WOSboard[]> = {
        set1: [],
        set2: [],
        set3: [],
        set4: [],
        set5: [],
        set6: [],
        set7: [],
    };

    const { data } = await axios.get<{ [DiscordId: string]: WOSLevel[] }>('https://wos-level-editor.d3fau4tbot.repl.co/d3fau4tbot/levels');

    for (const levels of Object.values(data)) {
        for (const level of levels) {
            const board = convertToPlayableWOSLevel(level, boardFormat);
            const wordLength = board.column1[0].word.length;

            if (wordLength >= 4 && wordLength <= 9) format[`set${wordLength - 3}`].push(board);
            else format.set7.push(board);
        }
    }

    return format;
};

export const searchGarticAnswer = (query: string): string[] => {
    const array: string[] = JSON.parse(readFileSync('./src/Config/gos.json', 'utf-8').toLowerCase());
    query = query.replace(/\s/g, "");
    const regex = new RegExp(`^${query.split("").map(c => c === "_" ? "." : c).join("").replace('​​', ' ')}$`, "i");
    return array.filter(item => regex.test(item)).sort();
}