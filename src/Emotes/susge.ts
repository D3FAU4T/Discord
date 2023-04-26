import { Command } from "../Core/command.js";

export default new Command({
    name: "susge",
    description: "Sends a susge emote as a pic/gif",
    emote: true,
    run: ({ message }) => {
        message?.channel.send("https://cdn.discordapp.com/attachments/992564973064699924/992982716054257674/Susge.png");
    }
});