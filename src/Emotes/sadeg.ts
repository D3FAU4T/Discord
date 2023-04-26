import { Command } from "../Core/command.js";

export default new Command({
    name: "sadeg",
    description: "Sends a sadeg emote as a pic/gif",
    emote: true,
    run: ({ message }) => {
        message?.channel.send("https://cdn.discordapp.com/attachments/992564973064699924/1009873069642371133/Sadeg.png");
    }
});