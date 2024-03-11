import { Event } from "../Typings/event.js";
import { readdirSync } from 'fs';
import { client } from "../../index.js";
import { ResponseType } from '../Typings/Demantle.js';
import { ChannelType, EmbedBuilder, PermissionsBitField } from 'discord.js';

export default new Event("messageCreate", async message => {

    client.musical.handleQuestion(message);

    if (message.author.bot) return;

    // Printing to console
    if (message.guild === null) console.log(`${message.author.username} [PRIV MSG] ---> ${message.content}`);
    else console.log(`[${message.guild.name}] / [${message.author.username}] : ${message.content}`);

    if (message.guild === null || message.channel.type === ChannelType.DM) return;

    // Message handling
    const argumentes = message.content.toLowerCase().split(' ');
    const emoteList = readdirSync(`${__dirname}/../Emotes`).filter(file => file.endsWith('.js')).map(file => file.replace('.js', ''));

    const permissions = message.guild.members.me?.permissionsIn(message.channel);

    // Emote Handling
    const matches = argumentes.filter(word => emoteList.includes(word));
    if (matches.length > 0) matches.forEach(emoteName => {
        const emote = client.emotes.get(emoteName.toLowerCase());
        if (!emote || !emote.emote) return;
        if (permissions) {
            if (permissions.has(PermissionsBitField.Flags.SendMessages)) emote.run({ message: message, client: client });
        }
    });

    try {
        const tempMatches = argumentes.filter(word => Object.keys(client.tempEmotes).includes(word));
        if (tempMatches.length > 0) tempMatches.forEach(emoteName => {
            const emote = client.tempEmotes[emoteName.toLowerCase()];
            if (!emote) return;
            if (permissions) {
                if (permissions.has(PermissionsBitField.Flags.SendMessages)) message.channel.send(emote);
            }
        });
    } catch (err) { }

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
                            .setFooter({ text: `POG POG POG (Chantell approved!)`, iconURL: client.users.cache.get("1006373310126362624")?.displayAvatarURL({ extension: 'png', size: 256 }) })
                            .addFields(
                                { name: "winner", value: `<@${message.author.id}>`, inline: true },
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