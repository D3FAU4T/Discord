import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { Command } from '../../Core/command.js';
import { calculatePoints } from '../../Core/functions.js';

type Locale = "en-US" | "en-GB" | "pt-BR";

export default new Command({
    name: "calc_garticos_gained",
    description: "Get the amount of garticos you will gain at X level",
    emote: false,
    data: new SlashCommandBuilder()
        .setName("calc_garticos_gained")
        .setDescription("Get the amount of garticos you will gain at X level")
        .setDescriptionLocalizations({
          "en-US": "Get the amount of garticos you will gain at X level",
          "en-GB": "Get the amount of garticos you will gain at X level",
          "pt-BR": "Saiba a quantidade de garticos que você ganhará em um determinado nível"
        })
        .addStringOption((Option) =>
            Option
                .setName("level")
                .setNameLocalizations({
                  "en-US": "level",
                  "en-GB": "level",
                  "pt-BR": "nível"
                })
                .setDescription("Type the level number you want to calculate garticos for")
                .setDescriptionLocalizations({
                  "en-US": "Type the level number you want to calculate garticos for",
                  "en-GB": "Type the level number you want to calculate garticos for",
                  "pt-BR": "Digite o número do nível que você deseja calcular quantos garticos irá obter"
                })
                .setRequired(true)
        ),
    run: async ({ interaction, client }) => {
        if (interaction === undefined) return;
        await interaction.deferReply();

        const tPoints = (interaction.options.get("level", true).value as string).trim();
        const garticosGained = calculatePoints(Number(tPoints));

        const locales: Record<Locale, string[]> = {
          "en-US": [
            "Garticos Calculator",
            "Target Level",
            "Garticos gained",
            "Bonuses counted"
          ],
          "en-GB": [
            "Garticos Calculator",
            "Target Level",
            "Garticos gained",
            "Bonuses counted"
          ],
          "pt-BR": [
            "Calculadora de Garticos",
            "Nível que você deseja atingir",
            "Garticos ganhos",
            "Todos os bônus são contados"
          ]
        };

        const currentLocale = interaction.locale as Locale;

        await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setTitle(locales[currentLocale][0] || locales["en-US"][0])
                    .setDescription(`:dart: **${locales[currentLocale][1] || locales["en-US"][1]}:** ${tPoints}\n:moneybag: **${locales[currentLocale][2] || locales["en-US"][2]}:** ${garticosGained}\n:rocket: **${locales[currentLocale][3] || locales["en-US"][3]}**`)
                    .setColor("Blue")
                    .setAuthor({ name: "GarticBOT", url: "https://garticbot.gg", iconURL: "https://media.discordapp.net/attachments/993276383591665796/1050448830455349289/favicon.png" })
                    .setFooter({ text: "Embed auto created by d3fau4tbot", iconURL: client.guilds.cache.get(interaction.guildId as string)?.iconURL() as string })
            ]
        })
    }
});