import { Message, type GuildTextBasedChannel } from 'discord.js';
import { remove } from 'remove-accents';
// @ts-ignore
import googleIt from 'google-it';

export class Musical {

    private channelId: string = "";
    private answers: string[] = [];
    public currentQuestion: string = "";
    public currentAnswer: string = "";

    constructor(channelId: string) {
        this.channelId = channelId;
        this.loadAnswers()
        .then(data => this.answers = data);
    }

    public async handleQuestion(message: Message<boolean>) {
        if (message.channel.id != this.channelId) return;
        if (message.author.id !== "487328045275938828") return;
        if (message.embeds.length == 0) return;

        if (message.embeds[0]?.author?.name === "NOVA RODADA!") {
            if (message.embeds[0].footer?.text === "Descubra o trecho que falta!") {
                this.setCurrentQuestion(message.embeds[0].description!);
                const answer = this.findAnswer(this.currentQuestion);
                if (answer) (message.channel as GuildTextBasedChannel).send(answer);
                else {
                    const answer = await this.searchGoogle(this.currentQuestion);
                    if (answer) (message.channel as GuildTextBasedChannel).send(`${answer[0]}`)
                }
            }
        }

        else if (message.embeds[0]?.author?.name === "DICA") {
            if (message.embeds[0].description?.includes('Artista:')) {
                const artist = message.embeds[0].description?.replace('Artista: ', '').replace(/\_/g, '');
                const answer = await this.searchGoogle(`${artist} ${this.currentQuestion}`);
                if (answer) (message.channel as GuildTextBasedChannel).send(`${answer[0]}`);
            }
        }

        else if (message.embeds[0]?.author?.name === "DESCOBERTO!") {
            this.setCurrentAnswer(message.embeds[0].description!);
            this.saveAnswer();
        }

    }

    private async searchGoogle(query: string) {
        try {
            const results = await googleIt({ query }) as { title: string; link: string; snippet: string }[];
            const wordsToIgnore = ["Released:", "Album:", "Artist:", "Artists:", "Artista:", "Artistas:", "Álbum:", "Featured artist:", "Genre:", "Genres"];
            const lyrics = results.map(res => {
                if (wordsToIgnore.some(word => res.snippet.includes(word))) return null;
                return res.snippet.replace(',Missing:  ,_____, | Show results with:,_____', '')
                    .replace(',Missing:  ,_____,, | Show results with:,_____,', '')
                    .replace(/Duration:\s+,+\d+:\d+,+/g, '')
                    .replace(/Posted:\s+,+\d+\-(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sept|Oct|Nov|Dec)\-\d+/g, '')
                    .replace(/\d+\-(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sept|Oct|Nov|Dec)\-\d+/g, '')
                    .replace(/\.+,+/g, '')
                    .replace(/,+\s+\·+\s+,+/g, '');
            })
                .filter(lyric => lyric !== null);

            const pattern = new RegExp(query.replace("_____", "(\\w+)"));

            const missingParts = lyrics
                .map(lyric => {
                    const match = lyric?.match(pattern);
                    return match ? match[1] : null;
                })
                .filter(part => part !== null);

            if (missingParts.length === 0) return lyrics;
            else return missingParts;
        } catch (error) {
            console.error(error);
        }
    }

    private findAnswer(question: string): string | undefined {
        const blankIndex = question.indexOf("_____");
        if (blankIndex === -1) return;

        const prefix = question.substring(0, blankIndex);
        const suffix = question.substring(blankIndex + "_____".length);

        for (const sentence of this.answers) {
            if (sentence.startsWith(prefix) && sentence.endsWith(suffix)) {
                return sentence.substring(prefix.length, sentence.length - suffix.length);
            }
        }

        return undefined;
    }

    private saveAnswer(): void {
        if (!this.currentQuestion || !this.currentAnswer) return;
        if (this.answers.includes(this.currentQuestion.replace('_____', this.currentAnswer))) return;
        this.answers.push(this.currentQuestion.replace('_____', this.currentAnswer));
        Bun.write('./src/Config/Musical.json', JSON.stringify(this.answers, null, 2));
    }

    private setCurrentQuestion(text: string): void {
        this.currentQuestion = remove(text.replace(/`/g, '')).toLowerCase();
    }

    private setCurrentAnswer(text: string) {
        const answer = text.match(/\*([^*]+)\*/g);
        if (!answer) return;
        this.currentAnswer = remove(answer[0].replace(/\*/g, '')).toLowerCase();
    }

    private async loadAnswers(): Promise<string[]> {
        const file = Bun.file('./src/Config/Musical.json');
        if (await file.exists())
            return await file.json();
        else
            return [];
    }
}