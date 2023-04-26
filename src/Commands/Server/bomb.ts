import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { Command } from '../../Core/command.js';

// OUR PHRASES
// @bomber = interaction.user.username
// @person = interaction.options.get('person').value

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

export default new Command({
  name: 'bomb',
  description: "Bomb other people in discord",
  emote: false,
  guildId: ["1005194560303013920"],
  data: new SlashCommandBuilder()
    .setName("bomb")
    .setDescription("Bomb other people in discord")
    .addUserOption(Options =>
      Options
        .setName("person")
        .setDescription("Who do you want to bomb?")
        .setRequired(true)
    ),
  run: async ({ interaction, client }) => {
    if (interaction === undefined) return;
    const bomber = interaction.user.username.toLowerCase();
    const phrase = client.functions.getRandom(phrases);    
    const person = (await client.users.fetch(interaction.options.get('person', true).value as string)).username;
    const replacedPhrase = phrase.replace(/\@bomber/g, bomber).replace(/\@person/g, person);

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
        .setTitle("Bomb")
        .setDescription(replacedPhrase)
        .setColor("Red")
      ]
    })
  }
});