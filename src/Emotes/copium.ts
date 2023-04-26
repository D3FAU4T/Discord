import { Command } from "../Core/command.js";

export default new Command({
    name: "copium",
    description: "Sends a copium emote as a pic/gif",
    emote: true,
    run: ({ message }) => {
        message?.channel.send("https://cdn.discordapp.com/attachments/993276383591665796/993282041678417940/unknown.png");
    }
})