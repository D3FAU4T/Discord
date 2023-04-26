import { Command } from "../Core/command.js";

export default new Command({
    name: "yep",
    description: "Sends a yep emote as a pic/gif",
    emote: true,
    run: ({ message }) => {
        message?.channel.send("https://cdn.discordapp.com/attachments/993276383591665796/993280422186340352/unknown.png");
    }
});