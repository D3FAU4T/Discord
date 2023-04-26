import { Command } from "../Core/command.js";

export default new Command({
    name: "gg",
    description: "Sends a gg emote as a pic/gif",
    emote: true,
    run: ({ message }) => {
        message?.channel.send("https://cdn.discordapp.com/attachments/992564973064699924/1035425625374208000/frisco7GG.png");
    }
});