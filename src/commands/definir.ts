import * as cheerio from 'cheerio';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { Command } from '../typings/core.js';

export default <Command> {
    data: new SlashCommandBuilder()
        .setName("definir")
        .setDescription("Obter a definição de uma palavra")
        .addStringOption((Option) =>
            Option
                .setName("palavra")
                .setDescription("Digite a palavra para a qual deseja definição")
                .setRequired(true)
        ),
    async execute(interaction) {
        await interaction.deferReply();
        const palavra = interaction.options.getString("palavra", true).trim();
        const response = await fetch('https://dicionario.priberam.org/' + palavra);

        if (!response.ok)
            throw new Error("Erro ao acessar o dicionário: " + response.statusText);

        const data = await response.text();
        const $ = cheerio.load(data);

        const significado = $('#resultados div,#resultados p,#resultados span')
            .contents()
            .toArray()
            .filter(elem => $(elem).is('p'))
            .map(elem =>
                $(elem)
                    .text()
                    .trim()
                    .replace(/\n+/g, '')
                    .replace(/\s\s\s/g, '')
                    .replace(/\[(\w+,?\s?){1,3}]/, '')
            );

        await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setTitle(`Definição da palavra: ${palavra}`)
                    .setDescription(significado.join('\n') || "Nenhuma definição encontrada.")
                    .setColor("Random")
            ]
        });

    }
}
