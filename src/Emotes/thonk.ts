import { Command } from "../Core/command.js";

export default new Command({
    name: "thonk",
    description: "Sends a thonk emote as a pic/gif",
    emote: true,
    run: ({ message }) => {
        message?.channel.send("https://cdn.discordapp.com/attachments/993276383591665796/993281211650822284/unknown.png");
    }
});