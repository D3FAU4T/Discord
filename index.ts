import type { BunRequest } from "bun";
import { D3_discord } from "./src/Core/client.js";
import { searchGarticAnswer } from "./src/Core/functions.js";
import type { GuildTextBasedChannel } from "discord.js";

// HTML Imports
import stopotsHomepage from "./src/StopotS/StopotS.html";

export const client = new D3_discord();

const server = Bun.serve({
    port: 3000,
    routes: {
        "/stopots": stopotsHomepage,

        "/": () => new Response("Welcome to D3-discord API!"),

        "/garticfind": {
            POST: async (req: BunRequest<'/garticfind'>) => {
                const data: unknown = await req.json();
                if (typeof data !== "object" || data === null || !("query" in data) || typeof data.query !== "string") {
                    console.log(req.body);
                    return Response.json({
                        error: `It's json bro JSON`,
                        resolution: `JSON.stringify({ query: "S _ _ _ _" })`,
                        explanation: `"query" takes gartic hint as input only`,
                    });
                }

                return Response.json(searchGarticAnswer(data.query));
            }
        },

        "/getusername/:userid": async (req: BunRequest<"/getusername/:userid">) => {
            const { userid } = req.params;
            const { username } = await client.users.fetch(userid);
            return Response.json({ username });
        },

        "/getmessagedata/:channelid/:messageid": async (req: BunRequest<"/getmessagedata/:channelid/:messageid">) => {
            const { channelid, messageid } = req.params;

            const channel = await client.channels.fetch(channelid) as GuildTextBasedChannel;
            const message = await channel.messages.fetch(messageid);
            return Response.json(message.toJSON());
        }

    },

    fetch() {
        return new Response("Not Found", { status: 404 });
    },

    error(error) {
        console.error(error);
        return Response.json(error, { status: 404 });
    },
});

console.log(`API server listening on port ${server.port}`);

await client.start();