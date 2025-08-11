import { getBatteryInfo } from "src/android/battery";
import { AttachmentBuilder, MessageFlags, SectionBuilder, SlashCommandBuilder } from "discord.js";
import type { Command } from "src/typings/core";

export default <Command>{
    data: new SlashCommandBuilder()
        .setName("battery")
        .setDescription("Check the battery level"),
    async execute(interaction) {
        await interaction.deferReply();

        if (process.platform !== 'android') {
            await interaction.reply(`Battery info is not available on this platform: \`${process.platform}\``);
            return;
        }

        const { percentage, status, health, svg } = await getBatteryInfo();

        const batteryImg = new AttachmentBuilder(svg, {
            name: "battery.png",
            description: "Battery status"
        });

        const section = new SectionBuilder()
            .addTextDisplayComponents(
                textDisplay => textDisplay
                    .setContent([
                        `# Battery Info`,
                        `- Percentage: ${percentage}%`,
                        `- Status: ${status}`,
                        `- Health: ${health}`
                    ].join('\n'))
            )
            .setThumbnailAccessory(
                thumbnail => thumbnail
                    .setURL(`attachment://${batteryImg.name}`)
                    .setDescription("Battery status image")
            );

        await interaction.editReply({
            files: [batteryImg],
            components: [section],
            flags: MessageFlags.IsComponentsV2
        });
    },
}