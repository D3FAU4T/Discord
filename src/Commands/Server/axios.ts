import { Command } from '../../Core/command.js';
import { parseOpts } from '../../Typings/functions.js';
import { SlashCommandBuilder } from 'discord.js';

export default new Command({
  name: "axios",
  description: "Fetch data from an API or Post using Axios lib",
  emote: false,
  data: new SlashCommandBuilder()
  .setName("axios")
  .setDescription("Fetch data from an API or Post using Axios lib")
  .addSubcommand((SubCommand) =>
    SubCommand
      .setName("get")
      .setDescription("Fetch data from an API using Axios lib")
      .addStringOption((Option) =>
        Option
          .setName("url")
          .setDescription("Enter the URL of the API")
          .setRequired(true)
      )
      .addStringOption((Option) =>
        Option
          .setName("headers")
          .setDescription("Enter the headers of the API (if any)")
          .setRequired(false)
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
      )
  )
  .addSubcommand((SubCommand) =>
    SubCommand
      .setName("post")
      .setDescription("Post data to an API using Axios lib")
      .addStringOption((Option) =>
        Option
          .setName("url")
          .setDescription("Enter the URL of the API")
          .setRequired(true)
      )
      .addStringOption((Option) =>
        Option
          .setName("data")
          .setDescription("Enter the data to be posted to the API")
          .setRequired(true)
      )
      .addStringOption((Option) =>
        Option
          .setName("headers")
          .setDescription("Enter the headers of the API (if any)")
          .setRequired(false)
      )
  ),
  guildId: ["1021508735165808641"],
  run: async ({ interaction, client }) => {
    if (interaction === undefined) return;

    const interactionHeaders = interaction.options.get('headers')?.value;
    const interactionResponseParser = interaction.options.get('response_parser')?.value as parseOpts;
    const url = interaction.options.get('url', true).value as string;

    if (interaction.options.getSubcommand() === 'get') {

      const response_parser = interactionResponseParser && typeof interactionResponseParser === 'string' ? interactionResponseParser : 'text';
      const headers: object | undefined = interactionHeaders && typeof interactionHeaders === "string" ? JSON.parse(interactionHeaders) : undefined;

      const res = await client.functions.axiosHandler(url, 'get', headers);

      if (res.data) await interaction.reply(client.functions.textFormatter(res.data, response_parser));
      else if (res.response.data) await interaction.reply(client.functions.textFormatter(res.response.data, 'json'));
      else await interaction.reply(client.functions.textFormatter(res, 'text'));

    } else {
  
      const headers: object | undefined = interactionHeaders && typeof interactionHeaders === 'string' ? JSON.parse(interactionHeaders) : undefined;
      const response_parser = interactionResponseParser && interactionResponseParser satisfies parseOpts ? interactionResponseParser : 'text';
      const uploadingData = interaction.options.get('data')?.value;

      const res = await client.functions.axiosHandler(url, 'post', headers, uploadingData);

      if (res.data) await interaction.reply(client.functions.textFormatter(res.data, response_parser));
      else if (res.response.data) await interaction.reply(client.functions.textFormatter(res.response.data, 'json'));
      else await interaction.reply(client.functions.textFormatter(res, 'text'));
  
    }
  }
});