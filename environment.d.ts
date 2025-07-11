declare global {
    namespace NodeJS {
        interface ProcessEnv {
            discordToken: string;
            mongodbURI: string;
        }
    }
}

export {};