import { EmbedBuilder, Locale, SlashCommandBuilder } from 'discord.js';
import type { Command } from '../typings/core';

type FourStrings = [string, string, string, string];

type LocalesMap = {
    "en-US": FourStrings;
} & Partial<Record<Exclude<Locale, "en-US">, FourStrings>>;

const calculatePoints = (level: number): number => {
    const M = Math.floor(level / 15);
    return level + (5 * M * (M + 1)) / 2;
}

const calculateLevels = (targetPoints: number): number => {
    let levels = 0;
    let points = 0;
    let bonusPoints = 0;
    while ((points + bonusPoints) < targetPoints) {
        levels++;
        points++;
        if (levels % 15 == 0)
            bonusPoints += Math.floor(levels / 15) * 5;
    }
    return levels;
}

export default <Command> {
    data: new SlashCommandBuilder()
        .setName('gartic')
        .setDescription('Perform gartic-related operations')
        .setDescriptionLocalization("pt-BR", "Realizar operações relacionadas a gartic")
        .addSubcommand(subCommand =>
            subCommand
                .setName('calculate_level')
                .setDescription('Get the amount of points you need to do in a row to get your desired amount of garticos')
                .setDescriptionLocalization("pt-BR", "Obtenha à quantidade de pontos que você precisa fazer para ganhar os garticos na mesma partida")
                .addNumberOption(option =>
                    option
                        .setName('garticos')
                        .setDescription('Type the amount of garticos you desire')
                        .setDescriptionLocalization("pt-BR", "Digite a quantidade de garticos que deseja")
                        .setRequired(true)
                )
        )
        .addSubcommand(subCommand =>
            subCommand
                .setName('calculate_points')
                .setDescription('Get the amount of garticos you will gain at X level')
                .setDescriptionLocalization("pt-BR", "Saiba a quantidade de garticos que você ganhará em um determinado nível")
                .addNumberOption(option =>
                    option
                        .setName('level')
                        .setNameLocalization("pt-BR", "nível")
                        .setDescription('Type the level number you want to calculate garticos for')
                        .setDescriptionLocalization("pt-BR", "Digite o número do nível que você deseja calcular quantos garticos irá obter")
                        .setRequired(true)
                )
        ),

    async execute(interaction) {
        await interaction.deferReply();
        const subCommand = interaction.options.getSubcommand() as 'calculate_level' | 'calculate_points';

        if (subCommand === 'calculate_level') {
            const locales: LocalesMap = {
                "en-US": [
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

            const targetGarticos = interaction.options.getNumber('garticos', true);
            const requiredLevels = calculateLevels(targetGarticos);
            const strings = locales[interaction.locale] ?? locales["en-US"];

            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(strings[0])
                        .setDescription(`:dart: ${strings[1]}: ${targetGarticos}\n:100: ${strings[2]}: ${requiredLevels}\n:rocket: **${strings[3]}**`)
                        .setColor("Blue")
                        .setAuthor({ name: "GarticBOT", url: "https://garticbot.gg", iconURL: "https://media.discordapp.net/attachments/993276383591665796/1050448830455349289/favicon.png" })
                        .setFooter({ text: "Embed auto created by d3fau4tbot", iconURL: interaction.guild?.iconURL() || undefined })
                ]
            });
        }

        else {
            const locales: LocalesMap = {
                "en-US": [
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

            const targetPoints = interaction.options.getNumber("level", true);
            const garticosGained = calculatePoints(targetPoints);

            const strings = locales[interaction.locale] ?? locales["en-US"];

            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(strings[0])
                        .setDescription(`:dart: **${strings[1]}:** ${targetPoints}\n:moneybag: **${strings[2]}:** ${garticosGained}\n:rocket: **${strings[3]}**`)
                        .setColor("Blue")
                        .setAuthor({ name: "GarticBOT", url: "https://garticbot.gg", iconURL: "https://media.discordapp.net/attachments/993276383591665796/1050448830455349289/favicon.png" })
                        .setFooter({ text: "Embed auto created by d3fau4tbot", iconURL: interaction.guild?.iconURL() || undefined })
                ]
            });
        }
    }
}