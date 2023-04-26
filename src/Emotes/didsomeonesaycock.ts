import { Command } from "../Core/command.js";

export default new Command({
    name: "didsomeonesaycock",
    description: "Sends a didsomeonesaycock emote as a pic/gif",
    emote: true,
    run: ({ message }) => {
        message?.channel.send("https://cdn.discordapp.com/attachments/993276383591665796/993279120966434916/unknown.png");
    }
})