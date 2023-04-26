import { Command } from "../Core/command.js";

export default new Command({
    name: "uhmdude",
    description: "Sends a uhmdude emote as a pic/gif",
    emote: true,
    run: ({ message }) => {
        message?.channel.send("https://cdn.discordapp.com/attachments/992564973064699924/1009873070242152479/UHMDude.png");
    }
});