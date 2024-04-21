import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { Command } from '../../Core/command.js';
import { useMainPlayer } from 'discord-player';

export default new Command({
  name: "music_resume",
  description: "Resume any paused music",
  emote: false,
  data: new SlashCommandBuilder()
    .setName("music_resume")
    .setDescription("Resume any paused music"),
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
            .setDescription(`There is nothing in the queue right now!`)
            .setColor("Red")
        ]
      });

      if (queue.node.isPaused()) {
        queue.node.resume();
        return await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle("Music: Resume")
              .setDescription(`Resumed the song!`)
              .setColor("Blue")
          ]
        })
      }

      else {
        return await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle("Music: Resume")
              .setDescription(`The song is not paused!`)
              .setColor("Red")
          ]
        })
      }
    } catch (error) {
      const err = error as Error;
      await interaction.editReply({
        embeds: [client.functions.makeErrorEmbed(err)]
      });
    }
  }
});