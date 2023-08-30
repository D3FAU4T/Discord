import { Command } from "../Core/command.js";

export default new Command({
    name: "demonio",
    description: "Sends a demonio emote as a pic/gif",
    emote: true,
    run: ({ message }) => {
        message?.channel.send("https://cdn.discordapp.com/attachments/1097538516436660355/1146346495612829726/Dominio.png");
    }
})