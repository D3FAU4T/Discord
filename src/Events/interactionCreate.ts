import { client } from '../../index.js';
import { Event } from '../Typings/event.js';

export default new Event("interactionCreate", async interaction => {

    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command || command.emote) return;
        command.run({ client, interaction });
    }
    
    else if (interaction.isUserContextMenuCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command || command.emote) return;
        // @ts-ignore
        command.run({ client, interaction });
    }
});