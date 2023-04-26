import { Event } from '../Typings/event.js';

export default new Event('messageReactionAdd', async (reaction, user) => {
    if (reaction.message.partial) await reaction.message.fetch();
    if (reaction.partial) await reaction.fetch();
    if (user.bot || !reaction.message.guild) return;
    if (reaction.message.channel.id == '1050395057687101440') {
        if (reaction.emoji.name === '🎨') await reaction.message.guild.members.cache.get(user.id)?.roles.add('1050443777627660358');
    }
});