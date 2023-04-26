import { Command } from "../Core/command.js";

export default new Command({
    name: "clap",
    description: "Sends a clap emote as a pic/gif",
    emote: true,
    run: ({ message }) => {
        message?.channel.send("https://cdn.discordapp.com/attachments/993276383591665796/993284949287383090/Clap.gif");
    }
});