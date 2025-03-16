import { SlashCommandBuilder } from "discord.js";
import { Command } from "../../Core/command";

export default new Command({
    name: "stopots_score_generator",
    description: "Generate the scoreboard for the Stopots game",
    emote: false,
    guildId: ["1021508735165808641", "1053990732958023720"],
    data: new SlashCommandBuilder()
        .setName("stopots_score_generator")
        .setDescription("Generate the scoreboard for the Stopots game")
        .addStringOption(Option =>
            Option
                .setName("scoreboard")
                .setDescription("***(ADD SELF) Format -> PlayerName:TheirScore,Player2Name:Player2Score, ...")
                .setRequired(true)
        )
        .addStringOption(Option =>
            Option
                .setName("owner")
                .setDescription("Owner of the lobby (case sensitive)")
                .setRequired(false)
        )
        .addIntegerOption(Option =>
            Option
                .setName("max_round")
                .setDescription("Max round number")
                .setMinValue(4)
                .setMaxValue(18)
                .setRequired(false)
        )
        .addIntegerOption(Option =>
            Option
                .setName("current_round")
                .setDescription("Current round number")
                .setMinValue(1)
                .setMaxValue(18)
                .setRequired(false)
        )
        .addIntegerOption(Option =>
            Option
                .setName("max_players")
                .setDescription("Max number of players allowed in the lobby")
                .setMinValue(4)
                .setMaxValue(50)
                .setRequired(false)
        )
        .addIntegerOption(Option =>
            Option
                .setName("time_left")
                .setDescription("Timebar value in percentage (0-100)")
                .setMinValue(0)
                .setMaxValue(100)
                .setRequired(false)
        ),
    run: ({ interaction }) => {
        const owner = interaction.options.get("owner", false)?.value;
        const max_round = interaction.options.get("max_round", false)?.value;
        const current_round = interaction.options.get("current_round", false)?.value;
        const max_players = interaction.options.get("max_players", false)?.value;
        const time_left = interaction.options.get("time_left", false)?.value;
        const scoreboard = (interaction.options.get("scoreboard", true).value as string)
        .replace(/\,\s+/g, ",");

        const pfp = interaction.user.displayAvatarURL({ extension: "png", size: 4096 });
        const self = interaction.user.displayName;

        const URL = `https://discord-d3fau4tbot.replit.app/stopots?self=${self}&owner=${owner || self}&players=${scoreboard}&currentround=${current_round || 3}&maxrounds=${max_round || 4}&maxplayers=${max_players || 16}&timeleft=${time_left || 60}&pfp=${pfp}`;
        return interaction.reply({ content: URL });
    }
});