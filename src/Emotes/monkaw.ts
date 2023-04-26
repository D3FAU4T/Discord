import { Command } from "../Core/command.js";

export default new Command({
    name: "monkaw",
    description: "Sends a monkaw emote as a pic/gif",
    emote: true,
    run: ({ message }) => {
        message?.channel.send("https://cdn.discordapp.com/attachments/993276383591665796/993278635509293107/unknown.png");
    }
});