declare global {
    namespace NodeJS {
        interface ProcessEnv {
            DP_SPOTIFY_CLIENT_ID: string;
            DP_SPOTIFY_CLIENT_SECRET: string;
            discordToken: string;
            mongodbURI: string;
        }
    }
}

export {};