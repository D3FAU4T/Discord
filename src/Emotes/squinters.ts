import { Command } from "../Core/command.js";

export default new Command({
    name: "squinters",
    description: "Sends a squinters emote as a pic/gif",
    emote: true,
    run: ({ message }) => {
        message?.channel.send("https://cdn.discordapp.com/attachments/993276383591665796/993283000001364008/unknown.png");
    }
});