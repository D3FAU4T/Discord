import { D3_discord } from '../Core/client.js';
import {
    type CacheType,
    ChatInputCommandInteraction,
    Message,
    MessageContextMenuCommandInteraction,
    SlashCommandBuilder,
    type SlashCommandOptionsOnlyBuilder,
    type SlashCommandSubcommandsOnlyBuilder,
    UserContextMenuCommandInteraction
} from 'discord.js';

type RunOptions = {
    client: D3_discord;
    interaction: ChatInputCommandInteraction<CacheType> | UserContextMenuCommandInteraction<CacheType> | MessageContextMenuCommandInteraction<CacheType>;
    message?: Message<boolean>;
}

export interface commandsInterface {
    name: string;
    description: string;
    emote: boolean;
    data?: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder | SlashCommandSubcommandsOnlyBuilder;
    guildId?: string[];
    run: (options: RunOptions) => void;
}