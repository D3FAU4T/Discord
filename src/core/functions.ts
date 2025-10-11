import { EmbedBuilder } from "discord.js";

export const getRandom = <T>(array: T[]): T | null => array.length > 0 ? array[Math.floor(Math.random() * array.length)]! : null;

/**
 * Creates and throws an error embed for consistent error handling across commands
 * @param title - The error title 
 * @param description - The error description
 * @param name - The error name (default: "Error")
 */
export const ErrorEmbed = (title: string = "Error", description: string): EmbedBuilder =>
    new EmbedBuilder()
        .setAuthor({
            name: title,
            iconURL: "https://cdn.discordapp.com/attachments/1097538516436660355/1146354645107748925/Error.png"
        })
        .setDescription(description)
        .setColor("Red");


export const searchGarticAnswer = async (query: string) => {
    let text: string[] = [];
    // Try Bun first, fallback to NodeJS if not available
    if (typeof Bun !== "undefined" && Bun?.file) {
        text = await Bun.file('./src/Config/gos.json').json() ?? [];
    } else {
        // NodeJS fallback
        const fs = await import('node:fs/promises');
        const path = await import('node:path');
        try {
            const filePath = path.resolve(__dirname, '../Config/gos.json');
            const raw = await fs.readFile(filePath, 'utf-8');
            text = JSON.parse(raw);
        } catch {
            text = [];
        }
    }

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