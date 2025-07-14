import Demantle from '../demantle/Demantle';
import { ErrorEmbed } from '../core/functions.js';
import {
    ActivityType, EmbedBuilder,
    SlashCommandBuilder, PresenceUpdateStatus,
    type ChatInputCommandInteraction, type CacheType,
} from 'discord.js';

import type { Command } from '../typings/core';
import type { Bot } from '../core/client';

const getGameOrError = (client: Bot, channelId: string) => {
    const demantle = client.demantles.get(channelId);
    if (!demantle)
        throw ErrorEmbed("D3mantle Error", "There is no game in progress in this channel.");

    return demantle;
};

const startNewGame = async (interaction: ChatInputCommandInteraction<CacheType>, gameType: 'Random' | 'Daily') => {
    if (interaction.client.demantles.has(interaction.channel!.id))
        throw ErrorEmbed("D3mantle Error", "A game is already in progress in this channel.");

    interaction.client.demantles.set(
        interaction.channel!.id,
        { game: new Demantle(gameType), ignoreIds: [], message: null }
    );

    // Update bot presence to show it's playing d3mantle
    interaction.client.user.setPresence({
        activities: [{
            name: 'd3mantle',
            state: gameType === 'Random' ? "Random Word" : "Daily Word",
            type: ActivityType.Playing,
        }],
        status: PresenceUpdateStatus.Online,
    });

    const title = gameType === 'Random' ? "D3mantle: Random Word" : "D3mantle: Daily Word";
    await interaction.editReply({
        embeds: [
            new EmbedBuilder()
                .setTitle(title)
                .setDescription("Game initiated, you can start guessing already!")
                .setColor("Gold")
        ]
    });
};

export default <Command>{
    data: new SlashCommandBuilder()
        .setName("d3mantle")
        .setDescription("Play a game of d3mantle which is a discord port of Semantle")
        .addSubcommand(subCommand =>
            subCommand
                .setName("random")
                .setDescription("Start a game with a random word")
        )
        .addSubcommand(subCommand =>
            subCommand
                .setName("daily")
                .setDescription("Start a game with the daily word")
        )
        .addSubcommand(subCommand =>
            subCommand
                .setName("giveup")
                .setDescription("Give up on the current game")
                .addBooleanOption(option =>
                    option
                        .setName("show_publicly")
                        .setDescription("Do you want to show the answer publicly?")
                        .setRequired(true)
                )
        )
        .addSubcommand(subCommand =>
            subCommand
                .setName("board")
                .setDescription("Show the game board again if it got buried by chat")
        ),
    async execute(interaction) {
        await interaction.deferReply();

        if (!interaction.channel)
            return await interaction.editReply({
                content: "This command can only be used in a text channel.",
            });

        if (!interaction.guild || interaction.channel.isDMBased())
            return await interaction.editReply({
                content: "This command is not designed to be used in DMs.",
            });

        if (interaction.channel.name !== 'd3mantle')
            throw ErrorEmbed(
                "Channel Restriction",
                "You can only run this command in the `d3mantle` channel due to spamming nature of the game. If the channel doesn't exist, please ask a server admin to create the channel and make sure the channel name is exactly `d3mantle`. You may optionally setup a role system to give access to the players to avoid notification spam for those who are not interested in playing."
            );

        const subCommand = interaction.options.getSubcommand(true) as 'random' | 'daily' | 'giveup' | 'board';

        if (subCommand === 'random')
            await startNewGame(interaction, 'Random');

        else if (subCommand === 'daily')
            await startNewGame(interaction, 'Daily');

        else if (subCommand === 'giveup') {
            const demantle = getGameOrError(interaction.client, interaction.channel.id);
            const isPublicForfeit = interaction.options.getBoolean("show_publicly", true);
            const word = demantle.game.word;

            if (isPublicForfeit) {
                interaction.client.demantles.delete(interaction.channel.id);

                // Clear bot presence if no games are active
                if (interaction.client.demantles.size === 0)
                    interaction.client.user.setPresence({
                        activities: [],
                        status: PresenceUpdateStatus.Idle,
                    });

                await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle("D3mantle: Give Up")
                            .setDescription(`No one guessed the word. It was: ${word}`)
                            .setColor("White")
                    ]
                });
            }

            else {
                demantle.ignoreIds.push(interaction.user.id);
                await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle("D3mantle: Give Up")
                            .setDescription(`You have given up the game, your guesses will be ignored onwards. The word was: ${word}`)
                            .setColor("White")
                    ]
                });
            }
        }

        else if (subCommand === 'board') {
            const demantle = getGameOrError(interaction.client, interaction.channel.id);

            if (!demantle.message)
                throw ErrorEmbed("D3mantle Error", "No game board exists yet. Make your first guess to generate the board!");

            await interaction.editReply({ content: "Sure, here's the board again" });

            const oldMsg = await demantle.message.delete();
            demantle.message = await interaction.channel.send(oldMsg.content);
        }
    },
}