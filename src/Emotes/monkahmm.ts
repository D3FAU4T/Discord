import { Command } from "../Core/command.js";

export default new Command({
    name: "monkahmm",
    description: "Sends a monkahmm emote as a pic/gif",
    emote: true,
    run: ({ message }) => {
        message?.channel.send("https://cdn.discordapp.com/attachments/993276383591665796/993278739448348692/unknown.png");
    }
});