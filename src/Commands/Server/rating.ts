import axios from 'axios';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { Command } from '../../Core/command.js';
import { chessComRating } from '../../Typings/chessRating.js';

export default new Command({
  name: 'rating',
  description: 'Gives you chess.com ratings of a player using chess.com API',
  emote: false,
  guildId: ["976169594085572679"],
  data: new SlashCommandBuilder()
    .setName("rating")
    .setDescription("Gives you chess.com ratings of a player using chess.com API")
    .addStringOption(Option =>
      Option
        .setName("player_name")
        .setDescription("Enter the username of the player (check typos)")
        .setRequired(true)
    ),
  run: async ({ interaction, client }) => {
    if (interaction === undefined) return;
    await interaction.deferReply();

    try {
      const playerName = interaction.options.getString("player_name", true);
      const { data } = await axios.get<chessComRating>(`https://api.chess.com/pub/player/${playerName}/stats`);

      const getRating = (ratingType: "chess_rapid" | "chess_blitz" | "chess_bullet") => {
        const { last, best } = data[ratingType] || {};
        return (last && best) ? `${last.rating}/${best.rating}` : "Undefined";
      }

      const chessRapid = getRating("chess_rapid");
      const chessBlitz = getRating("chess_blitz");
      const chessBullet = getRating("chess_bullet");

      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Chesscom ratings")
            .setDescription("Chess ratings that are scrapped from chesscom API")
            .setColor("Green")
            .setAuthor({ name: "Chesscom", iconURL: "https://www.chess.com/bundles/web/favicons/apple-touch-icon.f72d3fd3.png" })
            .setURL("https://www.chess.com")
            .setTimestamp()
            .setFooter({ text: "Embed auto created by d3fau4tbot", iconURL: client.guilds.cache.get(interaction.guildId as string)?.iconURL() as string })
            .setThumbnail("https://cdn.discordapp.com/attachments/957277493948219422/1030679308538228766/unknown.png")
            .addFields(
              { name: "Player", value: playerName, inline: true },
              { name: "Rapid rating", value: chessRapid, inline: true },
              { name: "Blitz rating", value: chessBlitz, inline: true },
              { name: "Bullet rating", value: chessBullet, inline: true },
            )
        ]
      });
    } catch (error) {
      if (axios.isAxiosError(error)) await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setAuthor({ name: "Error", iconURL: "https://cdn.discordapp.com/attachments/1097538516436660355/1146354645107748925/Error.png" })
            .setDescription(error.response?.data.message)
            .setColor("Red")
        ]
      })

      else {
        const err = error as Error;
        await interaction.editReply({
          embeds: [client.functions.makeErrorEmbed(err)]
        });
      }
    }
  }
});