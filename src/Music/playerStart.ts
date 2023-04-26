import { EmbedBuilder } from "discord.js";
import { MusicEvent } from "../Typings/event.js";
import { MusicMetadata, icons } from "../Typings/music.js";

export default new MusicEvent("playerStart", (queue, track) => {
  const metadata = queue.metadata as MusicMetadata;

  if (metadata.isRadio) {
    if (metadata.interaction.channel !== null) metadata.client.RadioChannels.push(metadata.interaction.channel);
    return metadata.interaction.channel?.send({
      embeds: [
        new EmbedBuilder()
          .setTitle("24/7 Radio mode")
          .setDescription(`Now playing: ${metadata.client.RadioData.now_playing.title}\nArtist: ${metadata.client.RadioData.now_playing.artists}`)
          .setColor("#ff2a00")
          .setAuthor({ name: `Simulator Radio`, iconURL: icons.simulatorRadio, url: "https://simulatorradio.com" })
          .setFooter({ text: "Embed auto created by d3fau4tbot" })
          .setTimestamp()
          .setURL("https://simulatorradio.com")
          .addFields(
            { name: "Current DJ", value: `${metadata.client.RadioData.djs.now.displayname}`, inline: true },
            { name: "Airing at", value: `<t:${metadata.client.RadioData.djs.now.slotstamp}:f>`, inline: true },
            { name: "Next DJ", value: `${metadata.client.RadioData.djs.next.displayname}`, inline: true },
            { name: "Airing at", value: `<t:${metadata.client.RadioData.djs.next.slotstamp}:f>`, inline: true },
            { name: "DJ Later", value: `${metadata.client.RadioData.djs.later.displayname}`, inline: true },
            { name: "Airing at", value: `<t:${metadata.client.RadioData.djs.later.slotstamp}:f>`, inline: true },
          )
          .setImage(metadata.client.RadioData.now_playing.art)
          .setThumbnail(`https://simulatorradio.com/processor/avatar?size=64&name=${metadata.client.RadioData.djs.now.avatar}`)
      ]
    });
  }

  else return metadata.interaction.channel?.send({
    embeds: [
      new EmbedBuilder()
        .setDescription("Playing a song from the queue")
        .setColor("Random")
        .setAuthor({ name: `Now Playing`, iconURL: `https://cdn.discordapp.com/attachments/933971458496004156/1005595741198233790/My_project.png` })
        .setFooter({ text: "Embed auto created by d3fau4tbot" })
        .setTimestamp()
        .setURL(track.url)
        .addFields(
          { name: "Song Name", value: `${track.title}`, inline: false },
          { name: "Duration", value: `${track.duration}`, inline: true },
          { name: "Requested by", value: `${track.requestedBy?.username}`, inline: true },
        )
        .setImage(track.thumbnail)
        .setThumbnail(track.source === "youtube" ? icons.youtube : track.source === "soundcloud" ? icons.soundCloud : track.source === "spotify" ? icons.spotify : track.source === "apple_music" ? icons.appleMusic : null)
    ]
  })
});