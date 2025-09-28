import { ChatInputCommandInteraction, EmbedBuilder, type CacheType } from "discord.js";
import { MusicEvent } from "src/core/client";

export default new MusicEvent("playerError", (queue, error) => {
    const interaction = queue.metadata as ChatInputCommandInteraction<CacheType>;
    const channel = interaction.channel;

    if (!channel || !channel.isSendable()) return;

    channel.send({
        embeds: [
            new EmbedBuilder()
                .setTitle(`Player Error: ${error.message}`)
                .setDescription(`${error.stack}`)
                .setColor("Red")
        ]
    })
});