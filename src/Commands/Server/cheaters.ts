import { Command } from '../../Core/command.js';
import { readFileSync } from 'fs';
import { client } from '../../../index.js';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  MessageComponentInteraction,
  SlashCommandBuilder
} from 'discord.js';

const buttons = [
  new ButtonBuilder().setLabel("Previous").setStyle(ButtonStyle.Primary),
  new ButtonBuilder().setLabel("Show all").setStyle(ButtonStyle.Secondary),
  new ButtonBuilder().setLabel("Next").setStyle(ButtonStyle.Success)
];

const componentPrevDisabled = new ActionRowBuilder<ButtonBuilder>().addComponents(
  buttons.map(button => {
    button.setCustomId("cheaters_previous");
    button.setDisabled(false);
    return button;
  })
);

const componentNextDisabled = new ActionRowBuilder<ButtonBuilder>().addComponents(
  buttons.map(button => {
    button.setCustomId("cheaters_next");
    button.setDisabled(false);
    return button;
  })
);

const componentNormal = new ActionRowBuilder<ButtonBuilder>().addComponents(
  buttons.map((button, index) => {
    button.setCustomId(`cheaters_${index}`);
    return button;
  })
);

interface pages {
  embeds: EmbedBuilder[];
  components: ActionRowBuilder<ButtonBuilder>;
}

const pageCreator = (): pages[] => {
  const cheaters = JSON.parse(readFileSync('./src/Config/cheaters.json', 'utf-8')) as string[];
  const itemsPerPage = 10;
  const numberOfPages = Math.ceil(cheaters.length / itemsPerPage);
  return [...Array(numberOfPages)].map((_, i) => ({
    embeds: [
      new EmbedBuilder()
        .setTitle(`Showing ${i * itemsPerPage + 1}-${i * itemsPerPage + itemsPerPage} cheaters saved into my memory (${cheaters.length} in total)`)
        .setDescription(client.functions.makeList(client.functions.getCheaters(i * itemsPerPage, i * itemsPerPage + itemsPerPage), i * itemsPerPage).join("\n"))
        .setColor("Red")
        .setAuthor({ name: "Courtesy of D3FAU4T", iconURL: "https://cdn.discordapp.com/avatars/867522091490607134/aed8cac1742d4dbdba79d5de17700592.webp?size=256", url: "https://twitch.tv/d3fau4t" })
        .setFooter({ text: `Page ${i + 1} of ${numberOfPages} 🤖 Note: Buttons are valid for 5 mins after creation and can only be controlled by whoever initiated the Slash Command` })
    ],
    components: (i === 0) ? componentPrevDisabled : (i === numberOfPages - 1) ? componentNextDisabled : componentNormal
  }));
}

export default new Command({
  name: 'cheaters',
  description: 'Get a list of cheaters or search for a specific cheater',
  emote: false,
  guildId: ["976169594085572679", "1021508735165808641"],
  data: new SlashCommandBuilder()
    .setName("cheaters")
    .setDescription("Get a list of cheaters or search for a specific cheater")
    .addStringOption(Option =>
      Option
        .setName("cheater_name")
        .setDescription("Enter the username of the user you're looking for (check typos)")
        .setRequired(false)
    ),
  run: async ({ interaction, client }) => {
    if (interaction === undefined) return;
    await interaction.deferReply();

    let page = 1;
    let cheaters = (JSON.parse(readFileSync('./src/Config/cheaters.json', 'utf-8')) as string[]).sort();

    if (interaction.options.get('cheater_name') === null) {
      let embedPages = pageCreator();
      await interaction.editReply({
        embeds: embedPages[0].embeds,
        components: [embedPages[0].components]
      })
      .then(message => {
        const filter = (button: { user: { id: string; }; }) => button.user.id === interaction.user.id;
        const collector = message.createMessageComponentCollector({ filter, time: 5 * 60 * 1000 });

        collector.on("collect", async (i: MessageComponentInteraction) => {
          if (i.customId === 'cheaters_2') {
            page++;
            for (let j = 0; j < embedPages.length; j++) {
              if (page == j + 1) await i.update({
                embeds: embedPages[j].embeds,
                components: [embedPages[j].components]
              });
            }
          } else if (i.customId === 'cheaters_0') {
            page--;
            for (let j = 0; j < embedPages.length; j++) {
              if (page == j + 1) await i.update({
                embeds: embedPages[j].embeds,
                components: [embedPages[j].components]
              });
            }
          } else if (i.customId === 'cheaters_1') {
            await i.update({
              embeds: [
                new EmbedBuilder()
                  .setTitle(`Showing all ${cheaters.length} cheaters saved into my memory`)
                  .setDescription(client.functions.getCheaters(0, cheaters.length).join(", "))
                  .setColor("Red")
                  .setAuthor({ name: "Courtesy of D3FAU4T", iconURL: "https://cdn.discordapp.com/avatars/867522091490607134/aed8cac1742d4dbdba79d5de17700592.webp?size=256", url: "https://twitch.tv/d3fau4t" })
              ],
              components: []
            });
          }
        });
      });


    } else {

      const toFind = interaction.options.get('cheater_name', true).value as string;
      const found = cheaters.includes(toFind) ? 'Yep that MF is a cheater' : 'Nope never heard of this guy';

      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Query Search Result")
            .setDescription("Search through the whole list if the username is present or not\nNote: Typos will lead to incorrect results. Make sure to query the username correctly and capitalization does not matter.")
            .setColor("DarkGreen")
            .setFooter({ text: "Embed auto created by d3fau4tbot", iconURL: client.guilds.cache.get(interaction.guildId as string)?.iconURL() as string })
            .setTimestamp()
            .addFields(
              { name: "Cheater Name", value: toFind, inline: true },
              { name: "Is it there?", value: found, inline: true },
            )
        ],
      });

    }
  }
});