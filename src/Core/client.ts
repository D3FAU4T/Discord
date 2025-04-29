import { Player, type GuildQueueEvents } from 'discord-player';
import { DefaultExtractors } from '@discord-player/extractor';
import { Event, MusicEvent } from '../Typings/event.js';
import { Demantle } from '../Demantle/Demantle.js';
import { Musical } from './Musical.js';
import type { commandsInterface } from '../Typings/commands.js';
import { type SimulatorRadioCombined, icons } from '../Typings/music.js';
import {
    type ApplicationCommandDataResolvable,
    Client,
    type ClientEvents,
    Collection,
    EmbedBuilder,
    Events,
    GatewayIntentBits,
    Partials,
    type VoiceBasedChannel
} from "discord.js";

export class D3_discord extends Client {

    public commands: Collection<string, commandsInterface> = new Collection();
    public emotes: Collection<string, commandsInterface> = new Collection();
    public musical = new Musical('1142691243609038959');
    public semantle: Record<string, Demantle> = {}
    public DiscordPlayer = new Player(this);
    public RadioChannels: VoiceBasedChannel[] = [];
    public tempEmotes: Record<string, string> = {};

    public RadioData: SimulatorRadioCombined = {
        now_playing: {
            title: ''
        }
    } as SimulatorRadioCombined;


    constructor() {
        super({
            intents: [
                GatewayIntentBits.DirectMessages,
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.GuildVoiceStates,
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.GuildMessageReactions
            ],
            partials: [
                Partials.Channel,
                Partials.GuildMember,
                Partials.Message,
                Partials.Reaction,
                Partials.User
            ]
        });
    }

    public async start(): Promise<void> {
        await this.registerFiles();
        await this.DiscordPlayer.extractors.loadMulti(DefaultExtractors);
        setInterval(async () => await this.getRadioData(), 10000)
        await this.login(process.env.discordToken);
    }

    public async importFile(filePath: string): Promise<unknown> {
        return (await import(filePath)).default;
    }

    private registerSlashCommands(command: ApplicationCommandDataResolvable[], guildId?: string): void {
        if (guildId) {
            const guild = this.guilds.cache.get(guildId);

            if (!guild) {
                console.error(`Guild not found: ${guildId}`);
                return;
            }

            guild.commands.set(command);
        }

        else this.application?.commands.set(command);
    }

    private async registerFiles(): Promise<void> {
        const serverCommands: { [guildId: string]: ApplicationCommandDataResolvable[] } = {};
        const globalCommands: ApplicationCommandDataResolvable[] = [];

        // Commands
        const globTSJS = new Bun.Glob('*{.ts,.js}');

        for await (const file of globTSJS.scan(`${__dirname}/../Commands/Global/`)) {
            const command = await this.importFile(`${__dirname}/../Commands/Global/${file}`) as commandsInterface;
            if (command.emote || !command.data) continue;
            this.commands.set(command.name, command);
            globalCommands.push(command.data.toJSON());
        }

        for await (const file of globTSJS.scan(`${__dirname}/../Commands/Server/`)) {
            const command = await this.importFile(`${__dirname}/../Commands/Server/${file}`) as commandsInterface;
            if (command.emote || !command.data || !command.guildId) continue;
            this.commands.set(command.name, command);

            for (const guildId of command.guildId) {
                if (!serverCommands[guildId]) serverCommands[guildId] = [];
                serverCommands[guildId].push(command.data.toJSON());
            }
        }

        // Register commands
        this.on(Events.ClientReady, () => {
            for (const guildId of Object.keys(serverCommands)) {
                if (!serverCommands[guildId]) continue;
                this.registerSlashCommands(serverCommands[guildId], guildId)
            }

            this.registerSlashCommands(globalCommands);
        });

        // Events
        for await (const file of globTSJS.scan(`${__dirname}/../Events/`)) {
            const dcEvents = await this.importFile(`${__dirname}/../Events/${file}`) as Event<keyof ClientEvents>;
            this.on(dcEvents.event, dcEvents.run);
        }

        // Emotes
        for await (const file of globTSJS.scan(`${__dirname}/../Emotes/`)) {
            const emote = await this.importFile(`${__dirname}/../Emotes/${file}`) as commandsInterface;
            if (!emote.emote) continue;
            this.emotes.set(emote.name, emote);
        }

        // Discord Player events
        for await (const file of globTSJS.scan(`${__dirname}/../Music/`)) {
            const event = await this.importFile(`${__dirname}/../Music/${file}`) as MusicEvent<keyof GuildQueueEvents>;
            this.DiscordPlayer.events.on(event.event, event.run);
        }
    }

    private async getRadioData(): Promise<void> {
        try {
            const response = await fetch('https://apiv2.simulatorradio.com/metadata/combined');
            if (!response.ok) {
                console.error(`Failed to fetch radio data: ${response.statusText}`);
                return;
            }
            // Explicitly cast the response.json() result to SimulatorRadioCombined
            const data = (await response.json()) as SimulatorRadioCombined;
            if (data.now_playing.title !== this.RadioData.now_playing.title) {
                this.RadioData = data;
                if (this.RadioChannels.length === 0) return;
                this.RadioChannels.forEach(channel => {
                    channel.send({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle("24/7 Radio mode")
                                .setDescription(`Now playing: ${data.now_playing.title}\nArtist: ${data.now_playing.artists}`)
                                .setColor("#ff2a00")
                                .setAuthor({ name: `Simulator Radio`, iconURL: icons.simulatorRadio, url: "https://simulatorradio.com" })
                                .setFooter({ text: "Embed auto created by d3fau4tbot" })
                                .setTimestamp()
                                .setURL("https://simulatorradio.com")
                                .addFields(
                                    { name: "Current DJ", value: `${data.djs.now.displayname}`, inline: true },
                                    { name: "Airing at", value: `<t:${data.djs.now.slotstamp}:f>`, inline: true },
                                    { name: "Next DJ", value: `${data.djs.next.displayname}`, inline: true },
                                    { name: "Airing at", value: `<t:${data.djs.next.slotstamp}:f>`, inline: true },
                                    { name: "DJ Later", value: `${data.djs.later.displayname}`, inline: true },
                                    { name: "Airing at", value: `<t:${data.djs.later.slotstamp}:f>`, inline: true },
                                )
                                .setImage(data.now_playing.art)
                                .setThumbnail(`https://simulatorradio.com/processor/avatar?size=64&name=${data.djs.now.avatar}`)
                        ]
                    });
                });
            }
        } catch (err) {
            console.error(err);
        }
    }

    public async getUsernameAndDisplayname(userList: `<@${number}>`[]) {
        let data: { displayName: string, username: string }[] = [];
        for (const user of userList) {
            const id = user.replace('<@', '').replace('>', '');
            const person = await this.users.fetch(id);
            data.push({
                displayName: person.displayName,
                username: person.username
            });
        }
        return data;
    }
}