import { EmbedBuilder } from "discord.js";

export const getRandom = <T>(array: T[]): T | null => array.length > 0 ? array[Math.floor(Math.random() * array.length)]! : null;

/**
 * Creates and throws an error embed for consistent error handling across commands
 * @param title - The error title 
 * @param description - The error description
 * @param name - The error name (default: "Error")
 */
export const ErrorEmbed = (title: string = "Error", description: string): EmbedBuilder =>
    new EmbedBuilder()
        .setAuthor({
            name: title,
            iconURL: "https://cdn.discordapp.com/attachments/1097538516436660355/1146354645107748925/Error.png"
        })
        .setDescription(description)
        .setColor("Red");
