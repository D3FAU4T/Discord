import type { CacheType, ChatInputCommandInteraction } from "discord.js";
import { MusicEvent } from "src/core/client";

export default new MusicEvent("playerStart", (queue, track) => {
    const interaction = queue.metadata as ChatInputCommandInteraction<CacheType>;
    const channel = interaction.channel;

    if (channel && channel.isSendable())
        channel.send(`🎶 Now playing: **${track.title}** (requested by <@${track.requestedBy?.id}>)`);
});