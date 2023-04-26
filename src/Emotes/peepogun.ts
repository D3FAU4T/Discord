import { Command } from "../Core/command.js";

export default new Command({
    name: "peepogun",
    description: "Sends a peepogun emote as a pic/gif",
    emote: true,
    run: ({ message }) => {
        message?.channel.send("https://cdn.discordapp.com/attachments/993276383591665796/993278581054656572/unknown.png");
    }
});