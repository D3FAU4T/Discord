import { Command } from "../Core/command.js";

export default new Command({
    name: "yepjam",
    description: "Sends a yepjam emote as a pic/gif",
    emote: true,
    run: ({ message }) => {
        message?.channel.send("https://cdn.discordapp.com/attachments/992564973064699924/1038568791472349204/YEPJAM.gif");
    }
});