import os
import json
import random
from disnake import Activity, ActivityType, ApplicationCommandInteraction, Colour, Embed, Status
from disnake.ext import commands

class WODCog(commands.Cog):
    def __init__(self, bot: commands.InteractionBot):
        self.bot = bot

    @commands.slash_command(
        name="wod",
        description="Play a game of WOD"
    )
    async def wod(self, interaction: ApplicationCommandInteraction):
        # Base group command; subcommands below
        pass

    @wod.sub_command(name="custom", description="Start a new WOD game with custom levels")
    async def custom(self, interaction: ApplicationCommandInteraction):
        await interaction.response.defer()

        with open(os.path.join("Config", "levels.json"), 'r', encoding='utf-8') as f:
            raw: dict[str, list] = json.load(f)

        levels: list = []
        for v in raw.values():
            levels.extend(v)

        random_level: dict[str, list[str]] = random.choice(levels)
        
        col1 = random_level.get('col1', [])
        col2 = random_level.get('col2', [])
        col3 = random_level.get('col3', [])
        
        if not col3:
            await interaction.edit_original_response(content="Error: No valid words in this level.")
            return
        
        valid_word = col3[-1].lower()
        valid_letters = list(valid_word)
        
        all_words = []
        all_words.extend([w.lower() for w in col1])
        all_words.extend([w.lower() for w in col2])
        all_words.extend([w.lower() for w in col3])
        
        channel_id = interaction.channel.id
        
        if channel_id in self.bot.wod_games:  # type: ignore
            await interaction.edit_original_response(
                embed=Embed(
                    title="WOD Error",
                    description="A game is already in progress in this channel.",
                    colour=Colour.red()
                )
            )
            return
        
        max_rows = max(len(col1), len(col2), len(col3))
        
        masked_display = ''
        for i in range(max_rows):
            word1 = col1[i] if i < len(col1) else ''
            word2 = col2[i] if i < len(col2) else ''
            word3 = col3[i] if i < len(col3) else ''
            
            word1_masked = ''.join('x' if c != ' ' else ' ' for c in word1)
            word2_masked = ''.join('x' if c != ' ' else ' ' for c in word2)
            word3_masked = ''.join('x' if c != ' ' else ' ' for c in word3)
            
            row = f"{word1_masked:<10} {word2_masked:<10} {word3_masked:<10}"
            masked_display += row + '\n'
        
        scrambled_letters = valid_letters.copy()
        random.shuffle(scrambled_letters)
        letters_display = ' '.join(scrambled_letters).upper()
        
        game_message = await interaction.edit_original_response(content=f"```\nLetters: {letters_display}\n\n{masked_display}```")
        
        self.bot.wod_games[channel_id] = {  # type: ignore
            "all_words": set(all_words),
            "valid_letters": valid_letters,
            "level": random_level,
            "guesses": [],
            "revealed_words": set(),
            "message": game_message,
            "valid_word": valid_word,
        }

        await self.bot.change_presence(
            status=Status.online,
            activity=Activity(
                name='WOD',
                state="Words on Discord",
                type=ActivityType.playing
            )
        )

    @wod.sub_command(name="give_up", description="Give up on the current WOD game")
    async def give_up(self, interaction: ApplicationCommandInteraction):
        await interaction.response.defer()
        wod_game = self.bot.wod_games.get(interaction.channel.id)  # type: ignore

        if wod_game is None:
            await interaction.edit_original_response(
                embed=Embed(
                    title="WOD Error",
                    description="There is no game in progress in this channel.",
                    colour=Colour.red(),
                )
            )
            return

        del self.bot.wod_games[interaction.channel.id]  # type: ignore
        
        if not self.bot.wod_games:  # type: ignore
            await self.bot.change_presence(status=Status.idle, activity=None)
        
        await interaction.edit_original_response(
            embed=Embed(
                title="WOD: Give Up",
                description="Game ended. Better luck next time!",
                colour=Colour.from_rgb(255, 255, 255)
            )
        )

    @wod.sub_command(name="board", description="Show the game board again if it got buried by chat")
    async def board(self, interaction: ApplicationCommandInteraction):
        await interaction.response.defer()
        wod_game = self.bot.wod_games.get(interaction.channel.id)  # type: ignore

        if wod_game is None:
            await interaction.edit_original_response(
                embed=Embed(
                    title="WOD Error",
                    description="There is no game in progress in this channel.",
                    colour=Colour.red(),
                )
            )
            return

        message = wod_game["message"]

        if message is None:
            await interaction.edit_original_response(
                embed=Embed(
                    title="WOD Error",
                    description="No game board exists yet.",
                    colour=Colour.red(),
                )
            )
            return

        wod_game["message"] = await interaction.edit_original_response(content=message.content)
        await message.delete()


def setup(bot: commands.InteractionBot):
    bot.add_cog(WODCog(bot))