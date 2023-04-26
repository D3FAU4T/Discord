import { Command } from "../Core/command.js";

export default new Command({
    name: "prayge",
    description: "Sends a prayge emote as a pic/gif",
    emote: true,
    run: ({ message }) => {
        message?.channel.send("https://cdn.discordapp.com/attachments/993276383591665796/993278764270227517/unknown.png");
    }
});