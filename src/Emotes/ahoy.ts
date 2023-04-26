import { AttachmentBuilder } from "discord.js";
import { Command } from "../Core/command";

const file = new AttachmentBuilder("https://cdn.discordapp.com/attachments/1053990733880774699/1100033376255225867/AHOY.png", {
  name: "AHOY.png",
  description: "AHOY emote"
});

export default new Command({
  name: "ahoy",
  description: "Sends an AHOY emote",
  emote: true,
  run: ({ message }) => {
    message?.channel.send({
      content: "That's what he said <:Draco:1090608549866000445>",
      files: [ file ]
    })
  }
})