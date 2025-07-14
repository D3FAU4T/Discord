import * as cheerio from 'cheerio';
import { AttachmentBuilder, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { ErrorEmbed } from '../core/functions.js';
import type { Command } from '../typings/core.js';

export default <Command>{
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
            throw ErrorEmbed("Erro de Dicionário", `O dicionário respondeu com: "${response.statusText}". Parece que ele decidiu tirar folga hoje 😅`);

        const data = await response.text();
        const $ = cheerio.load(data);

        const primaryImageLink = $('img[loading="lazy"]').first().attr('src');

        if (!primaryImageLink)
            throw ErrorEmbed("Erro de Dicionário", `Ih, não rolou! O servidor disse que essa palavra aí não tá no dicionário não. 😅`);

        const imageResp = await fetch(primaryImageLink);

        if (!imageResp.ok)
            throw ErrorEmbed("Erro de Dicionário", `A imagem não pôde ser carregada: "${imageResp.statusText}"`);

        await interaction.editReply({
            files: [
                new AttachmentBuilder(
                    Buffer.from(await imageResp.arrayBuffer()),
                    { name: palavra + ".png", description: "Definição de " + palavra }
                ),
            ]
        });

    }
}
