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
    await interaction.deferReply();

    try {
      const queue = client.DiscordPlayer.queues.get(interaction.guildId as string);
      if (!queue) return await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Error: Music module")
            .setDescription("There is nothing in the queue right now!")
            .setColor("Red")
        ]
      });

      queue.node.skip();
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Music: Skip")
            .setDescription(`Skipped! Now playing:\n${queue.currentTrack}`)
            .setColor("Blue")
        ]
      });
    } catch (error) {
      const err = error as Error;
      await interaction.editReply({
        embeds: [client.functions.makeErrorEmbed(err)]
      });
    }
  }
});