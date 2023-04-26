import { Command } from "../Core/command.js";

export default new Command({
    name: "peepoleave",
    description: "Sends a peepoleave emote as a pic/gif",
    emote: true,
    run: ({ message }) => {
        message?.channel.send("https://cdn.discordapp.com/attachments/993276383591665796/993284252995170414/peepoLeave.gif");
    }
});