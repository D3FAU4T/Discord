import { EmbedBuilder, GuildMember, SlashCommandBuilder } from "discord.js";
import { Command } from "../../Core/command";
import { useMainPlayer } from "discord-player";

export default new Command({
    name: "music_radio",
    description: "Play simulator radio station",
    emote: false,
    data: new SlashCommandBuilder()
        .setName("music_radio")
        .setDescription("Play simulator radio station"),
    run: async ({ interaction, client }) => {
        if (interaction === undefined) return;
        await interaction.deferReply();

        try {
            const player = useMainPlayer();
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

            const { track } = await player.play(voiceChannel, process.env["ms"] as string, {
                nodeOptions: {
                    metadata: {
                        interaction: interaction,
                        isRadio: true,
                        client: client
                    },
                    leaveOnEnd: false,
                    leaveOnStop: false,
                    leaveOnEmpty: false
                },
                requestedBy: interaction.user
            });

            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Radio module")
                        .setDescription(`24/7 Radio mode turned on`)
                        .setColor("Green")
                ]
            });
        } catch (error) {
            const err = error as Error;
            await interaction.editReply({
                embeds: [client.functions.makeErrorEmbed(err)]
            });
        }
    }
})