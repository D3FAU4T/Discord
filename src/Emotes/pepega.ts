import { Command } from "../Core/command.js";

export default new Command({
    name: "pepega",
    description: "Sends a pepega emote as a pic/gif",
    emote: true,
    run: ({ message }) => {
        message?.channel.send("https://cdn.discordapp.com/attachments/993276383591665796/993280702374219867/unknown.png");
    }
});