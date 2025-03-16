import type { BunRequest } from "bun";
import { D3_discord } from "./src/Core/client.js";
import { Demantle } from "./src/Demantle/Demantle.js";
// import { socketMessageClient } from "./src/Typings/socket.js";
import { handleSocketReply, searchGarticAnswer } from "./src/Core/functions.js";
import type { GuildTextBasedChannel } from "discord.js";

// HTML Imports
import demantleHomepage from "./src/Demantle/index.html";
import stopotsHomepage from "./src/StopotS/StopotS.html";

let WebsiteClass: Record<string, Demantle[]> = {};

export const client = new D3_discord();

const server = Bun.serve({
    port: 3000,
    routes: {
        "/d3mantle": demantleHomepage,
        "/stopots": stopotsHomepage,

        "/": () => {
            const data = Object.keys(WebsiteClass);
            return new Response(`Connected Clients: ${data.length}\nList of Clients:\n${data.join('\n')}`);
        },

        "/garticfind": {
            POST: async (req) => {
                try {
                    const data: any = await req.json();
                    return Response.json(searchGarticAnswer(data.query));
                }
                
                catch (err) {
                    console.log(req.body);
                    return Response.json({
                        error: `It's json bro JSON`,
                        resolution: `JSON.stringify({ query: "S _ _ _ _" })`,
                        explanation: `"query" takes gartic hint as input only`,
                    });
                }
            }
        },

        "/getusername/:userid": async (req: BunRequest<"/getusername/:userid">) => {
            const { userid } = req.params;
            const { username } = await client.users.fetch(userid);
            return Response.json({ username });
        },

        "/getmessagedata/:channelid/:messageid": async (req: BunRequest<"/getmessagedata/:channelid/:messageid">) => {
            const { channelid, messageid } = req.params;

            try {
                const channel = await client.channels.fetch(channelid) as GuildTextBasedChannel;
                const message = await channel.messages.fetch(messageid);
                return Response.json(message.toJSON());
            }
            
            catch (error) {
                const err = error as Error;
                return Response.json({
                    error: "An error ocurred",
                    errorName: err.name,
                    errorMessage: err.message,
                });
            }
        }

    },

    fetch(req) {
        const url = new URL(req.url);
        const pathname = url.pathname;
        return new Response("Not Found", { status: 404 });
    },

    error(error) {
        console.error(error);
        return Response.json(error, { status: 404 });
    },
});

console.log(`API server listening on port ${server.port}`);

await client.start();

// const d3socket = new WebSocket.Server({ server: botServer });

// d3socket.on("connection", (ws) => {
//     ws.send(
//         `{ "Server": [ "D3_connect", { "message": "Initiate connection" } ] }`,
//     );

//     ws.on("message", async (res) => {
//         if (res.toString() === "2") return ws.send("3");
//         let message = JSON.parse(res.toString()) as socketMessageClient;

//         if (message.Client[0] === "D3_connect") {
//             if (
//                 message.Client[1].message ===
//                 "Requesting to initiate connection"
//             ) {
//                 const gameId = message.Client[1].gameId;
//                 WebsiteClass[gameId] = [
//                     new Demantle(2),
//                     new Demantle(1),
//                     new Demantle(2),
//                 ];
//                 ws.send(
//                     `{ "Server": ["D3_connect", { "message": "Connection Established at ${gameId}" }] }`,
//                 );
//             }
//         } else if (message.Client[0] === "D3_guess") {
//             const gameType = message.Client[1].gameType;
//             const gameId = message.Client[1].gameId;
//             const guess = message.Client[1].guess;
//             const guesser = message.Client[1].guesser;
//             const index =
//                 gameType === "Random" ? 0 : gameType === "Today" ? 1 : 2;

//             const res = await WebsiteClass[gameId][index].guess(
//                 guess.toLowerCase(),
//                 guesser,
//             );
//             if (res === undefined) return;

//             if (index === 2) {
//                 d3socket.clients.forEach((client) =>
//                     handleSocketReply(res, client, gameType),
//                 );
//             } else handleSocketReply(res, ws, gameType);
//         } else if (message.Client[0] === "D3_giveup") {
//             const gameType = message.Client[1].gameType;
//             const index =
//                 gameType === "Random" ? 0 : gameType === "Today" ? 1 : 2;
//             const gameId = message.Client[1].gameId;
//             const res = WebsiteClass[gameId][index].GiveUp();
//             ws.send(`{ "Server": [ "D3_giveup", { "word": "${res}" } ] }`);
//         } else if (message.Client[0] === "D3_requestData") {
//             const gameType = message.Client[1].gameType;
//             const gameId = message.Client[1].gameId;
//             const index =
//                 gameType === "Random" ? 0 : gameType === "Today" ? 1 : 2;
//             const res = WebsiteClass[gameId][index].getMetadata();
//             ws.send(
//                 `{ "Server": [ "D3_requestData", { "guessArr": ${JSON.stringify(res.guesses)} , "indexes": ${JSON.stringify(res.indexes)} , "gameType": "${gameType}" } ] }`,
//             );
//         } else if (message.Client[0] === "D3_disconnect") {
//             let gameId = message.Client[1].gameId;
//             delete WebsiteClass[gameId];
//         }
//     });
// });
