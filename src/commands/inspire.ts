import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { getRandom, ErrorEmbed } from "../core/functions.js";
import type { Command } from "../typings/core.js";

type Quote = { a: string; q: string };

export default <Command>{
    data: new SlashCommandBuilder()
        .setName("inspire")
        .setDescription("Gives you an inspirational quote from zenquotes API"),

    async execute(interaction) {
        await interaction.deferReply();

        const response = await fetch("https://zenquotes.io/api/quotes");

        if (!response.ok)
            throw ErrorEmbed("ZenQuotes API Error", `Failed to fetch quotes: ${response.statusText}`);

        const data = await response.json() as Quote[];

        const randomQuote = getRandom(data);

        if (!randomQuote)
            throw ErrorEmbed("ZenQuotes API Error", "Inspirational quotes not found");

        await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setTitle(randomQuote.q)
                    .setAuthor({
                        name: randomQuote.a,
                        iconURL: "https://cdn.discordapp.com/attachments/993276383591665796/1030632331469402175/favicon.png",
                    })
                    .setColor("Blue")
                    .setURL("https://zenquotes.io/")
            ],
        });
    },
};
