import { writeFileSync, readFileSync } from 'fs';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { Command } from '../../Core/command.js';
import { getTwitchData } from '../../Core/functions.js';

export default new Command({
    name: 'cheaters_add',
    description: 'Add a cheater to the database',
    emote: false,
    guildId: ["976169594085572679"],
    data: new SlashCommandBuilder()
        .setName("cheaters_add")
        .setDescription("Add a cheater to the database")
        .addStringOption(Option =>
            Option
                .setName("cheater_name")
                .setDescription("Enter the username of the cheater")
                .setRequired(true)
        ),
    run: async ({ interaction, client }) => {
        if (interaction === undefined) return;

        const person = (interaction.options.get('cheater_name', true).value as string).toLowerCase();
        const duplicate = new EmbedBuilder()
            .setTitle("Duplicate Entry")
            .setDescription(`The username ${person} is already on the list and will not be added twice.`)
            .setColor("Red");

        const userData = await getTwitchData(person);

        if ('error' in userData) return await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Error: f() getTwitchData")
                    .setDescription(`Either the user ${person} is not a valid Twitch username or the user is banned from Twitch`)
                    .setColor("Red")
            ]
        });

        let cheaters = JSON.parse(readFileSync('./src/Config/cheaters.json', 'utf-8')) as { [userId: string]: string };
        if (Object.keys(cheaters).includes(userData.id)) return await interaction.reply({ embeds: [duplicate] });
        cheaters[userData.id] = userData.displayName;
        writeFileSync('./src/Config/cheaters.json', JSON.stringify(cheaters, null, 2));
        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Cheater added")
                    .setDescription(`Successfully added the cheater to the list.`)
                    .setColor("Random")
                    .setTimestamp()
                    .setFooter({ text: "Embed auto created by d3fau4tbot", iconURL: client.guilds.cache.get(interaction.guildId as string)?.iconURL() as string })
                    .setAuthor({ name: "Words on Stream", iconURL: "https://cdn.discordapp.com/attachments/992562774649610372/993274540966809621/1f09655df10d184b07c9e5930063497a.jpg" })
                    .setThumbnail(`https://cdn.discordapp.com/attachments/933971458496004156/1005590805756530718/Checkmark-green-tick-isolated-on-transparent-background-PNG.png`)
                    .addFields(
                        { name: "Cheater", value: userData.displayName, inline: true },
                        { name: "List count", value: Object.keys(cheaters).length.toString(), inline: true }
                    ),
            ]
        })
    }
});