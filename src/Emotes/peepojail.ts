import { Command } from "../Core/command.js";

export default new Command({
    name: "peepojail",
    description: "Sends a peepojail emote as a pic/gif",
    emote: true,
    run: ({ message }) => {
        message?.channel.send("https://cdn.discordapp.com/attachments/993276383591665796/993279422381707324/unknown.png");
    }
});