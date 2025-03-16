import { readdirSync } from 'fs';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { Command } from '../../Core/command.js';
import { makeErrorEmbed } from '../../Core/functions.js';

export default new Command({
    name: "emotelist",
    description: "Get a list of supported emotes of d3fau4tbot",
    emote: false,
    data: new SlashCommandBuilder()
        .setName('emotelist')
        .setDescription("Get a list of supported emotes of d3fau4tbot"),
    run: async ({ interaction, client }) => {
        await interaction.deferReply();

        try {
            let files = readdirSync(`./src/Emotes`).filter(file => file.endsWith('.ts') || file.endsWith('.js'));
            let emotes: string[] = [];
            files.forEach(emote => emotes.push(emote.slice(0, -3)));
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Here are all the emotes you can type")
                        .setDescription(emotes.join(', '))
                        .setColor("Blue")
                ]
            });
        } catch (error) {
            const err = error as Error;
            await interaction.editReply({
                embeds: [makeErrorEmbed(err)]
            });
        }
    }
});