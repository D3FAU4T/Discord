import { Command } from "../Core/command.js";

export default new Command({
    name: "peeka",
    description: "Sends a peeka emote as a pic/gif",
    emote: true,
    run: ({ message }) => {
        message?.channel.send("https://cdn.discordapp.com/attachments/993276383591665796/993279292270202890/unknown.png");
    }
});