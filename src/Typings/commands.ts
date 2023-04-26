import { CacheType, ChatInputCommandInteraction, Message, SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from 'discord.js';
import { D3_discord } from '../Core/client.js';

type RunOptions = {
    client: D3_discord;
    interaction?: ChatInputCommandInteraction<CacheType>;
    message?: Message<boolean>;
}

export interface commandsInterface {
    name: string;
    description: string;
    emote: boolean;
    data?: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
    guildId?: string[];
    run: (options: RunOptions) => void;
}