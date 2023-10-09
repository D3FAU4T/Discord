import glob from 'glob';
import axios from 'axios';
import cheerio from 'cheerio';
import { Player, GuildQueueEvents } from 'discord-player';
import { remove } from 'remove-accents';
import { promisify } from 'util';
import { commandsInterface } from '../Typings/commands.js';
import { Event, MusicEvent } from '../Typings/event.js';
import { MerriamWebsterAPI, dictionaryAPI } from '../Typings/definitions.js';
import { Demantle } from '../Demantle/Demantle.js';
import { SimulatorRadioCombined, icons } from '../Typings/music.js';
import { Musical } from '../Gartic/Musical.js';
import {
  ApplicationCommandDataResolvable,
  Client,
  ClientEvents,
  Collection,
  EmbedBuilder,
  Events,
  GatewayIntentBits,
  Partials,
  VoiceBasedChannel
} from "discord.js";
import {
  GetRandom,
  axiosHandler,
  parser,
  fetchCheaters,
  numberAssign,
  between,
  calculateLevels,
  calculatePoints,
  dsfMessage,
  getTwitchData,
  getTwitchDataFromId,
  makeErrorEmbed,
  handleSocketReply,
  searchGarticAnswer,
  updateCheaterNames,
  updateWOSLevels
} from './functions.js';

const globPromise = promisify(glob);

export class D3_discord extends Client {

  public commands: Collection<string, commandsInterface> = new Collection();
  public emotes: Collection<string, commandsInterface> = new Collection();
  public musical = new Musical('1142691243609038959');
  public semantle: { [channelId: string]: Demantle } = {}
  public DiscordPlayer = new Player(this);
  public RadioChannels: VoiceBasedChannel[] = [];
  public tempEmotes: { [emoteName: string]: string } = {};

  public functions = {
    getRandom: GetRandom,
    getBetween: between,
    textFormatter: parser,
    getCheaters: fetchCheaters,
    makeList: numberAssign,
    axiosHandler,
    calculateLevels,
    calculatePoints,
    dsfMessage,
    getTwitchData,
    getTwitchDataFromId,
    makeErrorEmbed,
    handleSocketReply,
    searchGarticAnswer,
    updateCheaterNames,
    updateWOSLevels
  }

  public RadioData: SimulatorRadioCombined = {
    now_playing: {
      title: ''
    }
  } as SimulatorRadioCombined;


  constructor() {
    super({
      intents: [
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions
      ],
      partials: [
        Partials.Channel,
        Partials.GuildMember,
        Partials.Message,
        Partials.Reaction,
        Partials.User
      ]
    });
  }

  public async start(): Promise<void> {
    this.registerFiles();
    this.login(process.env['discordToken']);
    setInterval(async () => await this.getRadioData(), 10000)
  }

  public async importFile(filePath: string): Promise<unknown> {
    return await require(filePath).default;
  }

  private registerSlashCommands(command: ApplicationCommandDataResolvable[], guildId?: string): void {
    if (guildId) {
      console.log(`Registering command to the guild: ${guildId}`);
      this.guilds.cache.get(guildId)?.commands.set(command);
    }
    else this.application?.commands.set(command);
  }

  private async registerFiles(): Promise<void> {

    const serverCommands: { [guildId: string]: ApplicationCommandDataResolvable[] } = {};
    const globalCommands: ApplicationCommandDataResolvable[] = [];

    // Commands
    const commandFiles = await globPromise(`${__dirname}/../Commands/*/*{.ts,.js}`);
    commandFiles.forEach(async filePath => {
      const command = await this.importFile(filePath) as commandsInterface;
      if (command.emote || command.data === undefined) return;
      this.commands.set(command.name, command);

      if (!command.guildId) globalCommands.push(command.data.toJSON());
      else {
        command.guildId.forEach(guildId => {
          if (command.data === undefined) return;
          if (!serverCommands[guildId]) serverCommands[guildId] = [];
          serverCommands[guildId].push(command.data.toJSON());
        });
      }
    });

    // Register commands
    this.on(Events.ClientReady, () => {
      Object.keys(serverCommands).forEach(guildId => {
        this.registerSlashCommands(serverCommands[guildId], guildId);
      });
      this.registerSlashCommands(globalCommands);
    });

    // Events
    const eventFiles = await globPromise(`${__dirname}/../Events/*{.ts,.js}`);
    eventFiles.forEach(async filePath => {
      const dcEvents = await this.importFile(filePath) as Event<keyof ClientEvents>;
      this.on(dcEvents.event, dcEvents.run);
    });

    // Emotes
    const emoteFiles = await globPromise(`${__dirname}/../Emotes/*{.ts,.js}`);
    emoteFiles.forEach(async filePath => {
      const emote = await this.importFile(filePath) as commandsInterface;
      if (!emote.emote) return;
      this.emotes.set(emote.name, emote);
    });

    // Discord Player events
    const discordPlayerEvents = await globPromise(`${__dirname}/../Music/*{.ts,.js}`);
    discordPlayerEvents.forEach(async filePath => {
      const event = await this.importFile(filePath) as MusicEvent<keyof GuildQueueEvents>;
      this.DiscordPlayer.events.on(event.event, event.run);
    });
  }

