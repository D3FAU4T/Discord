import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { Command } from '../../Core/command.js';

export default new Command({
  name: "music_leave",
  description: "Leave the current connected voice channel",
  emote: false,
  data: new SlashCommandBuilder()
  .setName('music_leave')
  .setDescription("Leave the current connected voice channel"),
  run: async ({ interaction, client }) => {
    if (interaction === undefined) return;
    client.DiscordPlayer.voiceUtils.getConnection(interaction.guildId as string)?.disconnect();
    client.RadioChannels = client.RadioChannels.filter(channel => channel.id === interaction.channel?.id)
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("Music: Leave")
          .setDescription("Left the voice channel")
          .setColor("Blue")
      ]
    })
  }
});