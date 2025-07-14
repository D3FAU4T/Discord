import path from 'node:path';
import { readFile, access } from 'node:fs/promises';
import { EmbedBuilder, GuildMember, SlashCommandBuilder } from 'discord.js';
import { setTimeout as wait } from 'node:timers/promises';
import { getRandom, ErrorEmbed } from '../core/functions.js';
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
        let paragraphs: string[][] = [];

        const fileExists = await access(phrasePath)
            .then(() => true)
            .catch(() => false);

        if (fileExists) {
            const content = await readFile(phrasePath, 'utf-8');
            paragraphs = JSON.parse(content);
        }

        const phrases = getRandom(paragraphs);

        if (!phrases)
            throw ErrorEmbed("Configuration Error", "No duel phrases found. Please contact the developer.");

        const opponent = interaction.options.getMember("person");

        if (!(opponent instanceof GuildMember))
            throw ErrorEmbed("Invalid User", "The specified user is not a valid guild member.");

        const winner = getRandom([interaction.user.id, opponent.id]);

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