import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { Command } from '../../Core/command.js';
import { searchGarticAnswer } from '../../Core/functions.js';

export default new Command({
  name: "garticfind",
  description: "Get the gartic answer for a query if exists in gos dictionary",
  emote: false,
  data: new SlashCommandBuilder()
    .setName("garticfind")
    .setDescription("Get the gartic answer for a query if exists in gos dictionary")
    .addStringOption((Option) =>
      Option
        .setName("query")
        .setDescription("Paste the gartic hint here that looks like this: C _ _ _ _ _ _ _ _")
        .setRequired(true)
    ),
    run: async ({ interaction, client }) => {
      if (interaction === undefined) return;
      await interaction.deferReply();
      
      const word = interaction.options.get("query", true).value as string;
      const answers = searchGarticAnswer(word);
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
          .setTitle(`Possible answers for the query: ${word}`)
          .setDescription(answers.join(','))
          .setColor("Blue")
        ]
      })
    }
});