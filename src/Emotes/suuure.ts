import { Command } from "../Core/command.js";

export default new Command({
    name: "suuure",
    description: "Sends a suuure emote as a pic/gif",
    emote: true,
    run: ({ message }) => {
        message?.channel.send("https://cdn.discordapp.com/attachments/993276383591665796/993279450806501486/unknown.png");
    }
});