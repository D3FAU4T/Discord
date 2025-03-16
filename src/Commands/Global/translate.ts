import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { Command } from "../../Core/command.js";
// @ts-ignore
import translate, { languages } from "translate-google";
import { makeErrorEmbed } from "../../Core/functions.js";

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
        await interaction.deferReply();

        try {
            const translateFrom = interaction.options.get('from_language')?.value as keyof languages || 'auto';
            const translateTo = interaction.options.get('to_language')?.value as keyof languages || 'en';

            const sentence = interaction.options.get("query", true).value as string;
            const res = await translate(sentence, { from: translateFrom, to: translateTo });

            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Translation")
                        .setDescription('Get translations for a query')
                        .setColor("Blue")
                        .addFields(
                            { name: 'Query', value: sentence },
                            { name: 'Translation', value: res },
                            { name: 'From', value: languages[translateFrom] }
                        )
                        .setFooter({ text: "Embed auto created by d3fau4tbot", iconURL: client.guilds.cache.get(interaction.guildId as string)?.iconURL() as string })
                        .setTimestamp()
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