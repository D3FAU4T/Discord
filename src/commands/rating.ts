import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { Command } from '../typings/core';
import type { chessComRating } from '../typings/chessRating';

export default <Command> {
	data: new SlashCommandBuilder()
		.setName("rating")
		.setDescription("Gives you chess.com ratings of a player using chess.com API")
		.addStringOption(Option =>
			Option
				.setName("player_name")
				.setDescription("Enter the username of the player (check typos)")
				.setRequired(true)
		),
	async execute(interaction) {
		await interaction.deferReply();

		const playerName = interaction.options.getString("player_name", true);
		const response = await fetch(`https://api.chess.com/pub/player/${playerName}/stats`);
		const data = await response.json() as chessComRating;

		const getRating = (ratingType: "chess_rapid" | "chess_blitz" | "chess_bullet") => {
			const { last, best } = data[ratingType] ?? {};
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
					.setFooter({ text: "Embed auto created by d3fau4tbot", iconURL: interaction.guild?.iconURL() ?? undefined })
					.setThumbnail("https://cdn.discordapp.com/attachments/957277493948219422/1030679308538228766/unknown.png")
					.addFields(
						{ name: "Player", value: playerName, inline: true },
						{ name: "Rapid rating", value: chessRapid, inline: true },
						{ name: "Blitz rating", value: chessBlitz, inline: true },
						{ name: "Bullet rating", value: chessBullet, inline: true },
					)
			]
		});
	}
}