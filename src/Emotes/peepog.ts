import { Command } from "../Core/command.js";

export default new Command({
    name: "peepog",
    description: "Sends a peepog emote as a pic/gif",
    emote: true,
    run: ({ message }) => {
        message?.channel.send("https://cdn.discordapp.com/attachments/992564973064699924/992982716242985010/PepoG.png");
    }
});