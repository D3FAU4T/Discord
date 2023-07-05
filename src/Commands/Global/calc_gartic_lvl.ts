import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { Command } from '../../Core/command.js';
import { calculateLevels } from '../../Core/functions.js';

export default new Command({
    name: "calc_gartic_lvl",
    description: "Get the amount of levels you need to do in a row to get your points",
    emote: false,
    data: new SlashCommandBuilder()
        .setName("calc_gartic_lvl")
        .setDescription("Get the amount of levels you need to do in a row to get your points")
        .addStringOption((Option) =>
            Option
                .setName("points")
                .setDescription("Type the amount of points you want to get")
                .setRequired(true)
        ),
    run: async ({ interaction, client }) => {
        if (interaction === undefined) return;
        await interaction.deferReply();

        const tPoints = (interaction.options.get("points", true).value as string).trim();
        const requiredLevels = calculateLevels(Number(tPoints));

        await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setTitle(`Gartic Level Calculator`)
                    .setDescription(`Target Points: ${tPoints}\nRequired Levels: ${requiredLevels}\n**Bonus Points counted**`)
                    .setColor("Blue")
            ]
        })
    }
});