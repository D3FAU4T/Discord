import path from "node:path";
import { pathToFileURL } from "node:url";
import { readFile, readdir, access } from 'node:fs/promises';
import { MongoClient, ServerApiVersion } from 'mongodb';

// Discord Player
import { Player, type GuildQueueEvents } from "discord-player";
import { SpotifyExtractor } from "discord-player-spotify";
import { YouTubeExtractor } from "discord-player-youtube";

import type { Command } from "../typings/core";
import type { demantleManager } from "../typings/demantle";

import {
    Client, Collection, Events,
    GatewayIntentBits, Partials,
    PresenceUpdateStatus,
    type ClientEvents,
    type RESTPostAPIChatInputApplicationCommandsJSONBody
} from "discord.js";

export class Event<Key extends keyof ClientEvents> {
    constructor(
        public readonly name: Key,
        public readonly listener: (...args: ClientEvents[Key]) => Promise<void>
    ) { }
}

export class MusicEvent<Key extends keyof GuildQueueEvents> {
    constructor(
        public readonly name: Key,
        public readonly listener: GuildQueueEvents[Key]
    ) { }
}

export class Bot extends Client<true> {
    public musicPlayer: Player;
    public emotes: Record<string, string> = {};
    public commands: Collection<string, Command> = new Collection();
    public demantles: Collection<string, demantleManager> = new Collection();

    public get db() {
        return this.mongoClient?.db('Discord');
    }

    private mongoClient: MongoClient | null = null;
    

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

        this.musicPlayer = new Player(this, {});
        this.handleShutdown();
    }

    public async start(): Promise<void> {
        try {
            this.mongoClient = new MongoClient(process.env.mongodbURI, {
                tls: true,
                tlsInsecure: false,
                serverApi: {
                    version: ServerApiVersion.v1,
                    strict: true,
                    deprecationErrors: true
                },
            });

            await this.mongoClient?.connect();
        }

        catch (e) {
            console.error('❌ Failed to connect to MongoDB:', e);
        }

        await this.musicPlayer.extractors.register(SpotifyExtractor, undefined);
        await this.musicPlayer.extractors.register(YouTubeExtractor, undefined);

        await this.registerFiles();
        await this.login(process.env.discordToken);
    }

    private handleShutdown(): void {
        const shutdown = async () => {
            await this.mongoClient?.close();
            await this.destroy();
            process.exit(0);
        }

        process.on('SIGINT', shutdown);
        process.on('SIGTERM', shutdown);
    }

    public async import<T>(filePath: string): Promise<T> {
        const fileUrl = pathToFileURL(filePath).href;
        const module = await import(fileUrl);
        return module.default as T;
    }

    private async registerFiles(): Promise<void> {
        // Load emotes
        const emotesPath = path.resolve('src', 'config', 'emotes.json');

        try {
            await access(emotesPath);
            const emotesContent = await readFile(emotesPath, 'utf-8');
            this.emotes = JSON.parse(emotesContent);
        }

        catch {
            console.warn(`Emotes file not found at ${emotesPath}. Skipping emotes loading.`);
        }

        const accessContent = await readFile(path.resolve('src', 'config', 'commands.json'), 'utf-8');
        const accessData: Record<string, string[]> = JSON.parse(accessContent);

        // Scan for command and event files
        const scanDirectory = async (directory: string): Promise<string[]> => {
            const files = await readdir(directory, { recursive: true });
            const tsFiles = files
                .filter((file): file is string => typeof file === 'string' && file.endsWith('.ts'))
                .filter(file => !file.includes('.disabled.'));
            return tsFiles;
        };

        // Register commands and events concurrently
        const [commandFiles, eventFiles, musicFiles] = await Promise.all([
            scanDirectory(path.resolve('src', 'commands')),
            scanDirectory(path.resolve('src', 'events')),
            scanDirectory(path.resolve('src', 'music'))
        ]);

        const commandPromises = commandFiles.map(async file => {
            const command = await this.import<Command>(path.resolve('src', 'commands', file));
            this.commands.set(command.data.name, command);
            return command.data.toJSON();
        });

        const commandResults = (await Promise.allSettled(commandPromises))
            .filter((result): result is PromiseFulfilledResult<RESTPostAPIChatInputApplicationCommandsJSONBody> => {
                if (result.status === 'rejected') {
                    console.error('❌ Command failed to load:', result.reason);
                    return false;
                }

                else return true;
            })
            .map(result => result.value);

        const globalCommands = commandResults.filter(command => !(command.name in accessData));
        const guildCommands = commandResults.filter(command => command.name in accessData);

        this.once(Events.ClientReady, async (client) => {
            await client.application.commands.set(globalCommands);

            // Group guild commands by guild ID for batch setting
            const guildCommandMap = new Map<string, typeof guildCommands>();

            for (const guildCommand of guildCommands) {
                const guildIds = accessData[guildCommand.name];
                if (!guildIds) continue;

                for (const guildId of guildIds) {
                    if (!guildCommandMap.has(guildId))
                        guildCommandMap.set(guildId, []);

                    guildCommandMap.get(guildId)!.push(guildCommand);
                }
            }

            // Set commands for each guild in batch
            for (const [guildId, commands] of guildCommandMap) {
                const guild = client.guilds.cache.get(guildId);
                if (!guild) {
                    console.warn(`⚠️ Guild not found: ${guildId}`);
                    continue;
                }

                await guild.commands.set(commands);
            }

            console.log(`Logged in as ${client.user.tag}`);
        });

        const eventPromises = eventFiles.map(async file => {
            const event = await this.import<Event<keyof ClientEvents>>(
                path.resolve('src', 'events', file)
            );

            this.on(event.name, event.listener);
        });

        await Promise.allSettled(eventPromises);

        const musicPromises = musicFiles.map(async file => {
            const musicEvent = await this.import<MusicEvent<keyof GuildQueueEvents>>(
                path.resolve('src', 'music', file)
            );

            this.musicPlayer.events.on(musicEvent.name, musicEvent.listener);
        });

        await Promise.allSettled(musicPromises);
    }
}