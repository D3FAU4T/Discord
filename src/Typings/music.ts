import { ChatInputCommandInteraction } from 'discord.js'
import { D3_discord } from '../Core/client';

export const enum icons {
    appleMusic = 'https://cdn.discordapp.com/attachments/1097538516436660355/1097540240429826058/Apple_Music.png',
    spotify = 'https://cdn.discordapp.com/attachments/1097538516436660355/1097541506891530280/Spotify.png',
    youtube = 'https://www.youtube.com/s/desktop/a2197efa/img/favicon_144x144.png',
    soundCloud = 'https://cdn.discordapp.com/attachments/1097538516436660355/1097542754952810506/Sound_Cloud.png',
    simulatorRadio = 'https://cdn.discordapp.com/attachments/1097538516436660355/1097568783318663218/Simulator_Radio.png'
};

export interface MusicMetadata {
    interaction: ChatInputCommandInteraction,
    isRadio: boolean,
    client: D3_discord
}

export interface SimulatorRadioCombined {
    now_playing: {
        responder: "cache";
        title: string;
        artists: string;
        art: string;
        timestamp: number;
    },
    listeners: number,
    djs: {
        now: {
            tag: string;
            displayname: string;
            avatar: string,
            slotstamp: number;
            details: string
        },
        next: {
            tag: string,
            displayname: string,
            avatar: string,
            slotstamp: number,
            details: string
        },
        later: {
            tag: string,
            displayname: string,
            avatar: string,
            slotstamp: number,
            details: string
        }
    }
}