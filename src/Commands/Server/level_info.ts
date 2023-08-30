import axios from 'axios';
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { Command } from "../../Core/command";
import { WOSCorrectResponse, WOSErrorResponse, WOSLevel } from '../../Typings/WOS';

export default new Command({
    name: "level_info",
    description: "Get information about a level in custom WOS",
    emote: false,
    guildId: ["976169594085572679", "1053990732958023720"],
    data: new SlashCommandBuilder()
        .setName('level_info')
        .setDescription("Get information about a level in custom WOS")
        .addStringOption((option) =>
            option
                .setName("level_name")
                .setDescription("Type the level name that you want information on")
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName('level_author')
                .setDescription('Type the level author that you want to search on')
                .setRequired(false)
                .setChoices(
                    { name: 'Arch_a_tri', value: '509826164190216233' },
                    { name: 'D3FAU4T', value: '867522091490607134' },
                    { name: 'Draconis256_', value: '195261052236070912' },
                    { name: 'Euvolemic', value: '577777025369112576' },
                    { name: 'ffulirrah', value: '730182734705721354' },
                    { name: 'ForestPenguins_', value: '868320974184001586' },
                    { name: 'NEO_The8th', value: '444734227112787968' },
                )
        ),
    run: async ({ interaction, client }) => {
        if (interaction === undefined) return;

        try {
            if (interaction.options.getString('level_author') === null) {

                const query = interaction.options.getString('level_name', true);
                const { data } = await axios.get<WOSCorrectResponse | WOSErrorResponse>(`https://wos-level-editor.d3fau4tbot.repl.co/levelinfo/${query.toLowerCase()}`);

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

            else {

                const query = interaction.options.getString('level_name', true);
                const user = interaction.options.getString('level_author', false);
                const { data } = await axios.get<WOSLevel[]>(`https://wos-level-editor.d3fau4tbot.repl.co/d3fau4tbot/getlevels/${user}`);

                let levelFound = false;
                data.forEach(level => {
                    if (level.Level.toLowerCase() === query.toLowerCase()) {
                        levelFound = true;
                        return interaction.reply({
                            embeds: [
                                new EmbedBuilder()
                                    .setTitle(`WOS Level search: ${query}`)
                                    .setDescription(`Level name: ${level.Level}\nCreated by: <@${user}>\nTotal words: ${level.column1.length + level.column2.length + level.column3.length}`)
                                    .setColor('Purple')
                            ]
                        })
                    }
                });

                if (!levelFound) return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle(`WOS Level search: ${query}`)
                            .setDescription('Error: Level not found')
                            .setColor('Red')
                    ]
                })

            }
        } catch (error) {
            const err = error as Error;
            await interaction.reply({
                embeds: [client.functions.makeErrorEmbed(err)]
            });
        }
    }
})