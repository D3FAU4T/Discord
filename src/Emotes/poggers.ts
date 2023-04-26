import { Command } from "../Core/command.js";

export default new Command({
    name: "poggers",
    description: "Sends a poggers emote as a pic/gif",
    emote: true,
    run: ({ message }) => {
        message?.channel.send("https://cdn.discordapp.com/attachments/993276383591665796/993281005727256706/unknown.png");
    }
});