import { Command } from '../../Core/command.js';
import { Demantle } from '../../Demantle/Demantle.js'
import { 
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelType,
    EmbedBuilder,
    PartialTextBasedChannelFields,
    PermissionsBitField,
    SlashCommandBuilder
} from 'discord.js';

export default new Command({
    name: "semantle_random",
    description: "Play a game of semantle with a random hidden word",
    emote: false,
    data: new SlashCommandBuilder()
    .setName("semantle_random")
    .setDescription("Play a game of semantle with a random hidden word"),
    run: async ({ interaction, client }) => {
        if (interaction === undefined) return;
        await interaction.deferReply();

        if (interaction.channel && interaction.guild) {

            let d3mantleRole = interaction.guild.roles.cache.find(role => role.name === 'D3mantle');

            if (!d3mantleRole) {
                d3mantleRole = await interaction.guild.roles.create({
                    name: 'D3mantle',
                    reason: 'There were no D3mantle role in this server. It is necessary for the game to work.'
                });
            }

            await interaction.guild.members.cache.get(interaction.member?.user.id!)?.roles.add(d3mantleRole);

            let channel = interaction.guild.channels.cache.find(channel => channel.name === 'd3mantle');

            if (!channel) {
                channel = await interaction.guild.channels.create({
                    name: 'd3mantle',
                    type: ChannelType.GuildText,
                    topic: `Play semantle here, hidden from everyone so the word don't get spoiled\n\nNote: This channel get's purged after inactivity, please chat in #general to save your conversation`,
                    permissionOverwrites: [
                        {
                            id: interaction.guild.id,
                            deny: PermissionsBitField.Flags.ViewChannel,
                        },
                        {
                            id: d3mantleRole.id,
                            allow: PermissionsBitField.Flags.ViewChannel | PermissionsBitField.Flags.SendMessages,
                        },
                    ],
                });
            }

            await (channel as PartialTextBasedChannelFields).send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("D3mantle game initiation: Random Word")
                        .setDescription("Game initiated, you can start guessing already!")
                        .setColor("Gold")
                ]
            });

            client.semantle[channel.id] = new Demantle(2);

            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("D3mantle: Random Word")
                        .setDescription(`New game initialized. Head over to <#${channel.id}> to play`)
                        .setColor("Blue")
                ],
                components: [
                    new ActionRowBuilder<ButtonBuilder>().addComponents(
                        new ButtonBuilder()
                            .setLabel("Let's go")
                            .setStyle(ButtonStyle.Link)
                            .setURL(channel.url)
                    )
                ]
            });

        }
    },
});