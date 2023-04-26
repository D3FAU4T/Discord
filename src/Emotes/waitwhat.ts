import { Command } from "../Core/command.js";

export default new Command({
    name: "waitwhat",
    description: "Sends a waitwhat emote as a pic/gif",
    emote: true,
    run: ({ message }) => {
        message?.channel.send("https://cdn.discordapp.com/attachments/993276383591665796/993282313783869521/unknown.png");
    }
});