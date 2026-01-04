import os
import json
import random
import math
from disnake.ext import commands
from disnake import (
    Activity,
    ActivityType,
    ApplicationCommandInteraction,
    OptionChoice,
    Colour,
    Embed,
    Option,
    OptionType,
    Status
)

def split_words_into_columns(words: list[str]) -> tuple[list[str], list[str], list[str]]:
    """Split a flat list of words into 3 columns based on array length.
    
    Args:
        words: Flat list of words sorted by length then alphabetically
        
    Returns:
        Tuple of (column1, column2, column3) lists
    """
    array_length = len(words)
    
    # Calculate split index based on array length
    if array_length < 21:
        if array_length > 14:
            split_index = math.ceil((array_length - 4) / 2)
        else:
            split_index = math.ceil(array_length / 3)
    else:
        split_index = 8
    
    # Split into 3 columns
    column1 = words[0:split_index]
    column2 = words[split_index:2 * split_index]
    column3 = words[2 * split_index:]
    
    return column1, column2, column3

def get_author_choices():
    """Dynamically load author choices from custom_levels.json"""
    try:
        with open(os.path.join("Config", "custom_levels.json"), 'r', encoding='utf-8') as f:
            data = json.load(f)
        usernames = data.get('usernames', {})
        return [
            OptionChoice(name=username, value=user_id)
            for user_id, username in usernames.items()
        ]
    except:
        return []

class WODCog(commands.Cog):
    def __init__(self, bot: commands.InteractionBot):
        self.bot = bot

    @commands.slash_command(
        name="wod",
        description="Play a game of WOD",
    )
    async def wod(self, _interaction: ApplicationCommandInteraction):
        # Base group command; subcommands below
        pass

    @wod.sub_command(
        name="custom",
        description="Start a new WOD game with custom levels",
        options=[
            Option(
                name="author",
                description="The author of the custom levels to use",
                required=False,
                type=OptionType.string,
                choices=get_author_choices()
            )
        ]
    )
    async def custom(self, interaction: ApplicationCommandInteraction, author: str | None = None):
        await interaction.response.defer()

        with open(os.path.join("Config", "custom_levels.json"), 'r', encoding='utf-8') as f:
            data: dict = json.load(f)
        
        usernames: dict[str, str] = data.get('usernames', {})
        raw: dict[str, list] = data.get('levels', {})

        # If author is specified, validate it's a real author
        if author:
            if author not in raw:
                await interaction.edit_original_response(
                    embed=Embed(
                        title="WOD Error",
                        description=f"Invalid author selected.",
                        colour=Colour.red()
                    )
                )
                return
            
            if not raw[author]:
                await interaction.edit_original_response(
                    embed=Embed(
                        title="WOD Error",
                        description=f"No levels found for author {usernames.get(author, author)}.",
                        colour=Colour.red()
                    )
                )
                return

            levels: list = raw[author]
            creator_id = author
            random_level: list[str] = random.choice(levels)
        else:
            # Otherwise, use all levels
            levels: list = []
            creator_map: dict = {}
            for creator_id_key, creator_levels in raw.items():
                for level in creator_levels:
                    levels.append(level)
                    creator_map[id(level)] = creator_id_key
            
            if not levels:
                await interaction.edit_original_response(
                    embed=Embed(
                        title="WOD Error",
                        description="No levels available.",
                        colour=Colour.red()
                    )
                )
                return
            
            random_level: list[str] = random.choice(levels)
            creator_id = creator_map.get(id(random_level), "Unknown")
        
        creator_name = usernames.get(creator_id, "Unknown")
        
        # Split the flat word array into 3 columns
        if not random_level:
            await interaction.edit_original_response(content="Error: No valid words in this level.")
            return
            
        col1, col2, col3 = split_words_into_columns(random_level)
        
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
            "creator_name": creator_name,
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

        creator_name = wod_game.get("creator_name", "Unknown")
        
        del self.bot.wod_games[interaction.channel.id]  # type: ignore
        
        if not self.bot.wod_games:  # type: ignore
            await self.bot.change_presence(status=Status.idle, activity=None)
        
        await interaction.edit_original_response(
            embed=Embed(
                title="WOD: Give Up",
                description=f"Game ended. Better luck next time!\n\n**Level by:** {creator_name}",
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

    @wod.sub_command(
        name="original",
        description="Start a new WOD game with original levels from bandedotter leak",
        extras={"guild_ids": [1310251717807575131]}
    )
    async def original(self, interaction: ApplicationCommandInteraction):
        await interaction.response.defer()

        with open(os.path.join("Config", "levels.json"), 'r', encoding='utf-8') as f:
            levels: list[list[str]] = json.load(f)
        
        if not levels:
            await interaction.edit_original_response(
                embed=Embed(
                    title="WOD Error",
                    description="No original levels available.",
                    colour=Colour.red()
                )
            )
            return
        
        random_level: list[str] = random.choice(levels)
        creator_name = "Onrizon Games"
        
        # Split the flat word array into 3 columns
        if not random_level:
            await interaction.edit_original_response(content="Error: No valid words in this level.")
            return
            
        col1, col2, col3 = split_words_into_columns(random_level)
        
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
            "creator_name": creator_name,
        }

        await self.bot.change_presence(
            status=Status.online,
            activity=Activity(
                name='WOD',
                state="Words on Discord",
                type=ActivityType.playing
            )
        )


def setup(bot: commands.InteractionBot):
    bot.add_cog(WODCog(bot))