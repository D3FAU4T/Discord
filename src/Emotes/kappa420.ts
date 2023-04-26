import { Command } from "../Core/command.js";

export default new Command({
    name: "kappa420",
    description: "Sends a kappa420 emote as a pic/gif",
    emote: true,
    run: ({ message }) => {
        message?.channel.send("https://cdn.discordapp.com/attachments/993276383591665796/993279203376103634/unknown.png");
    }
});