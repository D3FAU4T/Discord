import { MusicEvent } from "../Typings/event";
import { MusicMetadata } from "../Typings/music";

export default new MusicEvent('disconnect', queue => {
    let metadata = queue.metadata as MusicMetadata;
    let channelId = metadata.interaction.channel?.id;
    if (channelId !== undefined) metadata.client.RadioChannels = metadata.client.RadioChannels.filter(channel => channel.id !== channelId);
});