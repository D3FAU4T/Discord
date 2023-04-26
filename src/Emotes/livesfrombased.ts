import { Command } from "../Core/command.js";

export default new Command({
    name: "livesfrombased",
    description: "Sends a livesfrombased emote as a pic/gif",
    emote: true,
    run: ({ message }) => {
        message?.channel.send("https://tenor.com/view/livesfrombased-gif-26283572");
    }
});