import { Command } from "../Core/command.js";
import { AttachmentBuilder } from 'discord.js';

const file = new AttachmentBuilder("https://cdn.discordapp.com/attachments/992564973064699924/1105494452719587358/image.png", {
    name: "MURICA.png",
    description: "A Picture of our Demon"
});

export default new Command({
    name: "murica",
    description: "Sends a murica emote as a pic/gif",
    emote: true,
    run: ({ message }) => {
        message?.channel.send({
            content: "MURICA :flag_us:",
            files: [file]
        })
    }
})