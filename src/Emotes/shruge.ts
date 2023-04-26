import { Command } from "../Core/command.js";

export default new Command({
    name: "shruge",
    description: "Sends a shruge emote as a pic/gif",
    emote: true,
    run: ({ message }) => {
        message?.channel.send("https://cdn.discordapp.com/emojis/1022750251402141716.webp");
    }
});