import { Command } from "../Core/command.js";

export default new Command({
    name: "dominio",
    description: "Sends a dominio emote as a pic/gif",
    emote: true,
    run: ({ message }) => {
        message?.channel.send("https://cdn.discordapp.com/attachments/993276383591665796/1057402386387325058/output.png");
    }
});