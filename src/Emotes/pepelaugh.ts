import { Command } from "../Core/command.js";

export default new Command({
    name: "pepelaugh",
    description: "Sends a pepelaugh emote as a pic/gif",
    emote: true,
    run: ({ message }) => {
        message?.channel.send("https://cdn.discordapp.com/attachments/993276383591665796/993281873948184666/unknown.png");
    }
});