import { Command } from "../Core/command.js";

export default new Command({
    name: "pinguins",
    description: "Sends a pinguins emote as a pic/gif",
    emote: true,
    run: ({ message }) => {
        message?.channel.send("https://media.discordapp.net/attachments/992564973064699924/1035426687959179264/penguins.gif");
    }
});