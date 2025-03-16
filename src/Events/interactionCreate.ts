import { client } from '../../index.js';
import { Event } from '../Typings/event.js';

export default new Event("interactionCreate", async interaction => {

    if (!interaction) return;

    if (interaction.isChatInputCommand() || interaction.isContextMenuCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command || command.emote) return;
        command.run({ client, interaction });
    }
});