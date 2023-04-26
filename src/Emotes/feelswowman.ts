import { Command } from "../Core/command.js";

export default new Command({
    name: "feelswowman",
    description: "Sends a feelswowman emote as a pic/gif",
    emote: true,
    run: ({ message }) => {
        message?.channel.send("https://cdn.discordapp.com/attachments/993276383591665796/993280196641816666/unknown.png");
    }
});