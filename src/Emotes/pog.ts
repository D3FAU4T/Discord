import { Command } from "../Core/command.js";

export default new Command({
    name: "pog",
    description: "Sends a pog emote as a pic/gif",
    emote: true,
    run: ({ message }) => {
        message?.channel.send("https://cdn.discordapp.com/attachments/993276383591665796/993280579917320273/unknown.png");
    }
});