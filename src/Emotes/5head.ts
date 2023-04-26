import { Command } from "../Core/command.js";

export default new Command({
    name: "5head",
    description: "Sends a 5head emote as a pic/gif",
    emote: true,
    run: ({ message }) => {
        message?.channel.send("https://cdn.discordapp.com/attachments/993276383591665796/993278676818984980/unknown.png");
    }
})