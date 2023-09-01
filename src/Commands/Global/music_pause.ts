import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { Command } from '../../Core/command.js';

export default new Command({
  name: "music_pause",
  description: "Pause the currently playing song",
  emote: false,
  data: new SlashCommandBuilder()
    .setName("music_pause")
    .setDescription("Pause the currently playing song"),
  run: async ({ interaction, client }) => {
    if (interaction === undefined) return;
    await interaction.deferReply();

    try {
      const queue = client.DiscordPlayer.queues.get(interaction.guildId as string);
      if (!queue) return await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Error: Music module")
            .setDescription(`There is nothing in the queue right now!`)
            .setColor("Red")
        ]
      })
      queue.node.pause();
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Music: Pause")
            .setDescription(`Paused the currently playing music`)
            .setColor("Green")
        ]
      })
    } catch (error) {
      const err = error as Error;
      await interaction.editReply({
        embeds: [client.functions.makeErrorEmbed(err)]
      })
    }
  }
});