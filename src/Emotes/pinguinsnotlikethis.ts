import { Command } from "../Core/command.js";

export default new Command({
    name: "pinguinsnotlikethis",
    description: "Sends a pinguinsnotlikethis emote as a pic/gif",
    emote: true,
    run: ({ message }) => {
        message?.channel.send("https://cdn.discordapp.com/attachments/976169594815393803/1055847069425872957/image.png");
    }
});