import { Command } from "../Core/command.js";

export default new Command({
    name: "ez",
    description: "Sends a ez emote as a pic/gif",
    emote: true,
    run: ({ message }) => {
        message?.channel.send("https://cdn.discordapp.com/attachments/993276383591665796/993279368493289492/unknown.png");
    }
});