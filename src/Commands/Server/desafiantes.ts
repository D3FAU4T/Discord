import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder, SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js";
import { Command } from "../../Core/command";
import { readFileSync } from "fs";
import { Desafiantes } from "../../Typings/desafiantes";

export default new Command({
    name: "desafiantes",
    description: "Show the challengers of the Courage group",
    emote: false,
    guildId: ["1021508735165808641", "1132372789706371072"],
    data: new SlashCommandBuilder()
        .setName("desafiantes")
        .setDescription("Show the challengers of the Courage group")
        .setDescriptionLocalizations({
            "en-US": "Show the challengers of the Courage group",
            "en-GB": "Show the challengers of the Courage group",
            "pt-BR": "Mostra os desafiantes do grupo Courage"
        }),
    run: async ({ client, interaction }) => {
        if (interaction === undefined) return;
        await interaction.reply('...');

        const translations = {
            "en-US": [
                "Status of the challenges",
                "Complete the weekly challenges to earn rewards set by the Gartic Admins. To know more about them, click the `Challenges` button below."
            ],
            "en-GB": [
                "Status of the challenges",
                "Complete the weekly challenges to earn rewards set by the Gartic Admins. To know more about them, click the `Challenges` button below."
            ],
            "pt-BR": [
                "Status dos desafios",
                "Complete os desafios semanais para ganhar recompensas definidas pelos Administradores do Gartic. Para saber mais sobre eles, clique no botão `Desafios` abaixo."
            ]
        }

        try {
            let desafiantes = JSON.parse(readFileSync("./src/Config/desafiantes.json", "utf-8")) as Desafiantes;

            const locale = interaction.locale;

            const msg = await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setAuthor({ name: "COURAGE", iconURL: "https://cdn.discordapp.com/attachments/1133396329163407560/1134517749230620763/Courage.png" })
                        .setTitle(locale === "pt-BR" ? translations[locale][0] : translations["en-US"][0])
                        .setDescription(locale === "pt-BR" ? translations[locale][1] : translations["en-US"][1])
                        .setFields([
                            { name: locale === "pt-BR" ? "Desafio 1" : "Challenge 1", value: desafiantes.desafio1.length > 0 ? desafiantes.desafio1.join(', ') : locale === "pt-BR" ? "Nenhum" : "None", inline: false },
                            { name: locale === "pt-BR" ? "Desafio 2" : "Challenge 2", value: desafiantes.desafio2.length > 0 ? desafiantes.desafio2.join(', ') : locale === "pt-BR" ? "Nenhum" : "None", inline: false },
                            { name: locale === "pt-BR" ? "Desafio 3" : "Challenge 3", value: desafiantes.desafio3.length > 0 ? desafiantes.desafio3.join(', ') : locale === "pt-BR" ? "Nenhum" : "None", inline: false },
                            { name: locale === "pt-BR" ? "Gartiqueiros" : "Gartic-ers", value: desafiantes.todos.length > 0 ? desafiantes.todos.join(', ') : locale === "pt-BR" ? "Nenhum" : "None", inline: false },
                        ])
                        .setColor("Purple")
                ],
                components: [
                    new ActionRowBuilder<ButtonBuilder>().addComponents(
                        new ButtonBuilder()
                            .setLabel(locale === "pt-BR" ? "Desafios" : "Challenges")
                            .setStyle(ButtonStyle.Link)
                            .setURL(locale === "pt-BR" ? "https://discord.com/channels/456915295307694111/745046180374773860" : "https://discord.com/channels/1132372789706371072/1148346708208652360"),
                        new ButtonBuilder()
                            .setLabel(locale === "pt-BR" ? "Remover" : "Remove")
                            .setStyle(ButtonStyle.Danger)
                            .setCustomId("removeDesafiantes")
                            .setEmoji("❌")
                    )
                ]
            });
          /*

            const buttonCollector = msg.createMessageComponentCollector({ componentType: ComponentType.Button, time: 300_000, filter: i => i.user.id === interaction.user.id });

            buttonCollector.on("collect", async i => {
                if (i.customId !== "removeDesafiantes") return;
                const dsfSelect = await i.followUp({
                    ephemeral: true,
                    embeds: [
                        new EmbedBuilder()
                            .setTitle(locale === "pt-BR" ? "Selecione um desafio que você deseja modificar" : "Select a challenge that you want to modify")
                            .setColor("Blue")
                    ],
                    components: [
                        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
                            new StringSelectMenuBuilder()
                                .setCustomId("desafiantesMenu")
                                .setPlaceholder(locale === "pt-BR" ? "Selecione um desafio" : "Select a challenge")
                                .setMinValues(1)
                                .setMaxValues(1)
                                .addOptions(
                                    new StringSelectMenuOptionBuilder()
                                        .setLabel(locale === "pt-BR" ? "Desafio 1" : "Challenge 1")
                                        .setValue("dsf1")
                                        .setDescription(locale === "pt-BR" ? "235 pontos em Objetos" : "235 points in Objects")
                                        .setEmoji("1️⃣"),
                                    new StringSelectMenuOptionBuilder()
                                        .setLabel(locale === "pt-BR" ? "Desafio 2" : "Challenge 2")
                                        .setValue("dsf2")
                                        .setDescription(locale === "pt-BR" ? "5 partidas em Gamagame" : "5 matches in Gamagame")
                                        .setEmoji("2️⃣"),
                                    new StringSelectMenuOptionBuilder()
                                        .setLabel(locale === "pt-BR" ? "Desafio 3" : "Challenge 3")
                                        .setValue("dsf3")
                                        .setDescription(locale === "pt-BR" ? "Tema alimentos" : "Foods theme")
                                        .setEmoji("3️⃣"),
                                )
                        )
                    ]
                });

                const selectCollector = await dsfSelect.awaitMessageComponent({ time: 300_000, filter: i => i.user.id === interaction.user.id, componentType: ComponentType.StringSelect });

                await selectCollector.followUp({
                    ephemeral: true,
                    content: locale === 'pt-BR' ? `Você selecionou o desafio ${selectCollector.values[0].replace('dsf', '')}\nEste comando está incompleto e é um trabalho em andamento` : `You selected the challenge ${selectCollector.values[0].replace('dsf', '')}\nThis command is incomplete and is a work in progress`
                });
            });
          */
        } catch (error) {
            const err = error as Error;
            await interaction.editReply({
                embeds: [client.functions.makeErrorEmbed(err)]
            });
        }
    }
});