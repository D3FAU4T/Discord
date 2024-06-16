import express from "express";
import WebSocket from "ws";
import cors from "cors";
import { D3_discord } from "./src/Core/client.js";
import { Demantle } from "./src/Demantle/Demantle.js";
import { socketMessageClient } from "./src/Typings/socket.js";
import { handleSocketReply, searchGarticAnswer } from "./src/Core/functions.js";
import { GuildTextBasedChannel } from "discord.js";

console.log("Rebooted");

let WebsiteClass: Record<string, Demantle[]> = {};

export const client = new D3_discord();
client.start();

const app = express();
app.use(cors());
app.use(express.text());
app.use(express.static("./Bhotianaa"));
// Disabled for Hierarchy issue

const port = 3000;
const botServer = app.listen(port, () =>
    console.log(`API server listening on port ${port}`),
);

app.get("/", (_req, res) => {
    let data = Object.keys(WebsiteClass);
    res.send(
        `Connected Clients: ${data.length}\nList of Clients:\n${data.join("\n")}`,
    );
});

app.get("/d3mantle", (req, res) => {
    res.sendFile("index.html", { root: "./src/Demantle/" });
});

app.get("/d3mantle/style.css", (req, res) => {
    res.sendFile("style.css", { root: "./src/Demantle/" });
});

app.get("/d3mantle/script.js", (req, res) => {
    res.sendFile("script.js", { root: "./src/Demantle/" });
});

app.get("/stopots", (req, res) => {
    res.sendFile("StopotS.html", { root: "./src/StopotS/" });
});

app.get("/stopots/script.js", (req, res) => {
    res.sendFile("script.js", { root: "./src/StopotS/" });
});

app.get("/bhotianaa/version", (req, res) => {
    res.sendFile("Version.txt", { root: "./Bhotianaa" });
});

app.get("/bhotianaa/update", (req, res) => {
    res.sendFile("Bhotianaa.zip", { root: "./Bhotianaa" });
});

app.get("/getmessagedata/:channelid/:messageid", async (req, res) => {
    const channelId = req.params.channelid;
    const messageId = req.params.messageid;

    try {
        const json = (
            await (
                (await client.channels.fetch(
                    channelId,
                )) as GuildTextBasedChannel
            ).messages.fetch(messageId)
        ).toJSON();
        res.json(json);
    } catch (error) {
        const err = error as Error;
        res.json({
            error: "An error ocurred",
            errorName: err.name,
            errorMessage: err.message,
        });
    }
});

app.get("/getusername/:userid", async (req, res) => {
    const userId = req.params.userid;
    const { username } = await client.users.fetch(userId);
    res.send(username);
});

app.post("/garticfind", (req, res) => {
    try {
        let data = JSON.parse(req.body);
        res.json(searchGarticAnswer(data.query));
    } catch (err) {
        console.log(req.body);
        res.json({
            error: `It's json bro JSON`,
            resolution: `JSON.stringify({ query: "S _ _ _ _" })`,
            explanation: `"query" takes gartic hint as input only`,
        });
    }
});

const d3socket = new WebSocket.Server({ server: botServer });

d3socket.on("connection", (ws) => {
    ws.send(
        `{ "Server": [ "D3_connect", { "message": "Initiate connection" } ] }`,
    );

    ws.on("message", async (res) => {
        if (res.toString() === "2") return ws.send("3");
        let message = JSON.parse(res.toString()) as socketMessageClient;

        if (message.Client[0] === "D3_connect") {
            if (
                message.Client[1].message ===
                "Requesting to initiate connection"
            ) {
                const gameId = message.Client[1].gameId;
                WebsiteClass[gameId] = [
                    new Demantle(2),
                    new Demantle(1),
                    new Demantle(2),
                ];
                ws.send(
                    `{ "Server": ["D3_connect", { "message": "Connection Established at ${gameId}" }] }`,
                );
            }
        } else if (message.Client[0] === "D3_guess") {
            const gameType = message.Client[1].gameType;
            const gameId = message.Client[1].gameId;
            const guess = message.Client[1].guess;
            const guesser = message.Client[1].guesser;
            const index =
                gameType === "Random" ? 0 : gameType === "Today" ? 1 : 2;

            const res = await WebsiteClass[gameId][index].guess(
                guess.toLowerCase(),
                guesser,
            );
            if (res === undefined) return;

            if (index === 2) {
                d3socket.clients.forEach((client) =>
                    handleSocketReply(res, client, gameType),
                );
            } else handleSocketReply(res, ws, gameType);
        } else if (message.Client[0] === "D3_giveup") {
            const gameType = message.Client[1].gameType;
            const index =
                gameType === "Random" ? 0 : gameType === "Today" ? 1 : 2;
            const gameId = message.Client[1].gameId;
            const res = WebsiteClass[gameId][index].GiveUp();
            ws.send(`{ "Server": [ "D3_giveup", { "word": "${res}" } ] }`);
        } else if (message.Client[0] === "D3_requestData") {
            const gameType = message.Client[1].gameType;
            const gameId = message.Client[1].gameId;
            const index =
                gameType === "Random" ? 0 : gameType === "Today" ? 1 : 2;
            const res = WebsiteClass[gameId][index].getMetadata();
            ws.send(
                `{ "Server": [ "D3_requestData", { "guessArr": ${JSON.stringify(res.guesses)} , "indexes": ${JSON.stringify(res.indexes)} , "gameType": "${gameType}" } ] }`,
            );
        } else if (message.Client[0] === "D3_disconnect") {
            let gameId = message.Client[1].gameId;
            delete WebsiteClass[gameId];
        }
    });
});
