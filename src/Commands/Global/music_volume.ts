import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { Command } from '../../Core/command.js';
import { useMainPlayer } from 'discord-player';

export default new Command({
  name: "music_volume",
  description: "Set the volume of the music",
  emote: false,
  data: new SlashCommandBuilder()
    .setName("music_volume")
    .setDescription("Set the volume of the music")
    .addIntegerOption((Option) =>
      Option
        .setName("vol")
        .setDescription("Set the percentage of volume between 0 to 100")
        .setRequired(true)
        .setMaxValue(100)
        .setMinValue(0)
    ),
  run: async ({ interaction, client }) => {
    if (interaction === undefined) return;
    await interaction.deferReply();

    try {
      const player = useMainPlayer();
      const queue = player.queues.get(interaction.guildId as string);
      if (!queue) return await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Error: Music module")
            .setDescription("There is nothing in the queue right now!")
            .setColor("Red")
        ]
      });

      const volume = interaction.options.getInteger("vol", true);

      if (volume > 100) return await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Warning!")
            .setDescription(`For safety reasons, usage of over-volume is disabled. Please enter a number between 0 to 100`)
            .setColor("Red")
        ]
      });

      else if (isNaN(volume)) return await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Error: Music module")
            .setDescription("Please enter a valid number!")
            .setColor("Red")
        ]
      });

      queue.node.setVolume(volume);
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Music: Volume")
            .setDescription(`Volume set to \`${volume}\``)
            .setColor("Blue")
        ]
      });
    } catch (error) {
      const err = error as Error;
      await interaction.editReply({
        embeds: [client.functions.makeErrorEmbed(err)]
      });
    }
  },
});