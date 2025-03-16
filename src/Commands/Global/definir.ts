import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { Command } from '../../Core/command.js';
import { makeErrorEmbed } from '../../Core/functions.js';

export default new Command({
  name: "definir",
  description: "Obter a definição de uma palavra",
  emote: false,
  data: new SlashCommandBuilder()
    .setName("definir")
    .setDescription("Obter a definição de uma palavra")
    .addStringOption((Option) =>
      Option
        .setName("palavra")
        .setDescription("Digite a palavra para a qual deseja definição")
        .setRequired(true)
    ),
  run: async ({ interaction, client }) => {
    if (interaction === undefined) return;
    await interaction.deferReply();

    try {
      const palavra = interaction.options.get("palavra", true).value as string;
      const significado = await client.getWordDefinition(palavra, 'pt');
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle(`Definição da palavra: ${palavra}`)
            .setDescription(significado)
            .setColor("Random")
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