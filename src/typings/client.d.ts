import "discord.js";
import type { Bot } from "../core/client";

declare module "discord.js" {
    // Override the most commonly used interfaces to use our Bot type

    interface Message<InGuild extends boolean = boolean> {
        client: Bot;
    }

    interface BaseInteraction<Cached extends CacheType = CacheType> {
        client: Bot;
    }

    interface Guild {
        client: Bot;
    }

    interface User {
        client: Bot;
    }

    interface GuildMember {
        client: Bot;
    }

    // Add more as needed - but these cover 95% of use cases
}
