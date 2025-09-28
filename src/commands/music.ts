import { useMainPlayer } from "discord-player";
import { EmbedBuilder, Guild, GuildMember, SlashCommandBuilder } from "discord.js";
import type { Command } from "../typings/core";

export default <Command>{
    data: new SlashCommandBuilder()
        .setName("music")
        .setDescription("Perform music related actions")
        .addSubcommand(subCommand =>
            subCommand
                .setName("query")
                .setDescription("Request a song name to play. For better results, use links.")
                .addStringOption(option =>
                    option
                        .setName("song")
                        .setDescription("The name or link of the song to play")
                        .setRequired(true)
                )
        )
        .addSubcommand(subCommand =>
            subCommand
                .setName("queue")
                .setDescription("View the current music queue")
        )
        .addSubcommand(subCommand =>
            subCommand
                .setName("pause")
                .setDescription("Pause the currently playing song")
        )
        .addSubcommand(subCommand =>
            subCommand
                .setName("resume")
                .setDescription("Resume any paused music")
        )
        .addSubcommand(subCommand =>
            subCommand
                .setName("skip")
                .setDescription("Skip the currently playing music")
        ),

    execute: async (interaction) => {
        await interaction.deferReply();

        if (!(interaction.guild instanceof Guild) || !(interaction.member instanceof GuildMember))
            return await interaction.editReply(`You must be in a server.`);

        const channel = interaction.member.voice.channel;

        if (!channel)
            return await interaction.editReply(`You must be in a voice channel.`);

        // Check bot permissions
        const permissions = channel.permissionsFor(interaction.client.user);

        if (!permissions)
            return await interaction.editReply(`I don't have permission to join the Voice channel.`);

        if (!permissions.has("Connect"))
            return await interaction.editReply(`I don't have the "Connect" permission to join the Voice channel.`);

        if (!permissions.has("Speak"))
            return await interaction.editReply(`I don't have the "Speak" permission to join the Voice channel.`);

        const player = useMainPlayer();
        const subCommand = interaction.options.getSubcommand(true) as "query" | "queue" | "pause" | "resume" | "skip";

        if (subCommand === "query") {
            const query = interaction.options.getString("song", true);

            const { track } = await player.play(channel, query, {
                searchEngine: "SPOTIFY_SONG",
                requestedBy: interaction.user,
                nodeOptions: {
                    leaveOnEnd: false,
                    leaveOnStop: false,
                    metadata: interaction,
                }
            });

            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(track.title)
                        .setDescription(track.description)
                        .setAuthor({ name: track.author })
                        .setURL(track.url)
                        .setThumbnail(track.thumbnail ?? null)
                ]
            });
        }

        else if (subCommand === "queue") {
            const queue = player.nodes.cache.get(interaction.guild.id);

            if (!queue || !queue.isPlaying() || !queue.currentTrack)
                return await interaction.editReply(`There is no music playing.`);

            const currentTrack = queue.currentTrack;

            const tracks = queue.tracks.toArray()
                .map((track, index) =>
                    `**${index + 1}.** [${track.title}](${track.url}) - <@${track.requestedBy?.id}>`
                )
                .join("\n");

            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Music Queue")
                        .setDescription(tracks || "No more songs in the queue.")
                        .addFields(
                            { name: "Now Playing", value: `[${currentTrack.title}](${currentTrack.url}) - <@${currentTrack.requestedBy?.id}>` }
                        )
                ]
            });
        }

        else if (subCommand === "pause") {
            const queue = player.nodes.cache.get(interaction.guild.id);

            if (!queue || !queue.isPlaying())
                return await interaction.editReply(`There is nothing playing right now!`);

            if (queue.node.isPaused())
                return await interaction.editReply(`The music is already paused!`);

            queue.node.pause();

            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Music: Pause")
                        .setDescription("Paused the currently playing music")
                        .setColor("Green")
                ]
            });
        }

        else if (subCommand === "resume") {
            const queue = player.nodes.cache.get(interaction.guild.id);

            if (!queue || !queue.isPlaying())
                return await interaction.editReply(`There is nothing playing right now!`);

            if (!queue.node.isPaused())
                return await interaction.editReply(`The music is not paused!`);

            queue.node.resume();

            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Music: Resume")
                        .setDescription("Resumed the song!")
                        .setColor("Blue")
                ]
            });
        }

        else if (subCommand === "skip") {
            const queue = player.nodes.cache.get(interaction.guild.id);

            if (!queue || !queue.isPlaying())
                return await interaction.editReply(`There is nothing playing right now!`);

            const currentTrack = queue.currentTrack;
            queue.node.skip();

            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Music: Skip")
                        .setDescription(`Skipped: **${currentTrack?.title}**${queue.currentTrack ? `\nNow playing: **${queue.currentTrack.title}**` : ''}`)
                        .setColor("Blue")
                ]
            });
        }
    },
}