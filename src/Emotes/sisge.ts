import { Command } from "../Core/command.js";

export default new Command({
    name: "sisge",
    description: "Sends a sisge emote as a pic/gif",
    emote: true,
    run: ({ message }) => {
        message?.channel.send("https://cdn.discordapp.com/attachments/992564973064699924/1009890118124982272/Sisge.png");
    }
});