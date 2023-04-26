import { Command } from "../Core/command.js";

export default new Command({
    name: "sadge",
    description: "Sends a sadge emote as a pic/gif",
    emote: true,
    run: ({ message }) => {
        message?.channel.send("https://cdn.discordapp.com/attachments/993276383591665796/993278844113010780/unknown.png");
    }
});