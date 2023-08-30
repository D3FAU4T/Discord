// PACKAGES
import { ColorResolvable, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { setTimeout as wait } from 'node:timers/promises';
import { Command } from '../../Core/command.js';

interface paragraphs {
  stories: {
    messages: string[];
  }[];
}

// PHRASES
const Paragraph: paragraphs = {
  stories: [
    {
      messages: [
        "@attacker was going through the desert to conquer the palace of @defender",
        "@defender found out and readied their troops. Soon, a war broke out",
        "Both the kings/players fought hard for the palace but the victory goes to @winner"
      ]
    }, {
      messages: [
        "@attacker tried to invade @defender's home",
        "Unfortunately, it turns out that @defender has a shotgun ready to defend LOL",
        "*Gunshots* , and the survivor is @winner"
      ]
    }, {
      messages: [
        "@attacker went to kill...",
        "@attacker fired bullets towards @defender",
        "And now @attacker is in hell. How? Ask Gianaa_"
      ]
    }, {
      messages: [
        "@attacker tried to..",
        "Wait I forgot what I was thinking 0_0",
        "Umm, let's say @winner is the winner. How embarrasing -.-"
      ]
    }, {
      messages: [
        "<Pre-coded message here>",
        "<Pre-coded response here>",
        "<Pre-coded winner here>",
        "Just kidding :p @winner is the winner"
      ]
    }, {
      messages: [
        "@attacker is sneaking up on @defender",
        "@defender is ready with a cheap ass grenade",
        "The grenade was faulty and killed both of them"
      ]
    }, {
      messages: [
        "@attacker challenges @defender to a duel!",
        "@defender is too scared to fight",
        "@attacker beheades @defender. No mercy for the weak!!"
      ]
    }, {
      messages: [
        "@attacker challenges @defender to a duel!",
        "@defender is nowhere to be seen",
        "*Sneak Attack* @defender stabs @attacker in the back and wins!!"
      ]
    }
  ]
}

export default new Command({
  name: 'duel',
  description: 'Duel with a person in discord',
  emote: false,
  guildId: ["1005194560303013920"],
  data: new SlashCommandBuilder()
    .setName("duel")
    .setDescription("Duel with a person in discord")
    .addUserOption(option =>
      option
        .setName("person")
        .setDescription("The person you want to duel with")
        .setRequired(true)
    ),
  run: async ({ interaction, client }) => {
    if (interaction === undefined) return;

    try {
      const story = client.functions.getRandom(Paragraph.stories).messages;
      const players = [`<@${interaction.user.id}>`, `<@${interaction.options.getUser("person", true).id}>`];
      const winner = client.functions.getRandom(players);
      const timeouts = [3000, 6000, 9000];
      const colors: ColorResolvable[] = ["Red", "Yellow", "Green", "Purple"];
      for (let i = 0; i < story.length; i++) {
        const desc = story[i].replace(/@attacker/g, `<@${interaction.user.id}>`).replace(/@defender/g, `<@${interaction.options.getUser("person", true).id}>`).replace(/@winner/g, winner);
        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setAuthor({ name: "Duel", iconURL: "https://cdn.discordapp.com/attachments/1097538516436660355/1146369722896621629/Angry.png" })
              .setDescription(desc)
              .setColor(colors[i])
          ]
        });
        if (timeouts[i]) await wait(timeouts[i]);
      }
    } catch (error) {
      const err = error as Error;
      await interaction.reply({
        embeds: [client.functions.makeErrorEmbed(err)]
      });
    }
  }
});