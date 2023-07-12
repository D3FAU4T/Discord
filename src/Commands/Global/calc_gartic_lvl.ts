import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { Command } from '../../Core/command.js';
import { calculateLevels } from '../../Core/functions.js';

export default new Command({
    name: "calc_gartic_lvl",
    description: "Get the amount of points you need to do in a row to get your garticos",
    emote: false,
    data: new SlashCommandBuilder()
        .setName("calc_gartic_lvl")
        .setDescription("Get the amount of points you need to do in a row to get your garticos")
        .addStringOption((Option) =>
            Option
                .setName("garticos")
                .setDescription("Type the amount of garticos you want to get")
                .setRequired(true)
        ),
    run: async ({ interaction, client }) => {
        if (interaction === undefined) return;
        await interaction.deferReply();

        const tPoints = (interaction.options.get("garticos", true).value as string).trim();
        const requiredLevels = calculateLevels(Number(tPoints));

        await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setTitle(`Gartic Level Calculator`)
                    .setDescription(`Target Garticos: ${tPoints}\nRequired Points: ${requiredLevels}\n**Bonuses counted**`)
                    .setColor("Blue")
            ]
        })
    }
});