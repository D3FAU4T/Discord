import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { Command } from '../../Core/command.js';
import { getTwitchData, makeErrorEmbed } from '../../Core/functions.js';

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
    await interaction.deferReply();

    try {
      const person = (interaction.options.get('person_name', true).value as string).toLowerCase();
      const notFound = new EmbedBuilder()
        .setTitle("Entry not found")
        .setDescription(`Username ${person} not found in the cheaters list. Please check the spelling or the existence of the user ☠️`)
        .setColor("Red");

      const userData = await getTwitchData(person);

      if ('error' in userData) return await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Error: f() getTwitchData")
            .setDescription(`Either the user ${person} is not a valid Twitch username or the user is banned from Twitch`)
            .setColor("Red")
        ]
      });

      let cheaters: Record<string, string> = await Bun.file('./src/Config/cheaters.json').json();
      const cheaterIds = Object.keys(cheaters);
      if (!cheaterIds.includes(userData.id)) return await interaction.editReply({ embeds: [notFound] });
      delete cheaters[userData.id];
      await Bun.write('./src/Config/cheaters.json', JSON.stringify(cheaters, null, 2));
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Person removed")
            .setDescription(`Successfully removed the person from the cheaters list`)
            .setColor("Random")
            .setTimestamp()
            .setFooter({ text: "Embed auto created by d3fau4tbot", iconURL: `${client.guilds.cache.get(`${interaction.guildId}`)?.iconURL()}` })
            .setAuthor({ name: "Words on Stream", iconURL: "https://cdn.discordapp.com/attachments/992562774649610372/993274540966809621/1f09655df10d184b07c9e5930063497a.jpg" })
            .setThumbnail(`https://cdn.discordapp.com/attachments/933971458496004156/1005590805756530718/Checkmark-green-tick-isolated-on-transparent-background-PNG.png`)
            .addFields(
              { name: "Person removed", value: userData.displayName, inline: true },
              { name: "List count", value: cheaterIds.length.toString(), inline: true }
            )
        ]
      });
    } catch (error) {
      const err = error as Error;
      await interaction.editReply({
        embeds: [makeErrorEmbed(err)]
      });
    }
  }
});