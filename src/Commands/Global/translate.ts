import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import translate, { languages } from "translate-google";
import { Command } from "../../Core/command.js";

export default new Command({
  name: "translate",
  description: "Translate a text to a language of your choice",
  emote: false,
  data: new SlashCommandBuilder()
    .setName("translate")
    .setDescription("Translate a text to a language of your choice")
    .addStringOption((Option) =>
      Option
        .setName("query")
        .setDescription("Type the text you want to translate")
        .setRequired(true)
    )
    .addStringOption((Option) =>
      Option
        .setName("from_language")
        .setDescription("Type the language you want to translate from")
        .setRequired(false)
        .setChoices(
          { name: "Automatic", value: "auto" },
          { name: "Arabic", value: "ar" },
          { name: "Bengali", value: "bn" },
          { name: "English", value: "en" },
          { name: "Filipino", value: "tl" },
          { name: "French", value: "fr" },
          { name: "Hebrew", value: "iw" },
          { name: "Hindi", value: "hi" },
          { name: "Italian", value: "it" },
          { name: "Latin", value: "la" },
          { name: "Portuguese", value: "pt" },
          { name: "Spanish", value: "es" }
        )
    )
    .addStringOption(option =>
      option
        .setName("to_language")
        .setDescription("The Language you want to translate to")
        .setRequired(false)
        .setChoices(
          { name: "Arabic", value: "ar" },
          { name: "Bengali", value: "bn" },
          { name: "English", value: "en" },
          { name: "Filipino", value: "tl" },
          { name: "French", value: "fr" },
          { name: "Hebrew", value: "iw" },
          { name: "Hindi", value: "hi" },
          { name: "Italian", value: "it" },
          { name: "Latin", value: "la" },
          { name: "Portuguese", value: "pt" },
          { name: "Spanish", value: "es" }
        )
    ),
  run: async ({ interaction, client }) => {
    if (interaction === undefined) return;
    let translateFrom: keyof languages = 'auto';
    let translateTo: keyof languages = 'en';

    interaction.options.data.forEach(element => {
      if (element.name === 'from_language') translateFrom = element.value as keyof languages;
      else if (element.name === 'to_language') translateTo = element.value as keyof languages;
    });

    const sentence = interaction.options.get("query", true).value as string;
    const res = await translate(sentence, { from: translateFrom, to: translateTo });

    try {
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Translation")
            .setDescription('Get translations for a query')
            .setColor("Blue")
            .addFields(
              { name: 'Query', value: sentence },
              { name: 'Translation', value: res }
            )
            .setFooter({ text: "Embed auto created by d3fau4tbot", iconURL: client.guilds.cache.get(interaction.guildId as string)?.iconURL() as string })
            .setTimestamp()
        ]
      });
    } catch (err) {
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Error!")
            .setDescription('Something went wrong!')
            .setColor("Red")
        ]
      })
    }
    
  }
});