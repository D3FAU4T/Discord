import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { Command } from '../../Core/command.js';

export default new Command({
  name: "music_skip",
  description: "Skip any currently playing music",
  emote: false,
  data: new SlashCommandBuilder()
  .setName('music_skip')
  .setDescription("Skip any currently playing music"),
  run: async ({ interaction, client }) => {
    if (interaction === undefined) return;
    const queue = client.DiscordPlayer.queues.get(interaction.guildId as string);
    if (!queue) return await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("Error: Music module")
          .setDescription("There is nothing in the queue right now!")
          .setColor("Red")
      ]
    })

    try {
      queue.node.skip();
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Music: Skip")
            .setDescription(`Skipped! Now playing:\n${queue.currentTrack}`)
            .setColor("Blue")
        ]
      })
    } catch (e) {
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Error: Music module")
            .setDescription(`${e}`)
            .setColor("Red")
        ]
      })
    }
  }
});