import { Command } from "../Core/command.js";

export default new Command({
    name: "diesofcringe",
    description: "Sends a diesofcringe emote as a pic/gif",
    emote: true,
    run: ({ message }) => {
        message?.channel.send("https://tenor.com/view/diesofcringe-gif-24606059");
    }
})