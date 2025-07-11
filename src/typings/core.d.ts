import {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    type SlashCommandOptionsOnlyBuilder,
    type SlashCommandSubcommandsOnlyBuilder,
} from 'discord.js';

export interface Command {
	data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder | SlashCommandSubcommandsOnlyBuilder;
	execute(interaction: ChatInputCommandInteraction): Promise<void>;
}
