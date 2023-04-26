import { Command } from "../Core/command.js";

export default new Command({
    name: "okayge",
    description: "Sends a okayge emote as a pic/gif",
    emote: true,
    run: ({ message }) => {
        message?.channel.send("https://cdn.discordapp.com/attachments/993276383591665796/993278811623927908/unknown.png");
    }
});