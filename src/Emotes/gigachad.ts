import { Command } from "../Core/command.js";

export default new Command({
    name: "gigachad",
    description: "Sends a gigachad emote as a pic/gif",
    emote: true,
    run: ({ message }) => {
        message?.channel.send("https://cdn.discordapp.com/attachments/993276383591665796/993284252332470332/GIGACHAD.gif");
    }
});