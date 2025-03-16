import { EmbedBuilder } from "discord.js";
import { MusicEvent } from "../Typings/event.js";
import type { MusicMetadata } from "../Typings/music.js";

export default new MusicEvent("error", (queue, error) => {
    const channel = (queue.metadata as MusicMetadata).interaction.channel;
    if (!channel || !channel.isSendable()) return;
    
    channel.send({
        embeds: [
            new EmbedBuilder()
            .setTitle(`General Error: ${error.message}`)
            .setDescription(`${error.stack}`)
            .setColor("Red")
        ]
    })
});