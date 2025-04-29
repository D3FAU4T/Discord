import { EmbedBuilder, Locale, SlashCommandBuilder } from 'discord.js';
import { Command } from '../../Core/command.js';
import { calculateLevels, makeErrorEmbed } from '../../Core/functions.js';

type FourStrings = [string, string, string, string];

type LocalesMap = {
    "en-US": FourStrings;
} & Partial<Record<Exclude<Locale, "en-US">, FourStrings>>;

export default new Command({
    name: "calc_gartic_levels",
    description: "Get the amount of points you need to do in a row to get your desired amount of garticos",
    emote: false,
    data: new SlashCommandBuilder()
        .setName("calc_gartic_levels")
        .setDescription("Get the amount of points you need to do in a row to get your desired amount of garticos")
        .setDescriptionLocalizations({
            "en-US": "Get the amount of points you need to do in a row to get your desired amount of garticos",
            "en-GB": "Get the amount of points you need to do in a row to get your desired amount of garticos",
            "pt-BR": "Obtenha à quantidade de pontos que você precisa fazer para ganhar os garticos na mesma partida"
        })
        .addNumberOption((Option) =>
            Option
                .setName("garticos")
                .setDescription("Type the amount of garticos you desire")
                .setDescriptionLocalizations({
                    "en-US": "Type the amount of garticos you desire",
                    "en-GB": "Type the amount of garticos you desire",
                    "pt-BR": "Digite a quantidade de garticos que deseja"
                })
                .setRequired(true)
        ),
    run: async ({ interaction, client }) => {
        await interaction.deferReply();

        try {
            const tPoints = interaction.options.get("garticos", true).value as number;
            const requiredLevels = calculateLevels(tPoints);

            const locales: LocalesMap = {
                "en-US": [
                    "Garticos Calculator",
                    "Target Garticos",
                    "Required Points",
                    "Bonuses counted"
                ],
                "en-GB": [
                    "Garticos Calculator",
                    "Target Garticos",
                    "Required Points",
                    "Bonuses counted"
                ],
                "pt-BR": [
                    "Calculadora de Garticos",
                    "Garticos que você deseja atingir",
                    "Pontos necessários de atingir",
                    "Todos os bônus são contados"
                ],
            };
            
            const strings = locales[interaction.locale] ?? locales["en-US"];

            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(strings[0])
                        .setDescription(`:dart: ${strings[1]}: ${tPoints}\n:100: ${strings[2]}: ${requiredLevels}\n:rocket: **${strings[3]}**`)
                        .setColor("Blue")
                        .setAuthor({ name: "GarticBOT", url: "https://garticbot.gg", iconURL: "https://media.discordapp.net/attachments/993276383591665796/1050448830455349289/favicon.png" })
                        .setFooter({ text: "Embed auto created by d3fau4tbot", iconURL: interaction.guild?.iconURL() || undefined })
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