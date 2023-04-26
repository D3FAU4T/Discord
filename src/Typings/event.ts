import { ClientEvents, VoiceState } from 'discord.js';
import { GuildQueue, GuildQueueEvents, PlayerTriggeredReason, Track } from 'discord-player';

export interface DiscordPlayerEvents<Meta = unknown> {
    audioTrackAdd: [queue: GuildQueue<Meta>, track: Track];
    audioTracksAdd: [queue: GuildQueue<Meta>, track: Track[]];
    audioTrackRemove: [queue: GuildQueue<Meta>, track: Track];
    audioTracksRemove: [queue: GuildQueue<Meta>, track: Track[]];
    connection: [queue: GuildQueue<Meta>];
    disconnect: [queue: GuildQueue<Meta>];
    debug: [queue: GuildQueue<Meta>, message: string];
    error: [queue: GuildQueue<Meta>, error: Error];
    emptyChannel: [queue: GuildQueue<Meta>];
    emptyQueue: [queue: GuildQueue<Meta>];
    playerStart: [queue: GuildQueue<Meta>, track: Track];
    playerError: [queue: GuildQueue<Meta>, error: Error, track: Track];
    playerFinish: [queue: GuildQueue<Meta>, track: Track];
    playerSkip: [queue: GuildQueue<Meta>, track: Track];
    playerTrigger: [queue: GuildQueue<Meta>, track: Track, reason: PlayerTriggeredReason];
    queueEnd: [queue: GuildQueue<Meta>];
    queueStart: [queue: GuildQueue<Meta>];
    voiceStateUpdate: [queue: GuildQueue<Meta>, oldState: VoiceState, newState: VoiceState];
}

export class Event<Key extends keyof ClientEvents> {
    constructor(
        public event: Key,
        public run: (...args: ClientEvents[Key]) => void
    ) {}
}

export class MusicEvent<Key extends keyof GuildQueueEvents> {
    constructor(
        public event: Key,
        public run: (...args: DiscordPlayerEvents[Key]) => void
    ) {}
}