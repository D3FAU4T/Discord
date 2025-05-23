import { EmbedBuilder } from 'discord.js';
import { Command } from "../../Core/command.js";
import { getRandom, makeErrorEmbed } from "../../Core/functions.js";

export default new Command({
    name: "inspire",
    description: "Gives you an inspirational quote from zenquotes API",
    emote: false,
    guildId: ["976169594085572679"],
    run: async ({ interaction, client }) => {
        await interaction.deferReply();

        try {
            const response = await fetch("https://zenquotes.io/api/quotes");
            const data = await response.json() as { a: string, q: string }[];
            const randomQuote = getRandom(data);
            await interaction.editReply({
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
        }
        
        catch (error) {
            const err = error as Error;
            await interaction.editReply({
                embeds: [makeErrorEmbed(err)]
            });
        }
    }
});