import WebSocket from 'ws';
import { EmbedBuilder } from 'discord.js';
import type { twitchDataSuccessResponse, twitchDataFailureResponse } from '../Typings/functions.js';
import { type responses, ResponseType } from '../Typings/Demantle.js';
import type { TwitchUser, TwitchUserData } from '../Typings/TwitchAPI.js';
import type { dictionaryAPI, MerriamWebsterAPI } from '../Typings/definitions.js';
import { remove } from 'remove-accents';
import { load } from 'cheerio';

export const between = (min: number, max: number) => Math.floor(min + (Date.now() % (max - min + 1)));

export const getRandom = <T>(array: T[]): T => {
    if (array.length === 0)
        throw new Error("Array cannot be empty");

    const randomIndex = between(0, array.length - 1);
    return array[randomIndex] as T;
};

export const getCheaters = async (startingIndex = 0, endingIndex = Number.MAX_SAFE_INTEGER): Promise<string[]> => {
    const file = Bun.file("'./src/Config/cheaters.json'");
    if (!await file.exists()) return [];

    const fileContents: Record<string, string> = await file.json();

    return Object.values(fileContents)
        .sort()
        .map((person) => person.includes("_") ? `\`${person}\`` : person)
        .slice(startingIndex, endingIndex);
}



export const enumerateWithIndex = <T>(arr: T[], startingIndex: number = 0): string[] => arr.map((person, i) => `${startingIndex + i + 1}. ${person}`);

export const handleSocketReply = (res: responses, ws: WebSocket, gameType: "Random" | "Today" | "Connect") => {
    if (res.reason === ResponseType.Found)
        ws.send(`{ "Server": [ "D3_found", { "guessArr": ${JSON.stringify(res.guesses)} , "indexes": ${JSON.stringify(res.indexes)} , "gameType": "${gameType}", "word": "${res.word}" } ] }`)

    else if (res.reason === ResponseType.AlreadyExists)
        ws.send(`{ "Server": [ "D3_exist" ] }`)

    else if (res.reason === ResponseType.InvalidWord || res.reason === ResponseType.EditSelfMessageContent)
        ws.send(`{ "Server": [ "D3_invalid" ] }`)

    else
        ws.send(`{ "Server": ["D3_guess", { "guessArr": ${JSON.stringify(res.guesses)} , "indexes": ${JSON.stringify(res.indexes)} , "gameType": "${gameType}" }] }`);
}

export const getTwitchData = async (username: string): Promise<twitchDataSuccessResponse | twitchDataFailureResponse> => {
    const response = await fetch(`https://api.twitchinsights.net/v1/user/status/${username}`);
    return (await response.json()) as twitchDataSuccessResponse | twitchDataFailureResponse;
}

const chunkArray = <T>(array: T[], chunkSize: number) => {
    const chunkedArray: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        const chunk = array.slice(i, i + chunkSize);
        chunkedArray.push(chunk);
    }
    return chunkedArray;
}

export const getTwitchDataFromId = async (arrOfIds: string[]) => {
    let dataArr: TwitchUserData[] = [];

    const headers: Bun.HeadersInit = {
        Authorization: `Bearer ${process.env['TwitchAuth']}`,
        'Client-Id': process.env['TwitchClientId'] ?? '',
        "Content-Type": "application/json"
    };

    const fetchData = async (ids: string[]) => {
        try {
            const response = await fetch(`https://api.twitch.tv/helix/users?id=${ids.join('&id=')}`, { headers });
            if (!response.ok) {
                console.error(`Failed to fetch data: ${response.statusText}`);
                return;
            }
            const data = await response.json() as TwitchUser;
            dataArr.push(...data.data);
        }

        catch (error) {
            console.error(error);
        }
    };

    const chunkedArray = chunkArray(arrOfIds, 100);
    const fetchPromises = chunkedArray.map(fetchData);

    await Promise.all(fetchPromises);

    return dataArr;
}

