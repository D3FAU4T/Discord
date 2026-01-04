import os
import copy
from pymongo import MongoClient
from disnake import Intents, Status
from disnake.ext.commands import InteractionBot
from disnake.app_commands import SlashCommand
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

# Monkey patch to filter subcommands based on guild_ids defined in extras
_original_ordered_unsynced = bot._ordered_unsynced_commands

def _custom_ordered_unsynced_commands(test_guilds=None):
    """Custom implementation that filters subcommands based on their extras.guild_ids."""
    global_cmds, guilds = _original_ordered_unsynced(test_guilds)
    
    subcommand_restrictions = {}
    for cmd_name, cmd in bot.all_slash_commands.items():
        if hasattr(cmd, 'children') and cmd.children:
            for sub_name, subcommand in cmd.children.items():
                if hasattr(subcommand, 'extras') and subcommand.extras:
                    guild_ids = subcommand.extras.get('guild_ids')
                    if guild_ids:
                        if cmd_name not in subcommand_restrictions:
                            subcommand_restrictions[cmd_name] = {}
                        subcommand_restrictions[cmd_name][sub_name] = guild_ids
    
    # Filter subcommands for each guild
    for guild_id, cmd_list in guilds.items():
        new_cmd_list = []
        
        for cmd in cmd_list:
            if not isinstance(cmd, SlashCommand):
                new_cmd_list.append(cmd)
                continue
            
            # Check if this command has subcommand restrictions
            if cmd.name in subcommand_restrictions:
                cmd_copy = copy.deepcopy(cmd)
                
                original_options = list(cmd_copy.options)
                cmd_copy.options = []
                
                for option in original_options:
                    restrictions = subcommand_restrictions[cmd.name]
                    if option.name in restrictions:
                        if guild_id in restrictions[option.name]:
                            cmd_copy.options.append(option)
                    else:
                        cmd_copy.options.append(option)
                
                new_cmd_list.append(cmd_copy)
            else:
                new_cmd_list.append(cmd)
        
        guilds[guild_id] = new_cmd_list
    
    return global_cmds, guilds

bot._ordered_unsynced_commands = _custom_ordered_unsynced_commands

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
