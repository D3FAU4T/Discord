import { readFileSync, writeFileSync } from 'fs';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { Command } from '../../Core/command.js';

export default new Command({
  name: 'cheaters_remove',
  description: "Remove a person from the database",
  emote: false,
  guildId: ["976169594085572679"],
  data: new SlashCommandBuilder()
    .setName("cheaters_remove")
    .setDescription("Remove a person from the database")
    .addStringOption(Option =>
      Option
        .setName("person_name")
        .setDescription("Enter the name of the person to remove from the database")
        .setRequired(true)
    ),
  run: async ({ interaction, client }) => {
    if (interaction === undefined) return;
    const person = (interaction.options.get('person_name', true).value as string).toLowerCase();
    const notFound = new EmbedBuilder()
      .setTitle("Entry not found")
      .setDescription(`Username ${person} not found in the cheaters list. Please check the spelling or the existence of the user ☠️`)
      .setColor("Red");

    let cheaters = JSON.parse(readFileSync('./src/Config/cheaters.json', 'utf-8')) as string[];
    if (!cheaters.includes(person)) return await interaction.reply({ embeds: [notFound] });
    cheaters = cheaters.filter(username => username !== person);
    writeFileSync('./src/Config/cheaters.json', JSON.stringify(cheaters.sort(), null, 2));
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("Person removed")
          .setDescription(`Successfully removed the person from the cheaters list`)
          .setColor("Random")
          .setTimestamp()
          .setFooter({ text: "Embed auto created by d3fau4tbot", iconURL: client.guilds.cache.get(interaction.guildId as string)?.iconURL() as string })
          .setAuthor({ name: "Words on Stream", iconURL: "https://cdn.discordapp.com/attachments/992562774649610372/993274540966809621/1f09655df10d184b07c9e5930063497a.jpg" })
          .setThumbnail(`https://cdn.discordapp.com/attachments/933971458496004156/1005590805756530718/Checkmark-green-tick-isolated-on-transparent-background-PNG.png`)
          .addFields(
            { name: "Person removed", value: person, inline: true },
            { name: "List count", value: cheaters.length.toString(), inline: true }
          )
      ]
    })
  }
});