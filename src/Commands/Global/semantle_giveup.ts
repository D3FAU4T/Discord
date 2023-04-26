import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { Command } from '../../Core/command.js';

export default new Command({
    name: 'semantle_giveup',
    description: "Can't find the word? Tired of guessing? GiveUp!",
    emote: false,
    data: new SlashCommandBuilder()
    .setName("semantle_giveup")
    .setDescription("Can't find the word? Tired of guessing? GiveUp!")
    .addStringOption(Option => 
        Option
        .setName("show_publicly")
        .setDescription("Do you want to show the answer publicly?")
        .setRequired(true)
        .setChoices({ name: "Yes", value: "yes" }, { name: "No", value: "no" })
    ),
    run: async ({ interaction, client }) => {
        if (interaction === undefined) return;
        try {
            const showWord = interaction.options.get('show_publicly', true).value as "yes" | "no";
            
            await interaction.deferReply({ ephemeral: showWord === 'yes' ? false : true });

            if (client.semantle[interaction.channel?.id!] === undefined || client.semantle[interaction.channel?.id!].configurations.findTheWord == false) {
                await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle("Semantle: Give up")
                            .setDescription("Error: Uninitialized game. Start a game first!")
                            .setColor("Red")
                    ],
                });
            } else {
                await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle("Semantle: Give up")
                            .setDescription(`The word was ${client.semantle[interaction.channel?.id!].configurations.hiddenWord}`)
                            .setColor("White")
                    ],
                });

                if (showWord === 'yes') client.semantle[interaction.channel?.id!].configurations.findTheWord = false;
                else client.semantle[interaction.channel?.id!].ignoreList.push(interaction.user.id);
            }
        } catch (err: Error | any) {
            console.error("Error generated, check logs")
            console.error(err);
        }
    }
});