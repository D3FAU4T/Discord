import { Command } from "../Core/command.js";

export default new Command({
    name: "kekw",
    description: "Sends a kekw emote as a pic/gif",
    emote: true,
    run: ({ message }) => {
        message?.channel.send("https://cdn.discordapp.com/attachments/993276383591665796/993278927214759956/unknown.png");
    }
});