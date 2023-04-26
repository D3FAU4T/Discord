import { Command } from "../Core/command.js";

export default new Command({
    name: "drpinguins",
    description: "Sends a drpinguins emote as a pic/gif",
    emote: true,
    run: ({ message }) => {
        message?.channel.send("https://cdn.discordapp.com/attachments/976169594815393803/1055152609486454794/doctor_penguin_with_stethoscope__Photo.png");
    }
});