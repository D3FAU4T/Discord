import { Command } from "../Core/command.js";

export default new Command({
    name: "peepohey",
    description: "Sends a peepohey emote as a pic/gif",
    emote: true,
    run: ({ message }) => {
        message?.channel.send("https://cdn.discordapp.com/attachments/993276383591665796/993279398016987227/unknown.png");
    }
});