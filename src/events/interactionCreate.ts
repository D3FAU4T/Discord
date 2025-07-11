import { Event } from "../core/client.js";
import { EmbedBuilder } from "discord.js";

export default new Event("interactionCreate", async interaction => {
    const commands = interaction.client.commands;

    if (interaction.isChatInputCommand()) {
        const command = commands.get(interaction.commandName);
        if (!command) {
            await interaction.reply(`This command does not exist.`);
            return;
        }

        try {
            await command.execute(interaction);
        }

        catch (error) {

            if (error instanceof EmbedBuilder) {
                await interaction.editReply({ embeds: [error] });
                return;
            }

            else if (error instanceof Error) {
                console.error(`Error executing command ${interaction.commandName}:`, error);
                await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setAuthor({ name: error.name, iconURL: "https://cdn.discordapp.com/attachments/1097538516436660355/1146354645107748925/Error.png" })
                            .setTitle(error.message)
                            .setDescription(`\`\`\`ts\n${error.stack}\n\`\`\``)
                            .setColor("Red")
                    ]
                });
            }

        }
    }
});