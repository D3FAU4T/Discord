import { Command } from "../Core/command.js";

export default new Command({
    name: "demônio",
    description: "Sends a demônio emote as a pic/gif",
    emote: true,
    run: ({ message }) => {
        message?.channel.send("https://media.discordapp.net/attachments/1014498244270768138/1044545923965014088/Demonio.jpg");
    }
})