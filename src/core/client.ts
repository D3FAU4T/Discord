import path from "node:path";
import { pathToFileURL } from "node:url";
import { MongoClient, ServerApiVersion } from 'mongodb';
import { readJsonFile, fileExists, scanFiles } from "./runtime";
import type { Command } from "../typings/core";
import type { demantleManager } from "../typings/demantle";

import {
    Client, Collection, Events,
    GatewayIntentBits, Partials,
    PresenceUpdateStatus,
    type ClientEvents
} from "discord.js";

export class Event<Key extends keyof ClientEvents> {
    constructor(
        public name: Key,
        public execute: (...args: ClientEvents[Key]) => Promise<void>
    ) { }
}

export class Bot extends Client<true> {
    public emotes: Record<string, string> = {};
    public commands: Collection<string, Command> = new Collection();
    public demantles: Collection<string, demantleManager> = new Collection();

    public get db() {
        return this.mongoClient.db('Discord');
    }

    private mongoClient: MongoClient;

    constructor() {
        super({
            intents: [
                GatewayIntentBits.DirectMessages,
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.GuildVoiceStates,
                GatewayIntentBits.MessageContent,
            ],
            partials: [
                Partials.Channel,
                Partials.Message,
                Partials.GuildMember,
                Partials.User,
            ],
            presence: {
                status: PresenceUpdateStatus.Idle
            }
        });

        this.mongoClient = new MongoClient(process.env.mongodbURI!, {
            serverApi: {
                version: ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true
            },
        });

        this.handleShutdown();
    }

    public async start(): Promise<void> {
        await this.mongoClient.connect();
        await this.registerFiles();
        await this.login(process.env.discordToken!);
    }

    private handleShutdown(): void {
        const shutdown = async () => {
            await this.mongoClient.close();
            await this.destroy();
            process.exit(0);
        }

        process.on('SIGINT', shutdown);
        process.on('SIGTERM', shutdown);
    }

    public async import<T>(filePath: string): Promise<T> {
        // Convert absolute path to file:// URL for ESM compatibility on Windows
        const fileUrl = pathToFileURL(filePath).href;
        return (await import(fileUrl)).default as T;
    }

    private async registerFiles(): Promise<void> {

        // Load emotes
        const emotesPath = path.resolve('src', 'config', 'emotes.json');

        if (await fileExists(emotesPath))
            this.emotes = await readJsonFile(emotesPath);

        else console.warn(`Emotes file not found at ${emotesPath}. Skipping emotes loading.`);

        const accessData: Record<string, string[]> = await readJsonFile(path.resolve('src', 'config', 'commands.json'));

        // Register commands and events concurrently
        const [commandFiles, eventFiles] = await Promise.all([
            scanFiles(path.resolve('src', 'commands')),
            scanFiles(path.resolve('src', 'events'))
        ]);

        const commandPromises = commandFiles.map(async file => {
            const command = await this.import<Command>(path.resolve('src', 'commands', file));
            this.commands.set(command.data.name, command);
            return command.data.toJSON();
        });

        const commandResults = (await Promise.allSettled(commandPromises))
            .filter(result => result.status === 'fulfilled')
            .map(result => result.value);

        const globalCommands = commandResults.filter(command => !(command.name in accessData));
        const guildCommands = commandResults.filter(command => command.name in accessData)

        this.once(Events.ClientReady, async (client) => {
            client.application.commands.set(globalCommands);

            // Group guild commands by guild ID for batch setting
            const guildCommandMap = new Map<string, typeof guildCommands>();

            for (const guildCommand of guildCommands) {
                const guildIds = accessData[guildCommand.name];
                if (!guildIds) continue;

                for (const guildId of guildIds) {
                    if (!guildCommandMap.has(guildId)) {
                        guildCommandMap.set(guildId, []);
                    }
                    
                    guildCommandMap.get(guildId)!.push(guildCommand);
                }
            }

            // Set commands for each guild in batch
            for (const [guildId, commands] of guildCommandMap) {
                const guild = client.guilds.cache.get(guildId);
                if (!guild) continue;

                await guild.commands.set(commands);
            }

            console.log(`Logged in as ${client.user.tag}`);
        });

        const eventPromises = eventFiles.map(async file => {
            const event = await this.import<Event<keyof ClientEvents>>(
                path.resolve('src', 'events', file)
            );
            this.on(event.name, event.execute);
        });

        await Promise.allSettled(eventPromises);
    }
}