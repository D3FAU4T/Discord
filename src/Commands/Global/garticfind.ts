import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, MessageComponentInteraction, SlashCommandBuilder } from 'discord.js';
import { Command } from '../../Core/command.js';
import { searchGarticAnswer } from '../../Core/functions.js';

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

export default new Command({
    name: "garticfind",
    description: "Get the gartic answer for a query if exists in gos dictionary",
    emote: false,
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

        const word = interaction.options.get("query", true).value as string;

        try {
        
        const answers = searchGarticAnswer(word);
        const list: string[] = [];
        answers.forEach((answer, index) => {
            list.push(`${index + 1}. ${answer}`)
        });
        await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setTitle(`Possible answers for the query:\n \`${word}\``)
                    .setDescription(answers.join(',  '))
                    .setColor("Blue")
            ],
            components: [actionComponent]
        })
            .then(message => {
                const filter = (button: { user: { id: string; }; }) => button.user.id === interaction.user.id;
                const collector = message.createMessageComponentCollector({ filter, time: 5 * 60 * 1000 });

                collector.on("collect", async (i: MessageComponentInteraction) => {
                    if (i.customId === `garticfind_0`) await i.update({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle(`Possible answers for the query:\n \`${word}\``)
                                .setDescription(answers.join(',  '))
                                .setColor("Blue")
                        ],
                        components: [actionComponent]
                    })

                    else await i.update({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle(`Possible answers for the query:\n \`${word}\``)
                                .setDescription(list.join('\n'))
                                .setColor("Blue")
                        ],
                        components: [actionComponent]
                    });
                })
            });
        } catch (err) {
          await interaction.editReply({
            embeds: [
              new EmbedBuilder()
              .setTitle(`Error finding the query:\n \`${word}\``)
              .setDescription(`${err}`)
              .setColor("Red")
            ]
          })
        }
    }
});