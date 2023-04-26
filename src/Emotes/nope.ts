import { Command } from "../Core/command.js";

export default new Command({
    name: "nope",
    description: "Sends a nope emote as a pic/gif",
    emote: true,
    run: ({ message }) => {
        message?.channel.send("https://cdn.discordapp.com/attachments/993276383591665796/993282113744936980/unknown.png");
    }
});