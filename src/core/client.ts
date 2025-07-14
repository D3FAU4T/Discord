import path from "node:path";
import { pathToFileURL } from "node:url";
import { readFile, readdir, access } from 'node:fs/promises';
import { MongoClient, ServerApiVersion } from 'mongodb';
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
        console.log(`🔄 Importing file: ${filePath}`);
        const fileUrl = pathToFileURL(filePath).href;
        console.log(`🔗 File URL: ${fileUrl}`);

        const module = await import(fileUrl);
        console.log(`✅ Module imported successfully`);
        return module.default as T;
    }

    private async registerFiles(): Promise<void> {
        // Load emotes
        const emotesPath = path.resolve('src', 'config', 'emotes.json');

        try {
            await access(emotesPath);
            const emotesContent = await readFile(emotesPath, 'utf-8');
            this.emotes = JSON.parse(emotesContent);
        } catch {
            console.warn(`Emotes file not found at ${emotesPath}. Skipping emotes loading.`);
        }

        const accessContent = await readFile(path.resolve('src', 'config', 'commands.json'), 'utf-8');
        const accessData: Record<string, string[]> = JSON.parse(accessContent);

        // Scan for command and event files
        const scanDirectory = async (directory: string): Promise<string[]> => {
            console.log(`📁 Scanning directory: ${directory}`);
            const files = await readdir(directory, { recursive: true });
            const tsFiles = files
                .filter((file): file is string => typeof file === 'string' && file.endsWith('.ts'))
                .filter(file => !file.includes('.disabled.'));
            console.log(`🔍 Found ${tsFiles.length} files:`, tsFiles);
            return tsFiles;
        };

        // Register commands and events concurrently
        const [commandFiles, eventFiles] = await Promise.all([
            scanDirectory(path.resolve('src', 'commands')),
            scanDirectory(path.resolve('src', 'events'))
        ]);

        // Add debugging for file discovery
        console.log('📁 Command files found:', commandFiles);
        console.log('📁 Event files found:', eventFiles);

        const commandPromises = commandFiles.map(async file => {
            console.log(`🔄 Processing command file: ${file}`);
            const command = await this.import<Command>(path.resolve('src', 'commands', file));
            console.log(`✅ Loaded command: ${command.data.name}`);
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

        console.log(`📊 Total commands loaded: ${commandResults.length}`);
        console.log('📊 Command names:', commandResults.map(cmd => cmd.name));

        const globalCommands = commandResults.filter(command => !(command.name in accessData));
        const guildCommands = commandResults.filter(command => command.name in accessData);

        console.log(`🌐 Global commands: ${globalCommands.length}`, globalCommands.map(cmd => cmd.name));
        console.log(`🏰 Guild commands: ${guildCommands.length}`, guildCommands.map(cmd => cmd.name));

        this.once(Events.ClientReady, async (client) => {
            console.log('🚀 Setting global commands...');
            await client.application.commands.set(globalCommands);
            console.log('✅ Global commands set');

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
                if (!guild) {
                    console.warn(`⚠️ Guild not found: ${guildId}`);
                    continue;
                }

                console.log(`🏰 Setting ${commands.length} commands for guild: ${guild.name}`);
                await guild.commands.set(commands);
                console.log(`✅ Commands set for guild: ${guild.name}`);
            }

            console.log(`Logged in as ${client.user.tag}`);
        });

        const eventPromises = eventFiles.map(async file => {
            console.log(`🔄 Processing event file: ${file}`);
            const event = await this.import<Event<keyof ClientEvents>>(
                path.resolve('src', 'events', file)
            );
            console.log(`✅ Loaded event: ${event.name}`);
            this.on(event.name, event.execute);
        });

        await Promise.allSettled(eventPromises);
    }
}