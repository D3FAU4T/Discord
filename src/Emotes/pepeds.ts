import { Command } from "../Core/command.js";

export default new Command({
    name: "pepeds",
    description: "Sends a pepeds emote as a pic/gif",
    emote: true,
    run: ({ message }) => {
        message?.channel.send("https://cdn.discordapp.com/attachments/992564973064699924/1040443983177994280/pepeDS.gif");
    }
});