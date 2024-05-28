import axios, { AxiosError, AxiosResponse } from 'axios';
import WebSocket from 'ws';
import { codeBlock, EmbedBuilder, GuildMember } from 'discord.js';
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
            return codeBlock('json', response);
        case 'text':
            return codeBlock('text', response);
        case 'html':
            return codeBlock('html', response);
        case 'js':
            return codeBlock('js', response);
        case 'python':
            return codeBlock('python', response);
        case 'diff':
            return codeBlock('diff', response);
        default:
            return 'Invalid_response_parser';
    }
}

export const axiosHandler = async (url: string, method: axiosMethods, headers?: object, data?: any): Promise<AxiosResponse<any, any> | AxiosError<any, any> | Error> => {
    try {
        return await axios({
            method: method,
            url: url,
            headers: headers,
            data: data
        });
    } catch (error) {
        if (axios.isAxiosError(error)) return error;
        else return error as Error;
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

    const headers = {
        Authorization: `Bearer ${process.env['TwitchAuth']}`,
        'Client-Id': process.env['TwitchClientId'],
        "Content-Type": "application/json"
    };

    const fetchData = async (ids: string[]) => {
        try {
            const { data } = await axios.get<TwitchUser>(`https://api.twitch.tv/helix/users?id=${ids.join('&id=')}`, { headers });
            dataArr.push(...data.data);
        } catch (error) {
            console.error(error);
        }
    };

    const chunkedArray = chunkArray(arrOfIds, 100);
    const fetchPromises = chunkedArray.map(fetchData);

    await Promise.all(fetchPromises);

    return dataArr;
}

export const updateCheaterNames = async () => {
    const cheaters: Record<string, string> = JSON.parse(readFileSync('./src/Config/cheaters.json', 'utf-8').toLowerCase());
    const cheaterData = await getTwitchDataFromId(Object.keys(cheaters));
    const updatedCheatersList: { [twitchId: string]: string } = {};
    cheaterData.forEach(user => updatedCheatersList[user.id] = user.display_name);
    if (Object.keys(updatedCheatersList).length === 0) return null;
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

export const calculateLevels = (targetPoints: number): number => {
    let levels = 0;
    let points = 0;
    let bonusPoints = 0;
    while ((points + bonusPoints) < targetPoints) {
        levels++;
        points++;
        if (levels % 15 == 0)
            bonusPoints += Math.floor(levels / 15) * 5;
    }
    return levels;
}

export const calculatePoints = (targetLevel: number): number => {
    let levels = 0;
    let points = 0;
    let bonusPoints = 0;
    while (levels < targetLevel) {
        levels++;
        points++;
        if (levels % 15 == 0)
            bonusPoints += Math.floor(levels / 15) * 5;
    }
    return points + bonusPoints;
}

export const searchGarticAnswer = (query: string) => {
    const text = readFileSync('./src/Config/gos.json', 'utf-8').toLowerCase();

    let strippedText: string | string[] = query
        .replace("​\n:point_right: ", '');

    if (strippedText.endsWith(" ")) strippedText = strippedText.slice(0, -1);
    if (!strippedText.endsWith(" \n​")) strippedText += " \n​";

    let regex = `"`;

    const handleSpecialQueries = (splitter: string) => {
        if (typeof strippedText === 'string') strippedText = strippedText.split(splitter);

        for (let k = 0; k < strippedText.length; k++) {
            let wordArr = strippedText[k].split(' ');
            if (wordArr.includes('_') && k !== strippedText.length - 1) wordArr.push('');
            for (let i = 0, letterCount = -1; i < wordArr.length; i++) {
                if (i === 0) {
                    if (wordArr[i] !== `\\_` && wordArr[i] !== '_') regex += wordArr[i].toLowerCase() + `\\w{`;
                    else regex += `\\w{`, letterCount++;
                }
                if (wordArr[i] === `` || wordArr[i] === '\n​') {
                    regex += `${letterCount}}`;
                    break;
                }
                letterCount++;
            }
            if (k !== strippedText.length - 1) regex += splitter !== '-' ? `\\s` : '-';
        }
        regex += `"`;
    }

    if (strippedText.includes('​ ​')) handleSpecialQueries('​ ​');
    else if (strippedText.includes('-')) handleSpecialQueries('-');
    else if (strippedText.includes('  ')) handleSpecialQueries('  ');
    else handleSpecialQueries('%');

    let matches = text.match(new RegExp(regex, 'g'));
    let sortedArr: string[] | null = null;
    if (matches) sortedArr = matches.map(match => match.replace(/"/g, '')).sort();
    if (
        sortedArr === null &&
        !strippedText.includes('_') &&
        !strippedText.includes('\\_')
    ) regex = `wtf`;

    return {
        results: sortedArr,
        regex: regex
    }
}

export const makeErrorEmbed = (err: Error, message?: string) => new EmbedBuilder()
    .setAuthor({ name: message || err.name, iconURL: "https://cdn.discordapp.com/attachments/1097538516436660355/1146354645107748925/Error.png" })
    .setTitle(err.message)
    .setDescription(`\`\`\`ts\n${err.stack}\n\`\`\``)
    .setColor("Red");