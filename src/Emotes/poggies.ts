import { Command } from "../Core/command.js";

export default new Command({
    name: "poggies",
    description: "Sends a poggies emote as a pic/gif",
    emote: true,
    run: ({ message }) => {
        message?.channel.send("https://cdn.discordapp.com/attachments/992564973064699924/992982715815174194/POGGIES.png");
    }
});