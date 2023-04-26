import { Command } from "../Core/command.js";

export default new Command({
    name: "angel",
    description: "Sends a angel emote as a pic/gif",
    emote: true,
    run: ({ message }) => {
        message?.channel.send("https://cdn.discordapp.com/attachments/992564973064699924/1074842750400339998/IMG_3976.png");
    }
});