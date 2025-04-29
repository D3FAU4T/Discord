import { EmbedBuilder, Locale, SlashCommandBuilder } from 'discord.js';
import { Command } from '../../Core/command.js';
import { calculatePoints, makeErrorEmbed } from '../../Core/functions.js';

type FourStrings = [string, string, string, string];

type LocalesMap = {
    "en-US": FourStrings;
} & Partial<Record<Exclude<Locale, "en-US">, FourStrings>>;

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
        .addNumberOption((Option) =>
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
        await interaction.deferReply();

        try {
            const tPoints = interaction.options.get("level", true).value as number;
            const garticosGained = calculatePoints(tPoints);

            const locales: LocalesMap = {
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

            const strings = locales[interaction.locale] ?? locales["en-US"];

            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(strings[0])
                        .setDescription(`:dart: **${strings[1]}:** ${tPoints}\n:moneybag: **${strings[2]}:** ${garticosGained}\n:rocket: **${strings[3]}**`)
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