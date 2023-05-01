import { Command } from "../Core/command";

export default new Command({
  name: "rehab",
  description: "Sends a rehab emote",
  emote: true,
  run: ({ message }) => {
    message?.channel.send("https://cdn.discordapp.com/attachments/976169594815393806/1090214492706705489/unknown.png")
  }
})