import { EmbedBuilder, GuildMember, SlashCommandBuilder } from 'discord.js';
import { Command } from '../../Core/command.js';

export default new Command({
  name: "music_sr",
  description: "Request a song that will be played in the voice channel",
  emote: false,
  data: new SlashCommandBuilder()
    .setName("music_sr")
    .setDescription("Request a song that will be played in the voice channel")
    .addStringOption((Option) =>
      Option
        .setName("query")
        .setDescription("Type the song name or paste any YouTube URL")
        .setRequired(true)
    ),
  run: async ({ interaction, client }) => {
    if (interaction === undefined) return;
    await interaction.deferReply();

    try {
      const voiceChannel = (interaction.member as GuildMember).voice.channel;
      if (!voiceChannel) return await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Error: Music module")
            .setDescription("You must be in a voice channel!")
            .setColor("Red")
        ]
      });

      const permissions = voiceChannel.permissionsFor(interaction.client.user);

      if (!permissions?.has("Connect")) return await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Error: Music module")
            .setDescription(`I don't have the "Connect" permission to join the Voice channel`)
            .setColor("Red")
        ]
      });

      if (!permissions.has("Speak")) return await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Error: Music module")
            .setDescription(`I don't have the "Speak" permission to join the Voice channel`)
            .setColor("Red")
        ]
      });

      const { track } = await client.DiscordPlayer.play(voiceChannel, interaction.options.getString("query", true), {
        nodeOptions: {
          metadata: {
            interaction: interaction,
            isRadio: false,
            client: client
          },
          leaveOnEnd: false,
          leaveOnStop: false,
        },
        requestedBy: interaction.user
      });

      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription("Requested song added to the queue")
            .setColor("Random")
            .setAuthor({ name: `Song added`, iconURL: `https://cdn.discordapp.com/attachments/933971458496004156/1005595741198233790/My_project.png` })
            .setFooter({ text: "Embed auto created by d3fau4tbot" })
            .setTimestamp()
            .setURL(track.url)
            .setThumbnail(`https://cdn.discordapp.com/attachments/933971458496004156/1005590805756530718/Checkmark-green-tick-isolated-on-transparent-background-PNG.png`)
            .addFields(
              { name: "Song Name", value: `${track.title}`, inline: false },
              { name: "Duration", value: `${track.duration}`, inline: true },
              { name: "Requested by", value: `${track.requestedBy?.username}`, inline: true },
            )
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