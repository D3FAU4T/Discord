import { EmbedBuilder, PartialTextBasedChannelFields, SlashCommandBuilder } from 'discord.js';
import { Command } from '../../Core/command.js';
import { appendFileSync } from 'fs';

export default new Command({
    name: 'semantle_board',
    description: "Shows the board again in case someone converses after the board",
    emote: false,
    data: new SlashCommandBuilder()
    .setName("semantle_board")
    .setDescription("Shows the board again in case someone converses after the board"),
    run: async ({ interaction, client }) => {
        if (interaction === undefined) return;

        try {

            await interaction.deferReply()

            if (client.semantle[interaction.channel?.id!] === undefined || client.semantle[interaction.channel?.id!].configurations.findTheWord === false) {
                await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle("Semantle: Reshow Board")
                            .setDescription("Error: Uninitialized game. Start a game first!")
                            .setColor("Red")
                    ]
                })
            } else {
                await interaction.editReply({ content: "Sure, here's the board again" });
                const oldMsg = client.semantle[interaction.channel?.id!].configurations.message;
                await oldMsg?.delete();
                client.semantle[interaction.channel?.id!].configurations.message = await (client.channels.cache.get(interaction.channel?.id!) as PartialTextBasedChannelFields).send({ content: oldMsg?.content })
            }
        } catch (err: Error | any) {
            console.error("Error generated, check logs")
            console.log(err);
            appendFileSync("./src/Core/Error.log", err + "\n\n");
        }
    }
});