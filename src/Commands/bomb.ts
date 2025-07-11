import { getRandom } from '../core/functions';
import { EmbedBuilder, GuildMember, SlashCommandBuilder } from 'discord.js';

import type { Command } from '../typings/core';

/*
  OUR PHRASES
   @bomber = <@${interaction.user.id}>
   @person = <@${interaction.options.getUser('person', true).value}>
*/

const phrases = [
    "@bomber has murdered @person in cold blood 💀",
    "The bomb rolled back and killed @bomber instead🤡",
    "The bomb didn't go off. How disappointing -.- 💩",
    "@person exploded into a million tiny pieces💥💥",
    "@person has been blown to smithereens ☠️💥",
    "KABOOM! 💥",
    "@bomber set off a devastating explosion, leaving @person in shambles 💣",
    "@bomber lit the fuse and @person went up in smoke 💥🔥",
    "@person was caught in the crossfire as @bomber detonated the bomb 💥👥",
    "@bomber pulled the trigger and @person was blown away 💥💨",
    "@bomber took out @person with a well-placed bomb 💥👊",
    "The bomb detonated by @bomber left @person feeling the heat 🔥💥",
    "@person was caught in the blast radius of @bomber's bomb 💥❌",
    "@bomber detonated a powerful bomb, leaving @person stunned 💥💔",
    "@person was caught in the explosion set off by @bomber 💥😮",
    "Boom goes the dynamite! 💣",
    "The bomb has claimed another victim... RIP @person 💔",
    "It's raining pieces of @person 💥",
    "The bomb has gone off with a bang! 💥💣",
    "@bomber has caused a massive explosion! 💥💥",
    "The bomb has left @person in pieces 💥💔",
    "The bomb has left @person in shambles 💥💔",
    "The blast from the bomb was heard for miles! 💥💣",
    "The bomb has caused a catastrophic event! 💥💔",
    "The bomb has left @person in ruins 💥💔",
    "The bomb has caused a massive destruction! 💥💣"
];

export default <Command>{
    data: new SlashCommandBuilder()
        .setName("bomb")
        .setDescription("Bomb other people in discord")
        .addUserOption(Options =>
            Options
                .setName("person")
                .setDescription("Who do you want to bomb?")
                .setRequired(true)
        ),
    async execute(interaction) {
        const bomber = interaction.user.id;
        const phrase = getRandom(phrases) as NonNullable<typeof phrases[number]>;

        const person = interaction.options.getMember('person');

        if (!(person instanceof GuildMember))
            throw new Error("The person option must be a GuildMember");

        const replacedPhrase = phrase.replace(/\@bomber/g, `<@${bomber}>`).replace(/\@person/g, `<@${person.id}>`);

        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setAuthor({ name: "Bomb", iconURL: "https://cdn.discordapp.com/attachments/1097538516436660355/1146349112581705748/Bomb.png" })
                    .setDescription(replacedPhrase)
                    .setColor("Red")
            ]
        });
    }
}