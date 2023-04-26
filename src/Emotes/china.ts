import { Command } from "../Core/command.js";
import { AttachmentBuilder } from 'discord.js';

const file = new AttachmentBuilder("https://cdn.discordapp.com/attachments/933971458496004156/1009323869028487208/unknown.png", {
    name: "China.png",
    description: "A Picture of our SuperBrozz"
});

export default new Command({
    name: "china",
    description: "Sends a china emote as a pic/gif",
    emote: true,
    run: ({ message }) => {
        message?.channel.send({
            content: "CHINA 🇨🇳",
            files: [file]
        })
    }
})