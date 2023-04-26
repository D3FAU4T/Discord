import { Command } from "../Core/command.js";

export default new Command({
    name: "reeee",
    description: "Sends a reeee emote as a pic/gif",
    emote: true,
    run: ({ message }) => {
        message?.channel.send("https://cdn.discordapp.com/attachments/930891384922202183/932042421162901615/shimibReee.png");
    }
});