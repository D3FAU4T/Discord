import { ChatInputCommandInteraction, EmbedBuilder, type CacheType } from "discord.js";
import { MusicEvent } from "src/core/client";

export default new MusicEvent("error", (queue, error) => {
    const interaction = queue.metadata as ChatInputCommandInteraction<CacheType>;
    const channel = interaction.channel;

    if (!channel || !channel.isSendable()) return;

    channel.send({
        embeds: [
            new EmbedBuilder()
                .setTitle(`Generic Error: ${error.message}`)
                .setDescription(`${error.stack}`)
                .setColor("Red")
        ]
    })
});