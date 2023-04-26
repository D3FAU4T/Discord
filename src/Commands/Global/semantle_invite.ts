import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { Command } from '../../Core/command.js';

export default new Command({
    name: 'semantle_invite',
    description: "Invite any people to the semantle channel",
    emote: false,
    data: new SlashCommandBuilder()
    .setName("semantle_invite")
    .setDescription("Invite any people to the semantle channel")
    .addUserOption(Option =>
        Option
        .setName("invitee")
        .setDescription("Select an user to invite")
        .setRequired(true)
    ),
    run: async ({ interaction, client }) => {

        if (interaction === undefined) return;

        try {

            await interaction.deferReply();

            const person = (await client.users.fetch(interaction.options.get('invitee', true).value as string)).id

            let d3mantleRole = interaction.guild?.roles.cache.find(role => role.name === 'D3mantle');

            if (!d3mantleRole) {
                d3mantleRole = await interaction.guild?.roles.create({
                    name: 'D3mantle',
                    reason: "There were no D3mantle role in this server. It is necessary for the game to work."
                })
            }

            await interaction.guild?.members.cache.get(person)?.roles.add(d3mantleRole!);

            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Semantle Invite")
                        .setDescription(`Added <@${person}> to the Semantle channel`)
                        .setColor("Green")
                ]
            });
        } catch (err: Error | any) {
            console.error("Error generated, check logs")
            console.log(err)
        }
    },
});