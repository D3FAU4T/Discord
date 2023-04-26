import { Command } from "../Core/command.js";

export default new Command({
    name: "trustme",
    description: "Sends a trustme emote as a pic/gif",
    emote: true,
    run: ({ message }) => {
        message?.channel.send("https://cdn.discordapp.com/attachments/993276383591665796/1016712025340137603/trustme.png");
    }
});