import { EmbedBuilder, GuildMember, SlashCommandBuilder } from 'discord.js';
import { Command } from '../../Core/command.js';
import { useMainPlayer } from 'discord-player';

export default new Command({
  name: "music_queue",
  description: "Check the music queue list",
  emote: false,
  data: new SlashCommandBuilder()
    .setName('music_queue')
    .setDescription("Check the music queue list"),
  run: async ({ interaction, client }) => {
    if (interaction === undefined) return;
    await interaction.deferReply();

    try {
      const player = useMainPlayer();
      const queue = player.nodes.cache.get(interaction.guildId as string);
      if (!queue) return await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Error: Music module")
            .setDescription("There is no song playing at the moment!")
            .setColor("Red")
        ]
      });

      let currentSong = `${queue.currentTrack?.title} - \`${queue.currentTrack?.duration}\``;
      let trackArray: string[] = [];

      queue.tracks.toArray().forEach((track, index) => trackArray.push(`${index + 1}. ${track.title} - \`${track.duration}\``));

      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Server Queue")
            .setDescription(`**Now playing:**\n${currentSong}\n\n**Queue list:**\n${trackArray.join('\n')}`)
            .setColor("LuminousVividPink")
            .setTimestamp()
            .setFooter({ text: "Embed auto created by d3fau4tbot" })
            .setAuthor({ name: `${(interaction.member as GuildMember).voice.channel?.name}`, iconURL: `https://cdn.discordapp.com/attachments/933971458496004156/1005595741198233790/My_project.png` })
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