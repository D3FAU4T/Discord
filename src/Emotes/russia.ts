import { Command } from "../Core/command.js";
import { AttachmentBuilder } from "discord.js";

const file = new AttachmentBuilder('https://cdn.discordapp.com/attachments/933971458496004156/1009323869028487208/unknown.png', { name: 'Russia.png', description: 'A Picture of our SuperBrozz' });

export default new Command({
    name: "russia",
    description: "A Picture of the RUSSIA meme",
    emote: true,
    run: ({ message }) => {
        message?.channel.send({
            content: "RUSSIA 🇷🇺",
            files: [file]
        });
    }
});