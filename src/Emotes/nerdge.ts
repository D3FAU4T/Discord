import { Command } from "../Core/command.js";

export default new Command({
    name: "nerdge",
    description: "Sends a nerdge emote as a pic/gif",
    emote: true,
    run: ({ message }) => {
        message?.channel.send("https://cdn.discordapp.com/attachments/993276383591665796/993279173554610176/unknown.png");
    }
});