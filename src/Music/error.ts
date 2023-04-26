import { EmbedBuilder } from "discord.js";
import { MusicEvent } from "../Typings/event.js";
import { MusicMetadata } from "../Typings/music.js";

export default new MusicEvent("error", (queue, error) => {
    (queue.metadata as MusicMetadata).interaction.channel?.send({
        embeds: [
            new EmbedBuilder()
            .setTitle(`General Error: ${error.message}`)
            .setDescription(`${error.stack}`)
            .setColor("Red")
        ]
    })
});