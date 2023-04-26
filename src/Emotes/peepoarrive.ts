import { Command } from "../Core/command.js";

export default new Command({
    name: "peepoarrive",
    description: "Sends a peepoarrive emote as a pic/gif",
    emote: true,
    run: ({ message }) => {
        message?.channel.send("https://cdn.discordapp.com/attachments/993276383591665796/993284253196501054/peepoArrive.gif");
    }
});