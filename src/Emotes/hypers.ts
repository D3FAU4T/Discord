import { Command } from "../Core/command.js";

export default new Command({
    name: "hypers",
    description: "Sends a hypers emote as a pic/gif",
    emote: true,
    run: ({ message }) => {
        message?.channel.send("https://cdn.discordapp.com/attachments/993276383591665796/993278710922883143/unknown.png");
    }
});