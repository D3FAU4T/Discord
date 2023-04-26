import { Command } from "../Core/command.js";

export default new Command({
    name: "myaa",
    description: "Sends a myaa emote as a pic/gif",
    emote: true,
    run: ({ message }) => {
        message?.channel.send("https://cdn.discordapp.com/attachments/992564973064699924/1035416772838441020/MYAA.gif");
    }
});