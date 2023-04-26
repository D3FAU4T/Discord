import { Command } from '../Core/command.js'

export default new Command({
    name: "christmas",
    description: "Sends a christmas emote as a pic/gif",
    emote: true,
    run: ({ message }) => {
        message?.channel.send("https://img.freepik.com/premium-vector/cute-unicorn-snowman-wear-santa-hat-cartoon-kawaii-hand-drawn_70350-638.jpg?w=740");
    }
});