import { Command } from "../Core/command.js";

export default new Command({
    name: "widepeepohappymoment",
    description: "Sends a widepeepohappymoment emote as a pic/gif",
    emote: true,
    run: ({ message }) => {
        message?.channel.send("https://cdn.discordapp.com/attachments/993276383591665796/993280242812715060/unknown.png");
    }
});