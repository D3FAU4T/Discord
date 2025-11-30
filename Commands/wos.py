import os
import json
import random
from disnake import ApplicationCommandInteraction, ButtonStyle, MessageInteraction
from disnake.ext.commands import slash_command, InteractionBot
from disnake.ui import Button, View

@slash_command(
    name="wos",
    description="Play a game of WOS with custom levels",
)
async def wos(interaction: ApplicationCommandInteraction):
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
    
    if channel_id in interaction.bot.wos_games: # type: ignore
        await interaction.edit_original_response(content="A game is already in progress in this channel.")
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
    
    view = View()
    
    async def give_up_callback(button_interaction: MessageInteraction):
        if channel_id in interaction.bot.wos_games:  # type: ignore
            del interaction.bot.wos_games[channel_id]  # type: ignore
            await button_interaction.response.send_message(content=f"Game ended. Better luck next time!")
        else:
            await button_interaction.response.send_message(content="Game is not in progress.", ephemeral=True)
    
    give_up_button = Button(label="Give Up", style=ButtonStyle.red, custom_id="wos_give_up")
    give_up_button.callback = give_up_callback
    view.add_item(give_up_button)
    
    game_message = await interaction.edit_original_response(content=f"```\nLetters: {letters_display}\n\n{masked_display}```", view=view)
    
    interaction.bot.wos_games[channel_id] = { # type: ignore
        "all_words": set(all_words),
        "valid_letters": valid_letters,
        "level": random_level,
        "guesses": [],
        "revealed_words": set(),
        "message": game_message,
        "valid_word": valid_word,
    }

def setup(bot: InteractionBot):
    bot.add_slash_command(wos)