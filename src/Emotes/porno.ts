import { Command } from "../Core/command.js";

export default new Command({
    name: "porno",
    description: "Sends a porno emote as a pic/gif",
    emote: true,
    run: ({ message }) => {
        message?.channel.send("https://cdn.discordapp.com/attachments/920832476606234664/1123557483848409128/image.png");
    }
});