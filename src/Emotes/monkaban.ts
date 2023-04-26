import { Command } from "../Core/command.js";

export default new Command({
    name: "monkaban",
    description: "Sends a monkaban emote as a pic/gif",
    emote: true,
    run: ({ message }) => {
        message?.channel.send("https://cdn.discordapp.com/attachments/993276383591665796/993282344809140304/unknown.png");
    }
});