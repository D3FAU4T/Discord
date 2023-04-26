import { Command } from "../Core/command.js";

export default new Command({
    name: "peeposhy",
    description: "Sends a peeposhy emote as a pic/gif",
    emote: true,
    run: ({ message }) => {
        message?.channel.send("https://cdn.discordapp.com/attachments/993276383591665796/993281640832966746/unknown.png");
    }
});