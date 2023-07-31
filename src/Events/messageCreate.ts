import axios from 'axios';
import { Event } from "../Typings/event.js";
import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { client } from "../../index.js";
import { ResponseType } from '../Typings/Demantle.js';
import { EmbedBuilder, Message } from 'discord.js';
import { Desafiantes } from '../Typings/desafiantes.js';

const converse = async (prompt: string, name: string) => {
    const uploadingData = JSON.stringify({
        "key": process.env['OPENAI_API_KEY'],
        "prompt": `${name}: ${prompt}\nd3fau4tbot: `,
        "id": "default",
        "options": {
            "instructions": 'Pretend that you\'re d3fau4tbot, an AI created by "D3FAU4T" in the year 2020. You\'re helpful, creative, clever and very friendly and you\'re currently in a discord channel with friends of your creator "D3FAU4T".'
        }
    });

    const { data } = await axios.post(process.env['AIendpoint'] as string, uploadingData, { headers: { 'Content-Type': 'application/json' } });
    return (data.response as string).replace('OpenAI', 'D3FAU4T').replace('ChatGPT', 'd3fau4tbot').replace(/^(\,)+/g, '')
}

const dsfMessage = async (nomeDoDesafiante: string, message: Message<boolean>, success: "one" | "all" | "fail") => {
    if (success === 'all') await message.channel.send({
        embeds: [
            new EmbedBuilder()
                .setAuthor({ name: "Adicionado com sucesso", iconURL: "https://images-ext-1.discordapp.net/external/vRinCI6dMGE1eNRk-tqZqtjIDtAKQvRgM3BaX5Eu0H8/%3Fv%3D12/https/garticbot.gg/images/icons/hit.png" })
                .setDescription(`Parabéns ${nomeDoDesafiante}, você completou todos os desafios!`)
                .setColor("Green")
        ]
    });

    else if (success === 'one') await message.channel.send({
        embeds: [
            new EmbedBuilder()
                .setAuthor({ name: "Adicionando com sucesso", iconURL: "https://images-ext-1.discordapp.net/external/vRinCI6dMGE1eNRk-tqZqtjIDtAKQvRgM3BaX5Eu0H8/%3Fv%3D12/https/garticbot.gg/images/icons/hit.png" })
                .setDescription(`Parabéns ${nomeDoDesafiante}, obrigado pela sua contribuição!`)
                .setColor("Green")
        ]
    })

    else await message.channel.send({
        embeds: [
            new EmbedBuilder()
                .setAuthor({ name: "Erro", iconURL: "https://images-ext-1.discordapp.net/external/Myy2JZKWwkK-NqxkH-csqLwwXzckt5ykPRfEmfqOLjk/%3Fv%3D12/https/garticbot.gg/images/icons/error.png" })
                .setDescription(`Você já completou esse desafio ${nomeDoDesafiante}!`)
                .setColor("Red")
        ]
    });
}

