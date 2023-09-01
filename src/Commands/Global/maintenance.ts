import axios from "axios";
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { Command } from "../../Core/command";

export default new Command({
    name: "maintenance",
    description: "Set the bot in maintenance mode",
    emote: false,
    data: new SlashCommandBuilder()
        .setName('maintenance')
        .setDescription('This command group contains couple of maintenance commands for the bot')
        .addSubcommand(subcommand =>
            subcommand
                .setName('update_cheater_names')
                .setDescription('Updates the cheater names in case someone changed username')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('update_levelbank')
                .setDescription('Updates the levelbank with newest levels')
        ),
    run: async ({ client, interaction }) => {
        if (interaction === undefined) return;
        await interaction.deferReply();

        try {
            if (interaction.options.getSubcommand() === 'update_cheater_names') {
                const message = await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle(`Updating cheater names...`)
                            .setDescription(`Please wait while the cheaters list gets updated. This may take a while`)
                            .setColor("Yellow")
                    ]
                });

                await client.functions.updateCheaterNames();

                await message.edit({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle(`Cheater names updated ✅`)
                            .setDescription(`Successfully updated the cheater names with their current usernames`)
                            .setColor("Green")
                    ]
                });
            }

            else {

                const message = await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle(`Updating levelbank...`)
                            .setDescription(`Please wait while the levelbank gets updated. This may take a while depending on the total amount of levels`)
                            .setColor("Yellow")
                    ]
                });

                try {
                    const updatedList = await client.functions.updateWOSLevels();
                    const { data } = await axios.post<{ status: "ok" }>('https://wos-level-editor.d3fau4tbot.repl.co/updatefromdiscord', updatedList);
                } catch (err) {
                    return await message.edit({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle(`Error while updating levelbank ❌`)
                                .setDescription(`An error occured while updating the levelbank.\n\n\`\`\`${err}\`\`\``)
                                .setColor("Red")
                        ]
                    });
                }

                await message.edit({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle(`Levelbank updated ✅`)
                            .setDescription(`Successfully updated the levelbank with the newest levels`)
                            .setColor("Green")
                    ]
                });
            }
        } catch (error) {
            const err = error as Error;
            await interaction.editReply({
                embeds: [client.functions.makeErrorEmbed(err)]
            });
        }
    }
})