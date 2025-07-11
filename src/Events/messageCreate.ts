import { Event } from "../core/client";
import {
    MessageFlags, PermissionFlagsBits,
    PresenceUpdateStatus, SectionBuilder
} from "discord.js";

import type { demantleDb } from "../typings/demantle";

export default new Event("messageCreate", async message => {
    if (message.author.bot || !message.guild) return;

    const permissions = message.guild.members.me?.permissionsIn(message.channel.id);
    if (!permissions || !permissions.has(PermissionFlagsBits.SendMessages)) return;

    const words = message.content.toLowerCase().split(" ");

    // Emotes handling
    const matches = words.filter(word => message.client.emotes[word]);
    for (const match of matches)
        await message.reply(message.client.emotes[match]!);

    // Demantle game handling
    if (message.client.demantles.size && message.client.demantles.has(message.channel.id)) {
        const demantle = message.client.demantles.get(message.channel.id)!;

        const emojiRegex = /[\p{Emoji_Presentation}\p{Emoji}\u200d]+/gu;
        if (
            emojiRegex.test(message.content)
            || message.content.includes("https://")
            || message.attachments.size > 0
            || demantle.ignoreIds.includes(message.author.id)
            || words.length !== 1
        ) return;

        const guessResult = await demantle.game.guess(words[0]!, message.author.username);

        // First guess: If guess is successful but no table cached
        if (guessResult.success && !demantle.message) {
            await message.delete();
            demantle.message = await message.channel.send(guessResult.table);
        }

        // Win condition
        else if (guessResult.success && words[0] === demantle.game.word) {
            const updatedStats = await message.client.db.collection<demantleDb>('Demantle')
                .findOneAndUpdate(
                    { userId: message.author.id },
                    { $inc: { wins: 1 } },
                    { upsert: true, returnDocument: "after", includeResultMetadata: false },
                );

            if (!updatedStats)
                await message.channel.send("An error occurred while updating your stats. Please report this issue to the developer.");

            await demantle.message!.edit(guessResult.table);

            const section = new SectionBuilder()
                .addTextDisplayComponents(
                    textDisplay => textDisplay
                        .setContent([
                            `# ${message.author.displayName} 🎉`,
                            `🏆 **Word**: ${demantle.game.word}`,
                            `🏅 **Wins**: \`${updatedStats?.wins ?? `unknown`}\``,
                            `🔢 **Number of guesses**: \`${demantle.game.guesses.length}\``
                        ].join('\n'))
                )
                .setThumbnailAccessory(
                    thumbnail => thumbnail
                        .setURL(message.author.displayAvatarURL({ size: 128 }))
                );

            await message.channel.send({
                flags: MessageFlags.IsComponentsV2,
                components: [section],
            });

            message.client.demantles.delete(message.channel.id);

            // Clear bot presence if no games are active
            if (message.client.demantles.size === 0)
                message.client.user.setPresence({
                    activities: [],
                    status: PresenceUpdateStatus.Idle,
                });
        }

        // Any guess after first: If guess is successful and first table cached
        else if (guessResult.success && demantle.message) {
            await message.delete();
            demantle.message = await demantle.message.edit(guessResult.table);
        }

        // First guess: Invalid guess
        else if (!guessResult.success && !demantle.message) {
            const msg = await message.delete();
            demantle.message = await message.channel.send(`<@${msg.author.id}> I have no idea what that is X\\_X`);
        }

        // Any guess after first: Invalid guess
        else if (!guessResult.success && demantle.message) {
            const msg = await message.delete();

            let originalContent = demantle.message.content;

            // Remove any previous error messages (lines starting with <@userId>)
            const lines = originalContent.split('\n');
            const tableStartIndex = lines.findIndex(line => !line.match(/^<@\d+>/));
            const gameTable = tableStartIndex !== -1 ? lines.slice(tableStartIndex).join('\n') : originalContent;

            if (guessResult.error === 'invalid_guess')
                demantle.message = await demantle.message.edit(
                    `<@${msg.author.id}> I have no idea what \`${words[0]}\` is X\\_X\n${gameTable}`
                );

            else demantle.message = await demantle.message.edit(
                `<@${msg.author.id}> The word \`${words[0]}\` has already been guessed!\n${gameTable}`
            );
        }
    }
});