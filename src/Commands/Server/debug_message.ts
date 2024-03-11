import axios from "axios";
import { Command } from "../../Core/command";
import { EmbedBuilder, SlashCommandBuilder, AttachmentBuilder } from "discord.js";

export default new Command({
    name: "debug_message",
    description: "Debug message",
    emote: false,
    guildId: ["1021508735165808641", "1052208273702518934", "1053990732958023720"],
    data: new SlashCommandBuilder()
        .setName("debug_message")
        .setDescription("Debug any message if the bot has access to it")
        .addStringOption((Option) =>
            Option
                .setName("message_link")
                .setDescription("Enter the message link of discord")
                .setRequired(true)
        ),
    run: async ({ interaction, client }) => {
        if (interaction === undefined) return;
        await interaction.deferReply();

        try {
            const link = interaction.options.getString("message_link", true);
            if (!link.startsWith('https://discord.com')) return await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Invalid Link")
                        .setDescription("The link you provided is invalid to the discord API")
                        .setColor("Red")
                ]
            });

            else if (!link.startsWith('https://discord.com/channels/')) return await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Incorrect Link")
                        .setDescription("The link you provided doesn't seems like a message link. Click on the 3 dots of a message and click on 'Copy Message Link'")
                        .setColor("Red")
                ]
            });

            else {
                let [channelId, messageId] = link.replace(/https\:\/\/discord\.com\/channels\/(\d+\/)/g, '').split('/');
                const { data } = await axios.get<object>(`https://discord.d3fau4tbot.repl.co/getmessagedata/${channelId}/${messageId}`);
                const res = JSON.stringify(data, null, 2);
                if (res.length > 2000) return await interaction.editReply({
                    files: [
                        new AttachmentBuilder(Buffer.from(res), {
                            name: "response.json",
                            description: "Response from the API"
                        })
                    ]
                });

                else return await interaction.editReply(
                    client.functions.textFormatter(res, "json")
                );
            }
        } catch (error) {
            const err = error as Error;
            await interaction.editReply({
                embeds: [client.functions.makeErrorEmbed(err)]
            });
        }
    }
});