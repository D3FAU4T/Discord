import { Command } from "../Core/command.js";

export default new Command({
    name: "gladge",
    description: "Sends a gladge emote as a pic/gif",
    emote: true,
    run: ({ message }) => {
        message?.channel.send("https://cdn.discordapp.com/attachments/993276383591665796/993279032990908527/unknown.png");
    }
});