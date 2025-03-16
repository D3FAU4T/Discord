import { EmbedBuilder } from "discord.js";
import { MusicEvent } from "../Typings/event.js";
import type { MusicMetadata } from "../Typings/music.js";

export default new MusicEvent("emptyChannel", queue => {
    let metadata = queue.metadata as MusicMetadata;
    if (metadata.isRadio) return;
    queue.connection?.disconnect();

    const channel = metadata.interaction.channel;
    if (!channel || !channel.isSendable()) return;

    channel.send({
        embeds: [
            new EmbedBuilder()
            .setTitle(`Leaving the channel`)
            .setDescription(`'Voice channel is empty for couple of mins!`)
            .setColor("Blue")
        ]
    })
});