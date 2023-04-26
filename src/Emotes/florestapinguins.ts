import { Command } from "../Core/command.js";

export default new Command({
    name: "florestapinguins",
    description: "Sends a florestapinguins emote as a pic/gif",
    emote: true,
    run: ({ message }) => {
        message?.channel.send("https://cdn.discordapp.com/attachments/920832476606234664/1038457009927880744/Penguins.gif");
    }
});