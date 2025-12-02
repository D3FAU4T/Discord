import os
from pymongo import MongoClient
from disnake import Intents, Status
from disnake.ext.commands import InteractionBot
from dotenv import load_dotenv

load_dotenv(dotenv_path=".env.production.local")
DISCORD_TOKEN = os.getenv("DISCORD_TOKEN")
MONGODB_TOKEN = os.getenv("MONGODB_URI")

if not DISCORD_TOKEN:
    raise ValueError("`DISCORD_TOKEN` environment variable not set")

intents = Intents(
    dm_messages=True,
    guilds=True,
    guild_messages=True,
    members=True,
    message_content=True,
    voice_states=True,
)

bot = InteractionBot(intents=intents)
bot.d3mantles = {} # type: ignore
bot.wod_games = {} # type: ignore
bot.db_collection = None # type: ignore
bot.i18n.load("Locale")
bot.load_extensions("Commands")

if MONGODB_TOKEN:
    mongodb = MongoClient(MONGODB_TOKEN)
    db = mongodb["Discord"]
    bot.db_collection = db["Demantle"] # type: ignore

bot.load_extension("Events.on_message")

@bot.event
async def on_ready():
    guild_ids = [guild.id for guild in bot.guilds]
    bot._test_guilds = tuple(guild_ids)
    await bot._sync_application_commands()
    print(f"Logged in as {bot.user}")
    await bot.change_presence(
        activity=None,
        status=Status.idle,
    )


bot.run(DISCORD_TOKEN)
