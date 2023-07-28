import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { Command } from '../../Core/command.js';
import { calculateLevels } from '../../Core/functions.js';

type Locale = "en-US" | "en-GB" | "pt-BR";

export default new Command({
    // @ts-ignore
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
        .addStringOption((Option) =>
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
        if (interaction === undefined) return;
        await interaction.deferReply();

        const tPoints = (interaction.options.get("garticos", true).value as string).trim();
        const requiredLevels = calculateLevels(Number(tPoints));

        const locales: Record<Locale, string[]> = {
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
            ]
        };

        const currentLocale = interaction.locale as Locale;

        await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setTitle(locales[currentLocale][0] || locales["en-US"][0])
                    .setDescription(`:dart: ${locales[currentLocale][1] || locales["en-US"][1]}: ${tPoints}\n:100: ${locales[currentLocale][2] || locales["en-US"][2]}: ${requiredLevels}\n:rocket: **${locales[currentLocale][3] || locales["en-US"][3]}**`)
                    .setColor("Blue")
                    .setAuthor({ name: "GarticBOT", url: "https://garticbot.gg", iconURL: "https://media.discordapp.net/attachments/993276383591665796/1050448830455349289/favicon.png" })
                    .setFooter({ text: "Embed auto created by d3fau4tbot", iconURL: client.guilds.cache.get(interaction.guildId as string)?.iconURL() as string })
            ]
        })
    }
});