import path from 'node:path';
import { EmbedBuilder, GuildMember, SlashCommandBuilder } from 'discord.js';
import { setTimeout as wait } from 'node:timers/promises';
import { getRandom } from '../core/functions.js';
import { readJsonFile, fileExists } from '../core/runtime.js';
import type { Command } from '../typings/core.js';

export default <Command>{
    data: new SlashCommandBuilder()
        .setName("duel")
        .setDescription("Duel with a person in discord")
        .addUserOption(option =>
            option
                .setName("person")
                .setDescription("The person you want to duel with")
                .setRequired(true)
        ),
    async execute(interaction) {
        await interaction.deferReply();

        const phrasePath = path.resolve('src', 'config', 'duelPhrases.json');
        const paragraphs: string[][] = await fileExists(phrasePath) ? await readJsonFile(phrasePath) : [];

        const phrases = getRandom(paragraphs);

        if (!phrases)
            throw new Error("No phrases found for the duel.");

        const opponent = interaction.options.getMember("person");

        if (!(opponent instanceof GuildMember))
            throw new Error("The specified user is not a valid guild member.");

        const winner = getRandom([interaction.user.id, opponent.id])!;

        for (let i = 0; i < phrases.length; i++) {
            const desc = phrases[i]!;
            const formattedDesc = desc
                .replace(/@attacker/g, `<@${interaction.user.id}>`)
                .replace(/@defender/g, `<@${opponent.id}>`)
                .replace(/@winner/g, `<@${winner}>`);

            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setAuthor({ name: "Duel", iconURL: "https://cdn.discordapp.com/attachments/1097538516436660355/1146369722896621629/Angry.png" })
                        .setDescription(formattedDesc)
                        .setColor("Default")
                ]
            });

            if (i < phrases.length - 1)
                await wait(3000);
        }
    },
}