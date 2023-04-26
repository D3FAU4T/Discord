import { Command } from "../Core/command.js";

export default new Command({
    name: "monkasteer",
    description: "Sends a monkasteer emote as a pic/gif",
    emote: true,
    run: ({ message }) => {
        message?.channel.send("https://cdn.discordapp.com/attachments/993276383591665796/993284949899751454/monkaSTEER.gif");
    }
});