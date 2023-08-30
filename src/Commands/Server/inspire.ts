import axios from "axios";
import { EmbedBuilder } from 'discord.js';
import { Command } from "../../Core/command.js";

export default new Command({
    name: "inspire",
    description: "Gives you an inspirational quote from zenquotes API",
    emote: false,
    guildId: ["976169594085572679"],
    run: async ({ interaction, client }) => {
        if (interaction === undefined) return;

        try {
            const { data } = await axios.get<{ a: string; q: string; }[]>("https://zenquotes.io/api/quotes");
            const randomQuote = client.functions.getRandom(data);
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Inspirational Quote")
                        .setDescription("An Inspirational quote scrapped from the Zenquotes Api")
                        .setAuthor({ name: "Zenquotes.io", iconURL: "https://cdn.discordapp.com/attachments/993276383591665796/1030632331469402175/favicon.png" })
                        .setColor("Blue")
                        .setURL("https://zenquotes.io/")
                        .setFooter({ text: "Embed auto created by d3fau4tbot", iconURL: client.guilds.cache.get(interaction.guildId as string)?.iconURL() as string })
                        .setThumbnail("https://cdn.discordapp.com/attachments/993276383591665796/1030640368355643482/quote-icon_1627548.jpg")
                        .setTimestamp()
                        .addFields(
                            { name: "Quote", value: randomQuote.q, inline: false },
                            { name: "Author", value: randomQuote.a, inline: false }
                        )
                ]
            });
        } catch (error) {
            const err = error as Error;
            await interaction.reply({
                embeds: [client.functions.makeErrorEmbed(err)]
            });
        }
    }
});