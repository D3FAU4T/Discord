import { Command } from "../Core/command.js";

export default new Command({
    name: "uhm",
    description: "Sends a uhm emote as a pic/gif",
    emote: true,
    run: ({ message }) => {
        message?.channel.send("https://cdn.discordapp.com/attachments/993276383591665796/993283213675995197/unknown.png");
    }
});