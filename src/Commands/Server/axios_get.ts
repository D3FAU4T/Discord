import axios from 'axios';
import { Command } from '../../Core/command.js';
import { parseOpts } from '../../Typings/functions.js';
import { AttachmentBuilder, SlashCommandBuilder } from 'discord.js';

export default new Command({
  name: "axios_get",
  description: "Fetch data from an API or Post using Axios lib",
  emote: false,
  data: new SlashCommandBuilder()
    .setName("axios_get")
    .setDescription("Fetch data from an API using Axios lib")
    .addStringOption((Option) =>
      Option
        .setName("url")
        .setDescription("Enter the URL of the API")
        .setRequired(true)
    )
    .addStringOption((Option) =>
      Option
        .setName("response_parser")
        .setDescription("Enter the type of the response for prettify (if known)")
        .setRequired(false)
        .setChoices(
          { name: "JSON", value: "json" },
          { name: "Text", value: "text" },
          { name: "HTML", value: "html" },
          { name: "JavaScript", value: "js" },
          { name: "Python", value: "python" },
          { name: "Difference", value: "diff" }
        )
    ),
  guildId: ["1021508735165808641"],
  run: async ({ interaction, client }) => {
    if (interaction === undefined) return;
    await interaction.deferReply();

    try {
      const url = interaction.options.getString("url", true);
      const responseParser = interaction.options.getString("response_parser", false) as parseOpts | null;

      const { data } = await axios.get(url);

      if (typeof data === 'object') {
        const res = JSON.stringify(data, null, 2);
        if (res.length > 2000) return await interaction.editReply({
          files: [
            new AttachmentBuilder(Buffer.from(res), {
              name: "response.json",
              description: "Response from the API"
            })
          ]
        });

        else return await interaction.editReply(
          client.functions.textFormatter(res, responseParser || "text")
        );
      }

      else {
        const res = `${data}`;
        if (res.length > 2000) return await interaction.editReply({
          files: [
            new AttachmentBuilder(Buffer.from(res), {
              name: "response.txt",
              description: "Response from the API"
            })
          ]
        });

        else return await interaction.editReply(
          client.functions.textFormatter(res, responseParser || "text")
        );
      }
    } catch (error) {
      const err = error as Error;
      await interaction.editReply({
        embeds: [client.functions.makeErrorEmbed(err)]
      });
    }
  }
});