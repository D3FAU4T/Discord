import { Command } from "../Core/command.js";

export default new Command({
    name: "madge",
    description: "Sends a madge emote as a pic/gif",
    emote: true,
    run: ({ message }) => {
        message?.channel.send("https://cdn.discordapp.com/attachments/992562774649610372/992982249098199090/Madge.png");
    }
});