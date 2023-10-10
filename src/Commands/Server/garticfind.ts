import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, MessageComponentInteraction, SlashCommandBuilder } from 'discord.js';
import { Command } from '../../Core/command.js';

const buttonComponents = [
    new ButtonBuilder().setLabel("Compact View").setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setLabel("List View").setStyle(ButtonStyle.Secondary)
];

const actionComponent = new ActionRowBuilder<ButtonBuilder>().addComponents(
    buttonComponents.map((button, index) => {
        button.setCustomId(`garticfind_${index}`);
        return button;
    })
);

const createEmbed = (query: string, answers: string[], listView: boolean) => new EmbedBuilder()
    .setTitle(`Possible answers for the query:\n \`${query}\``)
    .setDescription(listView ? answers.join('\n') : answers.join(',  '))
    .setColor("Blue")
    .setAuthor({ name: "Gartic", iconURL: "https://gartic.com/favicon.ico", url: "https://gartic.com" })

export default new Command({
    name: "garticfind",
    description: "Get the gartic answer for a query if exists in gos dictionary",
    emote: false,
    guildId: ["1053990732958023720", "976169594085572679", "1021508735165808641"],
    data: new SlashCommandBuilder()
        .setName("garticfind")
        .setDescription("Get the gartic answer for a query if exists in gos dictionary")
        .addStringOption((Option) =>
            Option
                .setName("query")
                .setDescription("Paste the gartic hint here that looks like this: C _ _ _ _ _ _ _ _")
                .setRequired(true)
        ),
    run: async ({ interaction, client }) => {
        if (interaction === undefined) return;
        await interaction.deferReply();

        let word = interaction.options.getString("query", true);

        try {
            const { results } = client.functions.searchGarticAnswer(word);
            const list: string[] = [];
            results?.forEach((answer, index) => list.push(`${index + 1}. ${answer}`));
            const msg = await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setAuthor({ name: "Gartic", iconURL: "https://gartic.com/favicon.ico", url: "https://gartic.com" })
                        .setTitle(`Possible answers for the query:\n \`${word.replace(/\\/g, '')}\``)
                        .setDescription(results?.join(',  ') || "No answers found")
                        .setColor("Blue")
                ],
                components: [actionComponent]
            });

            const filter = (button: { user: { id: string; }; }) => button.user.id === interaction.user.id;
            const collector = msg.createMessageComponentCollector({ filter, time: 5 * 60 * 1000 });

            collector.on("collect", async (i: MessageComponentInteraction) => {
                if (i.customId === `garticfind_0`) await i.update({
                    embeds: [createEmbed(word, results || [], false)],
                    components: [actionComponent]
                })

                else await i.update({
                    embeds: [createEmbed(word, results || [], true)],
                    components: [actionComponent]
                });
            });
        } catch (error) {
            const err = error as Error;
            await interaction.editReply({
                embeds: [client.functions.makeErrorEmbed(err, `[${err.name}] Error finding the query:\n \`${word}\``)]
            });
        }
    }
});