export default new Event("messageCreate", async message => {
    if (message.author.bot) return;

    // Printing to console
    if (message.guild === null) console.log(`${message.author.username} [PRIV MSG] ---> ${message.content}`);
    else console.log(`[${message.guild.name}] / [${message.author.username}] : ${message.content}`);

    // Message handling
    const argumentes = message.content.toLowerCase().split(' ');
    const emoteList = readdirSync(`${__dirname}/../Emotes`).filter(file => file.endsWith('.js')).map(file => file.replace('.js', ''));

    if (message.content.toLowerCase().startsWith('-ds') && message.channel.id === "1133396329163407560") {
        let desafiantes = JSON.parse(readFileSync("./src/Config/desafiantes.json", "utf-8")) as Desafiantes;
        const desafiante = message.content.split(' ')[1];

        if (argumentes[0] === "-ds1") {

            if (desafiantes.desafio2.includes(desafiante) && desafiantes.desafio3.includes(desafiante)) {
                desafiantes.desafio2 = desafiantes.desafio2.filter((desafiantes) => desafiantes !== desafiante);
                desafiantes.desafio3 = desafiantes.desafio3.filter((desafiantes) => desafiantes !== desafiante);
                desafiantes.todos.push(desafiante);
                writeFileSync("./src/Config/desafiantes.json", JSON.stringify(desafiantes, null, 2));
                await dsfMessage(desafiante, message, 'all');
                return;
            }

            if (desafiantes.desafio1.includes(desafiante)) return await dsfMessage(desafiante, message, 'fail');
            desafiantes.desafio1.push(desafiante);
            writeFileSync("./src/Config/desafiantes.json", JSON.stringify(desafiantes, null, 2));
            await dsfMessage(desafiante, message, 'one');
            return;
        }

        else if (argumentes[0] === "-ds2") {

            if (desafiantes.desafio1.includes(desafiante) && desafiantes.desafio3.includes(desafiante)) {
                desafiantes.desafio1 = desafiantes.desafio1.filter((desafiantes) => desafiantes !== desafiante);
                desafiantes.desafio3 = desafiantes.desafio3.filter((desafiantes) => desafiantes !== desafiante);
                desafiantes.todos.push(desafiante);
                writeFileSync("./src/Config/desafiantes.json", JSON.stringify(desafiantes, null, 2));
                await dsfMessage(desafiante, message, 'all');;
                return;
            }

            if (desafiantes.desafio2.includes(desafiante)) return await dsfMessage(desafiante, message, 'fail');
            desafiantes.desafio2.push(desafiante);
            writeFileSync("./src/Config/desafiantes.json", JSON.stringify(desafiantes, null, 2));
            await dsfMessage(desafiante, message, 'one');
            return;
        }

        else if (argumentes[0] === "-ds3") {

            if (desafiantes.desafio1.includes(desafiante) && desafiantes.desafio2.includes(desafiante)) {
                desafiantes.desafio1 = desafiantes.desafio1.filter((desafiantes) => desafiantes !== desafiante);
                desafiantes.desafio2 = desafiantes.desafio2.filter((desafiantes) => desafiantes !== desafiante);
                desafiantes.todos.push(desafiante);
                writeFileSync("./src/Config/desafiantes.json", JSON.stringify(desafiantes, null, 2));
                await dsfMessage(desafiante, message, 'all');
                return;
            }

            if (desafiantes.desafio3.includes(desafiante)) return await dsfMessage(desafiante, message, 'fail');
            desafiantes.desafio3.push(desafiante);
            writeFileSync("./src/Config/desafiantes.json", JSON.stringify(desafiantes, null, 2));
            await dsfMessage(desafiante, message, 'one');
            return;
        }

        else if (argumentes[0] === "-ds") {
            if (desafiantes.todos.includes(desafiante)) return await dsfMessage(desafiante, message, 'fail');
            desafiantes.todos.push(desafiante);
            writeFileSync("./src/Config/desafiantes.json", JSON.stringify(desafiantes, null, 2));
            await dsfMessage(desafiante, message, 'all');
            return;
        }
    }

    // Emote Handling
    const matches = argumentes.filter(word => emoteList.includes(word));
    if (matches.length > 0) matches.forEach(emoteName => {
        const emote = client.emotes.get(emoteName.toLowerCase());
        if (!emote || !emote.emote) return;
        emote.run({ message: message, client: client });
    });

    // AI Response
    // if (message.channel.id == "1043421639683096586" && message.attachments.size < 1) {
    //     const res = await converse(message.content, message.author.username.normalize("NFKC"));
    //     await message.channel.sendTyping();
    //     if (res.length > 2000) {
    //         const firstChunk = res.slice(0, 1900);
    //         await message.reply(firstChunk)
    //         const rest = res.slice(1900);
    //         await message.channel.send(rest)
    //     } else {
    //         await message.reply(res);
    //     }
    // }

    // D3mantle checker
    if (Object.keys(client.semantle).includes(message.channel.id)) {
        try {
            const emojiRegex = /\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/g;
            if (
                message.author.bot
                || message.content.split(' ').length != 1
                || client.semantle[message.channel.id] == undefined
                || message.attachments.size > 0
                || emojiRegex.test(message.content)
                || client.semantle[message.channel.id].configurations.findTheWord == false
                || message.content.includes('_')
                || client.semantle[message.channel.id].ignoreList.includes(message.author.id)
            ) return;

            const response = await client.semantle[message.channel.id].guess(message.content, message.author.username);
            if (response === undefined) return;

            if (response.reason === ResponseType.InvalidWord) {
                await message.delete();
                const toSend = response.message;
                message.channel.send(toSend);
            }
            else if (response.reason === ResponseType.EditSelfMessageContent) {
                await message.delete();
                const toSend = response.message;
                response.initialMessage?.edit({ content: toSend });
            }
            else if (response.reason === ResponseType.AlreadyExists) {
                await message.delete();
                const toSend = response.message;
                response.initialMessage?.edit({ content: toSend });
            }
            else if (response.reason === ResponseType.UpdateInitialMessage) {
                await message.delete();
                const toSend = response.message;
                const toUpdate = await message.channel.send(toSend);
                client.semantle[message.channel.id].updateMessage(toUpdate);
            }
            else if (response.reason === ResponseType.UpdateInitialMessageEdit) {
                await message.delete();
                const toSend = response.message;
                const toUpload = await response.initialMessage?.edit({ content: toSend });
                if (toUpload == undefined) return;
                client.semantle[message.channel.id].updateMessage(toUpload);
            }
            else {
                const toEdit = response.scoreboard;
                await response.initialMessage?.edit({ content: toEdit });
                await message.channel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle("Semantle: Found!")
                            .setDescription(`GGs Word found!`)
                            .setColor("Green")
                            .setThumbnail("https://cdn.discordapp.com/attachments/992564973064699924/1035425625374208000/frisco7GG.png")
                            .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL({ extension: 'png', size: 256 }) })
                            .setFooter({ text: `POG POG POG (Chantell approved!)`, iconURL: "https://cdn.discordapp.com/attachments/920832476606234664/1056767933927411712/88f52b10d581542266f90c963f77b9d9.png" })
                            .addFields(
                                { name: "winner", value: `${message.author.username}`, inline: true },
                                { name: "word", value: `${response.word}`, inline: true },
                                { name: "number-of-guesses", value: `${response.guessLength}`, inline: true }
                            )
                    ]
                });

                delete client.semantle[message.channel.id];
            }
        } catch (err) {
            console.error(err);
        }
    }
});