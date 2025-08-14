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

        const { percentage, status, health, temp, timeToFull, svg, hoursRemaining } = await getBatteryInfo();

        const batteryImg = new AttachmentBuilder(svg, {
            name: "battery.png",
        });

        const section = new SectionBuilder()
            .addTextDisplayComponents(
                textDisplay => textDisplay
                    .setContent([
                        `# Battery Info`,
                        `- **Percentage:** ${percentage}%`,
                        `- **Status:** ${status}`,
                        `- **Health:** ${health}`,
                        `- **Temperature:** ${temp}`,
                        status.trim() === "Charging" ?
                        `- **Full until:** ${timeToFull}` :
                        `- **Remaining:** ${hoursRemaining} hours`,
                    ].join('\n'))
            )
            .setThumbnailAccessory(
                thumbnail => thumbnail
                    .setURL(`attachment://${batteryImg.name}`)
            );

        await interaction.editReply({
            files: [batteryImg],
            components: [section],
            flags: MessageFlags.IsComponentsV2
        });
    },
}