import io
import requests
from disnake.ext.commands import slash_command, InteractionBot
from disnake import (
    ApplicationCommandInteraction,
    Embed,
    File,
    Option,
    OptionType,
)

@slash_command(
    name="define",
    description="Get the definition for a word",
    options=[
        Option(
            name="word",
            description="Type the word you want definition for",
            required=True,
            type=OptionType.string
        )
    ]
)
async def define_command(interaction: ApplicationCommandInteraction, word: str):
    await interaction.response.defer()

    query = word.strip()
    url = f"https://api.dictionaryapi.dev/api/v2/entries/en/{query}"

    try:
        response = requests.get(url)
    except Exception as e:
        return await interaction.edit_original_response(
            embed=Embed(
                title="Dictionary API Error",
                description=f"Failed to connect to the API.\n`{e}`",
                color=0xFF0000,
            )
        )

    if response.status_code != 200:
        return await interaction.edit_original_response(
            embed=Embed(
                title="Dictionary API Error",
                description=f"The server declined our request: `{response.reason}`",
                color=0xFF0000,
            )
        )

    data = response.json()

    if not isinstance(data, list) or not data or not data[0].get("meanings"):
        return await interaction.edit_original_response(
            embed=Embed(
                title="Dictionary API Error",
                description=f"Definition not found for the word: **{query}**",
                color=0xFF0000,
            )
        )

    entry = data[0]
    phonetics = entry.get("phonetics", [])
    phonetic_text = next((p.get("text") for p in phonetics if p.get("text")), "No phonetics available")
    phonetic_audio = next((p.get("audio") for p in phonetics if p.get("audio")), None)
    word_display = entry.get("word", query)

    # --- Build description ---
    text = f"# {word_display.capitalize()}\n{phonetic_text}\n\n"

    for meaning in entry.get("meanings", []):
        part_of_speech = meaning.get("partOfSpeech", "unknown")
        text += f"**{part_of_speech}**\n"
        definitions = meaning.get("definitions", [])
        for i, definition in enumerate(definitions):
            def_text = definition.get("definition", "No definition found.")
            example = definition.get("example")
            if len(definitions) > 1:
                text += f"### {i + 1}. {def_text}\n"
            else:
                text += f"### {def_text}\n"
            if example:
                text += f"-# \"{example}\"\n"
        text += "\n"

    embed = Embed(description=text, color=0x00FF00)

    # --- Handle audio attachment ---
    if phonetic_audio:
        try:
            audio_response = requests.get(phonetic_audio)
            audio_bytes = io.BytesIO(audio_response.content)
            file = File(audio_bytes, filename=f"{word_display}.mp3")
            await interaction.edit_original_response(embed=embed, file=file)
            return None
        except Exception as e:
            print(f"Audio fetch error: {e}")

    await interaction.edit_original_response(embed=embed)
    return None


def setup(bot: InteractionBot):
    bot.add_slash_command(define_command)
