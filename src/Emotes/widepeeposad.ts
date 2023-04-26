import { Command } from "../Core/command.js";

export default new Command({
    name: "widepeeposad",
    description: "Sends a widepeeposad emote as a pic/gif",
    emote: true,
    run: ({ message }) => {
        message?.channel.send("https://cdn.discordapp.com/attachments/993276383591665796/993281921444483112/unknown.png");
    }
});