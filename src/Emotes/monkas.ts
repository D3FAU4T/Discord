import { Command } from "../Core/command.js";

export default new Command({
    name: "monkas",
    description: "Sends a monkas emote as a pic/gif",
    emote: true,
    run: ({ message }) => {
        message?.channel.send("https://cdn.discordapp.com/attachments/993276383591665796/993282149182607451/unknown.png");
    }
});