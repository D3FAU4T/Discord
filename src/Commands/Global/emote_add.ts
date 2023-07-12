import { writeFileSync } from 'fs';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { Command } from '../../Core/command.js';
import { commandsInterface } from '../../Typings/commands.js';

const emoteTemplate = 
`import { Command } from "../Core/command.js";

export default new Command({
    name: "EmoteNameHere",
    description: "EmoteDescHere",
    emote: true,
    run: ({ message }) => {
        message?.channel.send("EmoteLinkHere");
    }
});`

export default new Command({
  name: "emote_add",
  description: "Add an emote to d3fau4tbot's Emote database",
  emote: false,
  data: new SlashCommandBuilder()
  .setName("emote_add")
  .setDescription("Add an emote to d3fau4tbot's Emote database")
  .addStringOption((Option) =>
    Option
      .setName("emote_name")
      .setDescription("Give a name to the emote you're adding")
      .setRequired(true)
  )
  .addStringOption((Option) =>
    Option
      .setName("emote_url")
      .setDescription("Paste an URL to the emote (Must be in a picture format)")
      .setRequired(true)
  ),
  run: async ({ interaction, client }) => {
    const emoteName = (interaction?.options.get("emote_name", true).value as string).toLowerCase();
    const emoteLink = interaction?.options.get("emote_url", true).value as string;
    let emoteFileBody = emoteTemplate.replace('EmoteNameHere', emoteName)
    .replace('EmoteDescHere', `Sends a ${emoteName} emote as a pic/gif`)
    .replace('EmoteLinkHere', emoteLink);
    writeFileSync(`./src/Emotes/${emoteName}.ts`, emoteFileBody);
    writeFileSync(`./.build/src/Emotes/${emoteName}.js`, emoteFileBody.replace('?', ''));
    setTimeout(async () => {
      const emote = await client.importFile(`./.build/src/Emotes/${emoteName}.js`) as commandsInterface;
      client.emotes.set(emoteName, emote)
    }, 5000);
    await interaction?.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("Emote Added")
          .setDescription(`Successfully added the emote ${emoteName}`)
          .setColor("Gold")
          .setThumbnail(`https://cdn.discordapp.com/attachments/933971458496004156/1005590805756530718/Checkmark-green-tick-isolated-on-transparent-background-PNG.png`)
          .setImage(emoteLink)
          .setFooter({ text: "Embed auto created by d3fau4tbot", iconURL: client.guilds.cache.get(interaction.guildId as string)?.iconURL() as string })
          .setTimestamp()
      ]
    })
  }
});