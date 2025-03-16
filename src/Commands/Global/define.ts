import { remove } from 'remove-accents';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { Command } from '../../Core/command.js';
import { makeErrorEmbed } from '../../Core/functions.js';

export default new Command({
  name: "define",
  description: "Get the definition for a word",
  emote: false,
  data: new SlashCommandBuilder()
    .setName("define")
    .setDescription("Get the definition for a word")
    .addStringOption((Option) =>
      Option
        .setName("word")
        .setDescription("Type the word you want definition for")
        .setRequired(true)
    ),
  run: async ({ interaction, client }) => {
    await interaction.deferReply();

    try {
      const word = remove(interaction.options.get("word", true).value as string).trim();
      const definition = await client.getWordDefinition(word, 'en');
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle(`Definition of the word: ${word}`)
            .setDescription(definition)
            .setColor("Random")
            .setURL("https://dictionaryapi.dev/")
            .setAuthor({ name: "dictionaryapi.dev", url: "https://dictionaryapi.dev/", iconURL: "https://cdn.discordapp.com/attachments/993276383591665796/1030844854336499792/favicon.png" })
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