  public async getWordDefinition(word: string, language: "en" | "pt"): Promise<string> {
    let summary = '';
    try {
      if (language === 'en') {
        const { data } = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${remove(word)}`);
        const resp: dictionaryAPI = data[0];
        let meaningCount = 1;
        resp.meanings.forEach(meaning => {
          meaning.definitions.forEach(definition => {
            summary += `\n${meaningCount}. (${meaning.partOfSpeech}) ${definition.definition}`;
            if (definition.example) summary += `\nExample: ${definition.example}`;
            meaningCount += 1;
          });
        });
      } else if (language === 'pt') {
        const { data } = await axios.get('https://dicionario.priberam.org/' + word);
        const $ = cheerio.load(data);
        let results = $('#resultados div,#resultados p,#resultados span').contents();
        const meanings: string[] = [];
        results.each((_, element) => {
          if ($(element).is('p')) {
            let significado = $(element).text().trim().replace(/\n+/g, '').replace(/\s\s\s/g, '').replace(/\[(\w+,?\s?){1,3}]/, '');
            meanings.push(significado);
          }
        });
        if (meanings.length > 0) return meanings.join('\n');
        else throw new Error('Definição não encontrada');
      }
    } catch (err: any) {
      if (language === 'en') {
        try {
          let definitions: string[] = [];
          const { data }: { data: MerriamWebsterAPI[] } = await axios.get(`https://www.dictionaryapi.com/api/v3/references/sd4/json/${word}?key=${process.env['merriamKey']}`);
          data[0].def.forEach((item, index) => {
            const definition: string = item.sseq[0][0][1].dt[0][1];
            definitions.push(`${index + 1}. ${definition}`);
          });
          summary = definitions.join('\n');
        } catch (err) {
          summary = `An unknown error occurred, check console`;
          console.error(err)
        }
      } else summary = 'Desculpe, não encontrei essa palavra no meu dicionário';
    }
    return summary;
  }

  private async getRadioData(): Promise<void> {
    try {
      const { data }: { data: SimulatorRadioCombined } = await axios.get('https://apiv2.simulatorradio.com/metadata/combined');
      if (data.now_playing.title !== this.RadioData.now_playing.title) {
        this.RadioData = data;
        if (this.RadioChannels.length === 0) return;
        this.RadioChannels.forEach(channel => {
          channel.send({
            embeds: [
              new EmbedBuilder()
                .setTitle("24/7 Radio mode")
                .setDescription(`Now playing: ${data.now_playing.title}\nArtist: ${data.now_playing.artists}`)
                .setColor("#ff2a00")
                .setAuthor({ name: `Simulator Radio`, iconURL: icons.simulatorRadio, url: "https://simulatorradio.com" })
                .setFooter({ text: "Embed auto created by d3fau4tbot" })
                .setTimestamp()
                .setURL("https://simulatorradio.com")
                .addFields(
                  { name: "Current DJ", value: `${data.djs.now.displayname}`, inline: true },
                  { name: "Airing at", value: `<t:${data.djs.now.slotstamp}:f>`, inline: true },
                  { name: "Next DJ", value: `${data.djs.next.displayname}`, inline: true },
                  { name: "Airing at", value: `<t:${data.djs.next.slotstamp}:f>`, inline: true },
                  { name: "DJ Later", value: `${data.djs.later.displayname}`, inline: true },
                  { name: "Airing at", value: `<t:${data.djs.later.slotstamp}:f>`, inline: true },
                )
                .setImage(data.now_playing.art)
                .setThumbnail(`https://simulatorradio.com/processor/avatar?size=64&name=${data.djs.now.avatar}`)
            ]
          });
        });
      }
    } catch (err) {
      console.error(err);
    }
  }

  public async getUsernameAndDisplayname(userList: `<@${number}>`[]) {
    let data: { displayName: string, username: string }[] = [];
    for (const user of userList) {
      const id = user.replace('<@', '').replace('>', '');
      const person = await this.users.fetch(id);
      data.push({
        displayName: person.displayName,
        username: person.username
      });
    }
    return data;
  }
}