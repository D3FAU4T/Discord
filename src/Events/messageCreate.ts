import { Event } from "../Typings/event.js";
import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { client } from "../../index.js";
import { ResponseType } from '../Typings/Demantle.js';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { Desafiantes } from '../Typings/desafiantes.js';
import { dsfMessage } from '../Core/functions.js';

export default new Event("messageCreate", async message => {

    client.musical.handleQuestion(message);

    if (message.author.bot) return;

    // Printing to console
    if (message.guild === null) console.log(`${message.author.username} [PRIV MSG] ---> ${message.content}`);
    else console.log(`[${message.guild.name}] / [${message.author.username}] : ${message.content}`);

    // Message handling
    const argumentes = message.content.toLowerCase().split(' ');
    const emoteList = readdirSync(`${__dirname}/../Emotes`).filter(file => file.endsWith('.js')).map(file => file.replace('.js', ''));

    // Emote Handling
    const matches = argumentes.filter(word => emoteList.includes(word));
    if (matches.length > 0) matches.forEach(emoteName => {
        const emote = client.emotes.get(emoteName.toLowerCase());
        if (!emote || !emote.emote) return;
        emote.run({ message: message, client: client });
    });

    try {
        const tempMatches = argumentes.filter(word => Object.keys(client.tempEmotes).includes(word));
        if (tempMatches.length > 0) tempMatches.forEach(emoteName => {
            const emote = client.tempEmotes[emoteName.toLowerCase()];
            if (!emote) return;
            message.channel.send(emote);
        });
    } catch (err) {}

    // Desafiantes
    if (message.content.toLowerCase().startsWith('-ds') && message.channel.id === "1133396329163407560") {
        let desafiantes = JSON.parse(readFileSync("./src/Config/desafiantes.json", "utf-8")) as Desafiantes;
        const desafiante = message.content.split(' ')[1];

        if (!desafiante.includes('<@') && !desafiante.includes('>')) return message.channel.send({
            embeds: [
                new EmbedBuilder()
                    .setAuthor({ name: "Eita", iconURL: "https://images-ext-2.discordapp.net/external/LJYK0J8-fh4w4ryIYW-30TF8kuX6X0pHvxuu31XuVbI/%3Fv%3D12/https/garticbot.gg/images/icons/alert.png" })
                    .setDescription(`Você não mencionou ninguém para adicionar na lista de desafiantes\n\n**Exemplo:**\`\`\`\n-ds1 @user\n-ds2 @user\n-ds3 @user\n\`\`\``)
                    .setColor("Yellow")
            ]
        });

        if (argumentes[0] === "-ds1") {

            if (desafiantes.todos.includes(desafiante)) return await dsfMessage(desafiante, message, 'done');

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

            if (desafiantes.todos.includes(desafiante)) return await dsfMessage(desafiante, message, 'done');

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

            if (desafiantes.todos.includes(desafiante)) return await dsfMessage(desafiante, message, 'done');

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
    }

    else if (message.content.toLowerCase() === '-resetar' && message.channel.id === "1133396329163407560") {
        let desafiantes = JSON.parse(readFileSync("./src/Config/desafiantes.json", "utf-8")) as Desafiantes;

        if (message.member?.roles.cache.has("1135979193155469342")) {
            const msg = await message.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setAuthor({ name: "Deseja redefinir a lista?", iconURL: "https://images-ext-2.discordapp.net/external/LJYK0J8-fh4w4ryIYW-30TF8kuX6X0pHvxuu31XuVbI/%3Fv%3D12/https/garticbot.gg/images/icons/alert.png" })
                        .setDescription("Pressione o botão de confirmação abaixo para redefinir. Lembrando que essa ação é irreversível após pressionar o botão redefinir.")
                        .setColor("Yellow")
                        .setFooter({ text: "Você tem 5 minutos para responder", iconURL: "https://media.discordapp.net/attachments/1111174841161220169/1134961239387287612/gtc_catAviso.png" })
                ],
                components: [
                    new ActionRowBuilder<ButtonBuilder>().addComponents(
                        new ButtonBuilder()
                            .setCustomId("btn_reset")
                            .setEmoji("✅")
                            .setLabel("Confirmar")
                            .setStyle(ButtonStyle.Success)
                    )
                ]
            });

            const collector = msg.createMessageComponentCollector({ time: 300000, filter: (i) => i.user.id === message.author.id });

            collector.on("collect", async (i) => {
                if (i.customId === "btn_reset") {
                    desafiantes.desafio1 = [];
                    desafiantes.desafio2 = [];
                    desafiantes.desafio3 = [];
                    desafiantes.todos = [];
                    writeFileSync("./src/Config/desafiantes.json", JSON.stringify(desafiantes, null, 2));

                    await i.update({
                        embeds: [
                            new EmbedBuilder()
                                .setAuthor({ name: "Lista redefinida!", iconURL: "https://images-ext-1.discordapp.net/external/vRinCI6dMGE1eNRk-tqZqtjIDtAKQvRgM3BaX5Eu0H8/%3Fv%3D12/https/garticbot.gg/images/icons/hit.png" })
                                .setDescription("A lista de desafiantes foi redefinida com sucesso!")
                                .setColor("Green")
                        ],
                        components: []
                    });
                }
            });

            collector.on("ignore", async (i) => {
                await i.followUp({
                    embeds: [
                        new EmbedBuilder()
                            .setAuthor({ name: "Eita", iconURL: "https://images-ext-1.discordapp.net/external/Myy2JZKWwkK-NqxkH-csqLwwXzckt5ykPRfEmfqOLjk/%3Fv%3D12/https/garticbot.gg/images/icons/error.png" })
                            .setDescription("Somente a pessoa que usou o comando pode interagir com os botões")
                            .setColor("Red")
                    ],
                    ephemeral: true
                });
            });

        }

        else message.channel.send({
            embeds: [
                new EmbedBuilder()
                    .setAuthor({ name: "Eita", iconURL: "https://images-ext-1.discordapp.net/external/Myy2JZKWwkK-NqxkH-csqLwwXzckt5ykPRfEmfqOLjk/%3Fv%3D12/https/garticbot.gg/images/icons/error.png" })
                    .setDescription("Você não tem permissão para usar esse comando. Só pessoas com cargo <@&1135979193155469342> podem usar")
                    .setColor("Red")
            ]
        });
    }

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