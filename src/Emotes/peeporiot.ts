import { Command } from "../Core/command.js";

export default new Command({
    name: "peeporiot",
    description: "Sends a peeporiot emote as a pic/gif",
    emote: true,
    run: ({ message }) => {
        message?.channel.send("https://cdn.discordapp.com/attachments/993276383591665796/993278905014304859/unknown.png");
    }
});