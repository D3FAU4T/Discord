import { Command } from "../Core/command.js";

export default new Command({
    name: "pepehands",
    description: "Sends a pepehands emote as a pic/gif",
    emote: true,
    run: ({ message }) => {
        message?.channel.send("https://cdn.discordapp.com/attachments/993276383591665796/993278948781871215/unknown.png");
    }
});