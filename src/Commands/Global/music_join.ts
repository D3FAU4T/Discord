import { Constants, EmbedBuilder, GuildMember, SlashCommandBuilder, VoiceBasedChannel } from 'discord.js';
import { Command } from '../../Core/command.js';

export default new Command({
  name: 'music_join',
  description: 'Join your current voice channel',
  emote: false,
  data: new SlashCommandBuilder()
    .setName("music_join")
    .setDescription("Join your current voice channel")
    .addStringOption((Option) =>
      Option
        .setName("snowflake_id")
        .setDescription("Enter the snowflake id of the voice channel")
    ),
  run: async ({ interaction, client }) => {
    if (interaction === undefined) return;
    let voiceChannel = (interaction.member as GuildMember).voice.channel;

    if (interaction.options.data.length > 0) {
      const snowflake = interaction.options.get("snowflake_id")?.value as string;

      try {
        voiceChannel = client.channels.fetch(snowflake) as unknown as VoiceBasedChannel;
      } catch (err) {
        return await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle("Error: Music module")
              .setDescription("An error ocurred")
              .setColor("Red")
          ]
        })
      }

      if (!Constants.VoiceBasedChannelTypes.includes(voiceChannel.type)) return await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Error: Music module")
            .setDescription(`${snowflake} is not a valid voice channel snowflake id!`)
            .setColor("Red")
        ]
      });
    }

    if (!voiceChannel) return await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("Error: Music module")
          .setDescription("You must be in a voice channel or enter a voice channel snowflake id!")
          .setColor("Red")
      ]
    });

    client.DiscordPlayer.voiceUtils.join(voiceChannel);
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("Music: Join Voice Channel")
          .setDescription(`Connected to the voice channel.`)
          .setColor("Blue")
      ]
    })
  },
});