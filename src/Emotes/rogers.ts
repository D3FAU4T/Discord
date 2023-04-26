import { Command } from "../Core/command.js";
import { AttachmentBuilder } from 'discord.js';

const file = new AttachmentBuilder('https://cdn.discordapp.com/attachments/993564460084109402/1024353669782720702/unknown.png', { name: 'ROGERS.png', description: 'A Picture of the rogers meme' });

export default new Command({
    name: "rogers",
    description: "A picture of the ROGERS meme",
    emote: true,
    run: ({ message }) => {
        message?.channel.send({
            content: "ROGERS",
            files: [file]
        });
    }
});