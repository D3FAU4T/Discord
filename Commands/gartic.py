import os
import json
import math
from disnake import ApplicationCommandInteraction, Localized, Option, OptionType, Embed, Colour
from disnake.ext.commands import slash_command, InteractionBot

def localize(interaction: ApplicationCommandInteraction, key: str, fallback_str: str) -> str:
    return interaction.bot.i18n.get(key).get(str(interaction.locale), fallback_str)


@slash_command(
    name="gartic",
    description=Localized(key="GARTIC_DESCRIPTION")
)
async def gartic(_interaction: ApplicationCommandInteraction):
    pass


@gartic.sub_command(
    name="calculate_level",
    description=Localized(key="CALC_LEVEL_DESCRIPTION"),
    options=[
        Option(
            name="garticos",
            description=Localized(key="CALC_LEVEL_GARTICOS_DESCRIPTION"),
            required=True,
            type=OptionType.integer
        )
    ]
)
async def calculate_level(interaction: ApplicationCommandInteraction, garticos: int):
    await interaction.response.defer()

    levels = 0
    points = 0
    bonus_points = 0
    while (points + bonus_points) < garticos:
        levels += 1
        points += 1
        if levels % 15 ==0:
            bonus_points += math.floor(levels / 15) * 5

    target_garticos_str = localize(interaction, "TARGET_GARTICOS", "Target Garticos")
    required_points_str = localize(interaction, "REQUIRED_POINTS", "Required points")
    bonus_str = localize(interaction, "BONUS_COUNTED", "Bonuses counted")

    await interaction.edit_original_response(
        embed=Embed(
            title=localize(interaction, "GARTIC_CALC", "Gartic Calculator"),
            description=f":dart: {target_garticos_str} {garticos}\n:100: {required_points_str}: {levels}\n:rocket: **{bonus_str}**",
            colour=Colour.blue()
        ).set_author(
            name="GarticBOT",
            url="https://garticbot.gg",
            icon_url="https://media.discordapp.net/attachments/993276383591665796/1050448830455349289/favicon.png"
        ).set_footer(
            text="Embed auto created by d3fau4tbot",
            icon_url=interaction.guild.icon.url if interaction.guild and interaction.guild.icon else None
        )
    )


@gartic.sub_command(
    name="calculate_points",
    description=Localized(key="CALC_POINTS_DESCRIPTION"),
    options=[
        Option(
            name="level",
            description=Localized(key="CALC_POINTS_LEVEL_DESCRIPTION"),
            required=True,
            type=OptionType.integer
        )
    ]
)
async def calculate_points(interaction: ApplicationCommandInteraction, level: int):
    await interaction.response.defer()

    temp = math.floor(level / 15)
    garticos_gained = level + (5 * temp * (temp + 1)) / 2

    title = localize(interaction, "GARTIC_CALC", "Gartic Calculator")
    target_level = localize(interaction, "TARGET_LEVEL", "Target Level")
    garticos_gained_str = localize(interaction, "GARTICOS_GAINED", "Garticos gained")
    bonuses = localize(interaction, "BONUS_COUNTED", "Bonuses counted")

    await interaction.edit_original_response(
        embed=Embed(
            title=title,
            description=f":dart: **{target_level}:** {level}\n:moneybag: **{garticos_gained_str}:** {garticos_gained:.0f}\n:rocket: **{bonuses}**",
            colour=Colour.blue()
        ).set_author(
            name="GarticBOT",
            url="https://garticbot.gg",
            icon_url="https://media.discordapp.net/attachments/993276383591665796/1050448830455349289/favicon.png"
        ).set_footer(
            text="Embed auto created by d3fau4tbot",
            icon_url=interaction.guild.icon.url if interaction.guild and interaction.guild.icon else None
        )
    )

@gartic.sub_command(
    name="find",
    description="Get the gartic answer for a query if exists in English gos dictionary",
    options=[
        Option(
            name="query",
            description="Paste the gartic hint here that looks like this: C _ _ _ _ _ _ _ _",
            required=True,
            type=OptionType.string,
        )
    ]
)
async def find(interaction: ApplicationCommandInteraction, query: str):
    await interaction.response.defer()

    with open(os.path.join("Config", "gos.json"), 'r', encoding='utf-8') as f:
        text: list[str] = json.loads(f.read())

    stripped = (query
        .replace('"', '')
        .replace('​\n:point_right: ', '')
        .replace('\n', '')
        .replace('\\', '')
    )

    dynamic_pattern = '^' + stripped[0].lower() if stripped else '^'
    stripped = stripped[1:].strip() if len(stripped) > 1 else ''

    if '  ' in stripped:
        words = stripped.split('  ')
    else:
        words = stripped.split(' ​ ​')

    for word in words:
        underscores = 0
        for i in range(len(word)):
            if word[i] == '-':
                dynamic_pattern += f'\\w{{{underscores}}}-'
                underscores = 0
            elif word[i] == '_':
                underscores += 1
        dynamic_pattern += f'\\w{{{underscores}}}\\s'

    if dynamic_pattern.endswith('\\s'):
        dynamic_pattern = dynamic_pattern[:-2]

    import re
    regex = re.compile(dynamic_pattern + '$', re.IGNORECASE)
    matches = [word for word in text if regex.match(word)]

    results = sorted(matches)
    word = query.upper()

    description = ",  ".join(results) if results else "No answers found"

    await interaction.edit_original_response(
        embed=Embed(
            title=f"Possible answers for the query:\n `{word}`",
            description=description,
            colour=Colour.blue()
        ).set_author(
            name="Gartic",
            icon_url="https://gartic.com/favicon.ico",
            url="https://gartic.com"
        )
    )

def setup(bot: InteractionBot):
    bot.add_slash_command(gartic)