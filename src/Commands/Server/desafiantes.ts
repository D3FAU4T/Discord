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
        await interaction.deferReply();

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

            await interaction.editReply({
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
                            .setURL(locale === "pt-BR" ? "https://discord.com/channels/456915295307694111/745046180374773860" : "https://discord.com/channels/1132372789706371072/1148346708208652360")
                    )
                ]
            });
        } catch (error) {
            const err = error as Error;
            await interaction.editReply({
                embeds: [client.functions.makeErrorEmbed(err)]
            });
        }
    }
});