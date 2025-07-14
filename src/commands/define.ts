import {
    AttachmentBuilder, EmbedBuilder,
    SlashCommandBuilder
} from 'discord.js';
import { ErrorEmbed } from '../core/functions.js';
import type { Command } from '../typings/core.js';
import type { dictionaryAPI } from '../typings/definitions.js';

export default <Command>{
    data: new SlashCommandBuilder()
        .setName("define")
        .setDescription("Get the definition for a word")
        .addStringOption((Option) =>
            Option
                .setName("word")
                .setDescription("Type the word you want definition for")
                .setRequired(true)
        ),
    async execute(interaction) {
        await interaction.deferReply();

        const query = interaction.options.getString("word", true).trim();

        const response = await fetch("https://api.dictionaryapi.dev/api/v2/entries/en/" + query);
        if (!response.ok)
            throw ErrorEmbed("Dictionary API Error", `The server declined our request with reason: \`${response.statusText}\``);

        const data = await response.json() as dictionaryAPI[];

        if (!data[0] || !data[0].meanings[0] || !data[0].meanings[0].definitions[0])
            throw ErrorEmbed("Dictionary API Error", `Definition not found for the word: "${query}"`);

        const phoneticsText = data[0]!.phonetics.find(p => p.text)?.text ?? `No phonetics available`;
        const phoneticsAudio = data[0]!.phonetics.find(p => p.audio)?.audio;

        const word = data[0]!.word ?? query;

        let text = `# ${word.charAt(0).toUpperCase() + word.slice(1)}\n`;
        text += `${phoneticsText}\n\n\n`;

        for (const meaning of data[0]!.meanings) {
            text += `**${meaning.partOfSpeech}**\n`;
            text += meaning.definitions.map((def, index, arr) => {
                let temp = ``;

                if (arr.length > 1) {
                    temp += `### ${index + 1}. ${def.definition}\n`;
                    temp += def.example ? `-# "${def.example}"` : ``;
                }

                else temp += `### ${def.definition}\n${def.example ? `-# "${def.example}"` : ``}`;

                return temp;
            }).join('\n');

            text += `\n\n`;
        }

        let attachment: AttachmentBuilder | null = null;

        if (phoneticsAudio) {
            const response = await fetch(phoneticsAudio);
            attachment = new AttachmentBuilder(
                Buffer.from(await response.arrayBuffer()),
                { name: `${word}.mp3` }
            );
        }

        await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setDescription(text)
                    .setColor("Green")
            ],
            files: attachment ? [attachment] : []
        });
    },
}