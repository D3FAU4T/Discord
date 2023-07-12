import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { Command } from '../../Core/command.js';
import { calculatePoints } from '../../Core/functions.js';

export default new Command({
    name: "calc_gartic_points",
    description: "Get the amount of garticos you will get at X level",
    emote: false,
    data: new SlashCommandBuilder()
        .setName("calc_gartic_lvl")
        .setDescription("Get the amount of garticos you will get at X level")
        .addStringOption((Option) =>
            Option
                .setName("level")
                .setDescription("Type the level number you want to calculate points for")
                .setRequired(true)
        ),
    run: async ({ interaction, client }) => {
        if (interaction === undefined) return;
        await interaction.deferReply();

        const tPoints = (interaction.options.get("level", true).value as string).trim();
        const garticosGained = calculatePoints(Number(tPoints));

        await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setTitle(`Gartic Points Calculator`)
                    .setDescription(`Target Level: ${tPoints}\nGarticos gained: ${garticosGained}\n**Bonuses counted**`)
                    .setColor("Blue")
            ]
        })
    }
});