import axios from 'axios';
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { Command } from "../../Core/command";
import { WOSCorrectResponse, WOSErrorResponse } from '../../Typings/WOS';

export default new Command({
    name: "level_info",
    description: "Get information about a level in custom WOS",
    emote: false,
    data: new SlashCommandBuilder()
    .setName('level_info')
    .setDescription("Get information about a level in custom WOS")
    .addStringOption((option) =>
        option
        .setName("level_name")
        .setDescription("Type the level name that you want information on")
        .setRequired(true)
    ),
    run: async ({ interaction, client }) => {
        if (interaction === undefined) return;

        const query = interaction.options.get('level_name', true).value as string;
        const { data }: { data: WOSCorrectResponse | WOSErrorResponse } = await axios.get(`https://wos-level-editor.d3fau4tbot.repl.co/levelinfo/${query.toLowerCase()}`);

        if ('error' in data) {
            if (data.error === 'Level not found') return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle(`WOS Level search: ${query}`)
                    .setDescription('Error: Level not found')
                    .setColor('Red')
                ]
            })

            else return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle(`WOS Level search: ${query}`)
                    .setDescription('Error: An unexpected server error occurred')
                    .setColor('Red')
                ]
            });
        }

        else if ('level' in data) return interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setTitle(`WOS Level search: ${query}`)
                .setDescription(`Level name: ${data.level}\nCreated by: <@${data.id}>\nTotal words: ${data.totalWords}`)
                .setColor('Purple')
            ]
        });
    }
})