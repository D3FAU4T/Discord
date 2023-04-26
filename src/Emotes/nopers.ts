import { Command } from "../Core/command.js";

export default new Command({
    name: "nopers",
    description: "Sends a nopers emote as a pic/gif",
    emote: true,
    run: ({ message }) => {
        message?.channel.send("https://cdn.discordapp.com/attachments/993276383591665796/993284251812372621/NOPERS.gif");
    }
});