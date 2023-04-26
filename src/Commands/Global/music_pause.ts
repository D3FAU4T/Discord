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
    const queue = client.DiscordPlayer.queues.get(interaction.guildId as string);
    if (!queue) return await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("Error: Music module")
          .setDescription(`There is nothing in the queue right now!`)
          .setColor("Red")
      ]
    })
    queue.node.pause();
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("Music: Pause")
          .setDescription(`Paused the currently playing music`)
          .setColor("Green")
      ]
    })
  }
});