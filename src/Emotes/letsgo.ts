import { Command } from "../Core/command.js";

export default new Command({
    name: "letsgo",
    description: "Sends a letsgo emote as a pic/gif",
    emote: true,
    run: ({ message }) => {
        message?.channel.send("https://cdn.discordapp.com/attachments/993276383591665796/993278979488354325/unknown.png");
    }
});