export const updateCheaterNames = async () => {
    const cheatersFile = Bun.file('./src/Config/cheaters.json');
    if (!await cheatersFile.exists()) return null;

    const fileContents: Record<string, string> = await cheatersFile.json();
    const cheaterIds = Object.keys(fileContents);
    if (cheaterIds.length === 0) return null;

    const cheaterData = await getTwitchDataFromId(cheaterIds);
    if (cheaterData.length === 0) return null;

    const updatedCheatersList = cheaterData.reduce((acc, user) => {
        acc[user.id] = user.display_name;
        return acc;
    }, {} as Record<string, string>);

    await cheatersFile.write(JSON.stringify(updatedCheatersList, null, 2));
    return updatedCheatersList;
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

export const searchGarticAnswer = async (query: string) => {
    const text: string[] = await Bun.file('./src/Config/gos.json').json() ?? [];

    let stripped = query
    .replace(/\"/g, '')
    .replace('​\n:point_right: ', '')
    .replace('\n​', '')
    .replace(/\\/g, '');

    let dynamicPattern = '^' + stripped[0]?.toLowerCase();
    stripped = stripped.slice(1).trim();

    for (const word of stripped.includes('  ') ? stripped.split('  ') : stripped.split(' ​ ​')) {
        let underscores = 0;

        for (let i = 0; i < word.length; i++) {
            if (word[i] === '-') {
                dynamicPattern += `\\w{${underscores}}-`;
                underscores = 0;
            }

            else if (word[i] === '_') underscores++;
        }

        dynamicPattern += `\\w{${underscores}}\\s`
    }

    if (dynamicPattern.endsWith('\\s'))
        dynamicPattern = dynamicPattern.slice(0, -2);

    const regex = new RegExp(dynamicPattern + '$', 'gi');
    const matches = text.filter((word) => word.match(regex));

    return {
        results: matches.sort(),
        regex: dynamicPattern + '$'
    };
}

export const makeErrorEmbed = (err: Error, message?: string) => new EmbedBuilder()
    .setAuthor({ name: message || err.name, iconURL: "https://cdn.discordapp.com/attachments/1097538516436660355/1146354645107748925/Error.png" })
    .setTitle(err.message)
    .setDescription(`\`\`\`ts\n${err.stack}\n\`\`\``)
    .setColor("Red");

export const getWordDefinition = async (word: string, language: "en" | "pt"): Promise<string> => {
    let summary = '';
    try {
        if (language === 'en') {
            const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${remove(word)}`);
            const data = (await response.json()) as dictionaryAPI[];
            if (!data || data.length === 0) throw new Error('No data found');
            const resp = data[0];
            if (!resp || !resp.meanings) throw new Error('Invalid response structure');
            let meaningCount = 1;
            resp.meanings.forEach((meaning: { partOfSpeech: string; definitions: { definition: string; example?: string }[] }) => {
                meaning.definitions.forEach((definition: { definition: string; example?: string }) => {
                    summary += `\n${meaningCount}. (${meaning.partOfSpeech}) ${definition.definition}`;
                    if (definition.example) summary += `\nExample: ${definition.example}`;
                    meaningCount += 1;
                });
            });
        } else if (language === 'pt') {
            const response = await fetch('https://dicionario.priberam.org/' + word);
            const data = await response.text();
            const $ = load(data);
            let results = $('#resultados div,#resultados p,#resultados span').contents();
            const meanings: string[] = [];
            results.each((_, element) => {
                if ($(element).is('p')) {
                    let significado = $(element).text().trim().replace(/\n+/g, '').replace(/\s\s\s/g, '').replace(/\[(\w+,?\s?){1,3}]/, '');
                    meanings.push(significado);
                }
            });
            if (meanings.length > 0) return meanings.join('\n');
            else throw new Error('Definição não encontrada');
        }
    }
    
    catch (err) {
        if (language === 'en') {
            try {
                let definitions: string[] = [];
                const response = await fetch(`https://www.dictionaryapi.com/api/v3/references/sd4/json/${word}?key=${process.env['merriamKey']}`);
                const merriamData = (await response.json()) as MerriamWebsterAPI[];
                if (!merriamData || merriamData.length === 0) throw new Error('No data found in Merriam-Webster API response');
                merriamData[0]?.def.forEach((item, index) => {
                    const definition = item.sseq[0]?.[0]?.[1]?.dt[0]?.[1];
                    definitions.push(`${index + 1}. ${definition}`);
                });
                summary = definitions.join('\n');
            } catch (err) {
                summary = `An unknown error occurred, check console`;
                console.error(err);
            }
        } else summary = 'Desculpe, não encontrei essa palavra no meu dicionário';
    }
    return summary;
};