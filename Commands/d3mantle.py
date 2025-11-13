from Demantle.game import Demantle
from disnake.ext import commands
from disnake import (
    Activity,
    ActivityType,
    ApplicationCommandInteraction,
    Colour,
    Embed,
    Option,
    OptionType,
    Status,
    TextChannel,
)

class D3mantleCog(commands.Cog):
    def __init__(self, bot: commands.InteractionBot):
        self.bot = bot

    async def validation(self, interaction: ApplicationCommandInteraction):
        if not interaction.channel:
            await interaction.edit_original_response(content="This command can only be used in a text channel.")
            return False

        if not interaction.guild or not isinstance(interaction.channel, TextChannel):
            await interaction.edit_original_response(content="This command is designed to be used in Server text channels only.")
            return False

        if interaction.channel.name != "d3mantle":
            await interaction.edit_original_response(
                embed=Embed(
                    title="Channel Restriction",
                    description="You can only run this command in the `d3mantle` channel due to spamming nature of the game. "
                                "If the channel doesn't exist, please ask a server admin to create one named exactly `d3mantle`.",
                    colour=Colour.red()
                )
            )
            return False
        return True

    async def start_new_game(self, interaction: ApplicationCommandInteraction, game_type: str):
        channel = interaction.channel.id

        if channel in self.bot.d3mantles: # type: ignore
            await interaction.edit_original_response(
                embed=Embed(
                    title="D3mantle Error",
                    description="A game is already in progress in this channel.",
                    colour=Colour.red()
                )
            )
            return

        self.bot.d3mantles[channel] = { # type: ignore
            "game": Demantle(game_type),
            "ignore_ids": [],
            "message": None,
        }

        await self.bot.change_presence(
            status=Status.online,
            activity=Activity(
                name='d3mantle',
                state="Random word" if game_type == "random" else "Daily word",
                type=ActivityType.playing
            )
        )

        await interaction.edit_original_response(
            embed=Embed(
                title=f"D3mantle: {game_type.capitalize()} Word",
                description="Game initiated! You can start guessing already!",
                colour=Colour.gold()
            )
        )

    @commands.slash_command(
        name="d3mantle",
        description="Play a game of D3mantle (Discord port of Semantle)"
    )
    async def d3mantle(self, interaction: ApplicationCommandInteraction):
        # just a base group command; subcommands below
        pass

    @d3mantle.sub_command(name="random", description="Start a game with a random word")
    async def random_game(self, interaction: ApplicationCommandInteraction):
        await interaction.response.defer()
        if await self.validation(interaction):
            await self.start_new_game(interaction, "random")

    @d3mantle.sub_command(name="daily", description="Start a game with the daily word")
    async def daily_game(self, interaction: ApplicationCommandInteraction):
        await interaction.response.defer()
        if await self.validation(interaction):
            await self.start_new_game(interaction, "daily")

    @d3mantle.sub_command(
        name="give_up",
        description="Give up on the current game",
        options=[
            Option(
                name="show_publicly",
                description="Do you want to show the answer publicly?",
                required=True,
                type=OptionType.boolean,
            )
        ]
    )
    async def give_up(self, interaction: ApplicationCommandInteraction, show_publicly: bool):
        await interaction.response.defer()
        demantle = self.bot.d3mantles.get(interaction.channel.id) # type: ignore

        if demantle is None:
            await interaction.edit_original_response(
                embed=Embed(
                    title="D3mantle Error",
                    description="There is no game in progress in this channel.",
                    colour=Colour.red(),
                )
            )
            return

        word = demantle["game"].word

        if show_publicly:
            del self.bot.d3mantles[interaction.channel.id] # type: ignore
            if not self.bot.d3mantles: # type: ignore
                await self.bot.change_presence(status=Status.idle, activity=None)

            await interaction.edit_original_response(
                embed=Embed(
                    title="D3mantle: Give Up",
                    description=f"No one guessed the word. It was: **{word}**",
                    colour=Colour.from_rgb(255, 255, 255)
                )
            )

        else:
            demantle["ignore_ids"].append(interaction.user.id)
            await interaction.edit_original_response(
                embed=Embed(
                    title="D3mantle: Give Up",
                    description=f"You've given up the game. Your guesses will be ignored onwards.\n"
                                f"The word was `{word}`",
                    colour=Colour.from_rgb(255, 255, 255)
                )
            )

    @d3mantle.sub_command(name="show_board", description="Show the game board again if it got buried by chat")
    async def show_board(self, interaction: ApplicationCommandInteraction):
        await interaction.response.defer()
        demantle = self.bot.d3mantles.get(interaction.channel.id) # type: ignore

        if demantle is None:
            await interaction.edit_original_response(
                embed=Embed(
                    title="D3mantle Error",
                    description="There is no game in progress in this channel.",
                    colour=Colour.red(),
                )
            )
            return

        message = demantle["message"]

        if message is None:
            await interaction.edit_original_response(
                embed=Embed(
                    title="D3mantle Error",
                    description="No game board exists yet. Make your first guess to generate the board!",
                    colour=Colour.red(),
                )
            )
            return

        demantle["message"] = await interaction.edit_original_response(content=f"Sure, here's the board again:\n{message.content}")
        await message.delete()


def setup(bot: commands.InteractionBot):
    bot.add_cog(D3mantleCog(bot))
