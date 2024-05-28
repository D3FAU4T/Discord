import { Command } from "../Core/command.js";

export default new Command({
    name: "molho_madeira",
    description: "Sends a wood sauce emote as a pic/gif",
    emote: true,
    run: ({ message }) => {
        message?.channel.send("https://cdn.discordapp.com/attachments/1093966046525931601/1183712893473136700/image.png");
    }
});