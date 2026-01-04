import os
import json
import regex
import random
import asyncio
import requests
import math
from pymongo import ReturnDocument
from disnake import Message, MessageFlags, Status, AllowedMentions, ChannelType
from disnake.ui import Section, TextDisplay, Thumbnail
from disnake.ext.commands import Cog

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

class OnMessageCog(Cog):
    def __init__(self, bot):
        self.bot = bot
        with open(os.path.join("Config", "emotes.json"), 'r', encoding='utf-8') as emote_file:
            self.emotes: dict[str, str] = json.loads(emote_file.read())

        # Regexes
        self.emoji_regex = regex.compile(r'[\p{Emoji_Presentation}\p{Emoji}\u200d]+', flags=regex.UNICODE)
        self.mention_regex = regex.compile(r"^<@\d+>")
        self.github_regex = regex.compile(r"https:\/\/github\.com\/([\w.-]+)\/([\w.-]+)\/blob\/([\w\d]+)\/([^#\s]+)(?:#L(\d+)(?:-L(\d+))?)?")
        
        # Albie Weekes jokes - load from JSON and shuffle
        with open(os.path.join("Config", "albie_weekes_jokes.json"), 'r', encoding='utf-8') as jokes_file:
            jokes_data: dict = json.loads(jokes_file.read())
            self.albie_jokes: list[str] = jokes_data.get("jokes", [])
        random.shuffle(self.albie_jokes)

    @Cog.listener()
    async def on_message(self, message: Message):
        if message.author.bot or not message.guild:
            return

        perms = message.channel.permissions_for(message.guild.me)
        if not perms.send_messages:
            return

        words = message.content.lower().split()

        # Emotes handling
        for word in set(words):
            if word in self.emotes:
                if message.reference and message.reference.message_id:
                    try:
                        referenced_message = await message.channel.fetch_message(message.reference.message_id)
                        await referenced_message.reply(self.emotes[word])
                    except:
                        await message.reply(self.emotes[word])
                else:
                    await message.reply(self.emotes[word])

        # Draco easter egg
        if words and words[0] == '!slots':
            foods = ['🍕', '🍔', '🍟', '🌭', '🥪', '🥙', '🧆', '🍗', '🍖', '🥩', '🥓', '🍳', '🧇', '🥞', '🫓', '🍞', '🥐', '🥖', '🫒', '🧈', '🧀', '🍤', '🍣', '🍜', '🍲', '🍛', '🍚', '🍙', '🍘', '🍥', '🥠', '🥡']
            slot_machine = f"| {random.choice(foods)} | {random.choice(foods)} | {random.choice(foods)} |"
            parts = [p.strip() for p in slot_machine.split('|') if p.strip()]
            is_win = len(set(parts)) == 1
            if is_win:
                await message.reply(f"🎉 JACKPOT! 🎉\n{slot_machine}\n<@195261052236070912> will congratulate you!")
            else:
                await message.reply(f"You got {slot_machine} and lost `-100` gambling aura points!\n-# Note: Points are purely decorative and have no real value. The bot does not keep a track of it.")
        elif words and words[0] == '!slost':
            emote = 'UHMDude' if message.author.id == "195261052236070912" else 'DIESOFCRINGE'
            await message.reply(self.emotes.get(emote.lower(), emote))

        # Github Link handling
        github_match = self.github_regex.search(message.content)
        if github_match:
            user, repo, commit, file_path, line_start_str, line_end_str = github_match.groups()
            if not all([user, repo, commit, file_path]):
                return
            raw_url = f'https://raw.githubusercontent.com/{user}/{repo}/{commit}/{file_path}'
            try:
                resp = await asyncio.to_thread(requests.get, raw_url)
                if not resp.ok:
                    raise Exception(f'Fetch failed with status {resp.status_code}')
                code = resp.text
                lines = code.split('\n')
                line_start = int(line_start_str) if line_start_str else None
                line_end = int(line_end_str) if line_end_str else line_start
                if line_start is not None:
                    start = max(line_start - 1, 0)
                    end = line_end if line_end is not None else start + 1
                    snippet = '\n'.join(lines[start:end])
                else:
                    snippet = code
                lang = file_path.split('.')[-1] if '.' in file_path else ''
                max_length = 1900
                preview = snippet[:max_length] + '\n...' if len(snippet) > max_length else snippet
                await message.reply(f'```{lang}\n{preview}\n```', allowed_mentions=AllowedMentions.none())
            except:
                pass

        # WOD handling
        if len(self.bot.wod_games) > 0 and message.channel.id in self.bot.wod_games:  # type: ignore
            wod_game = self.bot.wod_games[message.channel.id]  # type: ignore

            if (
                    len(self.emoji_regex.findall(message.content)) > 0
                    or len(message.attachments) > 0
                    or "https://" in message.content
                    or len(words) != 1
            ):
                return

            guess_word = words[0].lower()

            # Invalid guess
            if guess_word not in wod_game["all_words"]:
                await message.delete()
                return

            async def generate_wod_display(highlight_word=None):
                """Generate the WOD game display with optional highlighting"""
                # Split the flat word array into 3 columns
                col1, col2, col3 = split_words_into_columns(wod_game["level"])
                
                max_rows = max(len(col1), len(col2), len(col3))
                
                masked_display = ''
                for i in range(max_rows):
                    words_row = [
                        col1[i] if i < len(col1) else '',
                        col2[i] if i < len(col2) else '',
                        col3[i] if i < len(col3) else ''
                    ]
                    
                    formatted_words = []
                    for word in words_row:
                        if word.lower() in wod_game["revealed_words"]:
                            if highlight_word and word.lower() == highlight_word:
                                formatted_words.append(f"**{word.lower()}**")
                            else:
                                formatted_words.append(word.lower())
                        else:
                            formatted_words.append(''.join('x' if c != ' ' else ' ' for c in word))
                    
                    row = f"{formatted_words[0]:<10} {formatted_words[1]:<10} {formatted_words[2]:<10}"
                    masked_display += row + '\n'
                
                scrambled_letters = wod_game["valid_letters"].copy()
                random.shuffle(scrambled_letters)
                letters_display = ' '.join(scrambled_letters).upper()
                
                return f"```\nLetters: {letters_display}\n\n{masked_display}```"

            # Already guessed
            if guess_word in wod_game["revealed_words"]:
                await message.delete()
                content = await generate_wod_display(highlight_word=guess_word)
                wod_game["message"] = await wod_game["message"].edit(content=content)
                return

            perms_to_del = perms.manage_messages or perms.administrator
            if not perms_to_del:
                await message.channel.send(
                    content="I need the `Manage Messages` permission to delete your guesses for a smooth experience.")
                return

            wod_game["guesses"].append(guess_word)
            wod_game["revealed_words"].add(guess_word)

            # Win condition - all words guessed
            is_game_won = set(wod_game["guesses"]) == wod_game["all_words"]

            await message.delete()
            
            content = await generate_wod_display()
            if wod_game["message"] is not None:
                wod_game["message"] = await wod_game["message"].edit(content=content)
            
            if is_game_won:
                creator_name = wod_game.get("creator_name", "Unknown")
                
                del self.bot.wod_games[message.channel.id]  # type: ignore
                
                if not self.bot.wod_games:  # type: ignore
                    await self.bot.change_presence(status=Status.idle, activity=None)
                
                await message.channel.send(f"🎉 **All Words Guessed!**\n**Level by:** {creator_name}")

        # D3mantle handling
        if len(self.bot.d3mantles) > 0 and message.channel.id in self.bot.d3mantles:  # type: ignore
            demantle = self.bot.d3mantles[message.channel.id]  # type: ignore

            if (
                    len(self.emoji_regex.findall(message.content)) > 0
                    or len(message.attachments) > 0
                    or "https://" in message.content
                    or len(words) != 1
                    or message.author.id in demantle["ignore_ids"]
            ):
                return

            perms_to_del = perms.manage_messages or perms.administrator

            if not perms_to_del:
                await message.channel.send(
                    content="I need the `Manage Messages` permission to delete your guesses for a smooth experience.")

            guess_result = demantle["game"].guess(words[0], message.author.name)

            # Win condition
            if guess_result["success"] and words[0] == demantle["game"].word:
                updated_stats = None

                if self.bot.db_collection is not None:
                    updated_stats = self.bot.db_collection.find_one_and_update(
                        {"userId": str(message.author.id)},
                        {"$inc": {"wins": 1}},
                        upsert=True,
                        return_document=ReturnDocument.AFTER
                    )

                wins = "Cannot fetch from database"

                if updated_stats and "wins" in updated_stats:
                    wins = updated_stats["wins"]
                else:
                    await message.channel.send(
                        "An error occurred while updating your stats. Please report this issue to the developer.")

                if demantle["message"]:
                    await demantle["message"].edit(guess_result["table"])

                # Build the content text
                content_lines = [
                    f"# {message.author.display_name} 🎉",
                    f"🏆 **Word**: {demantle["game"].word}",
                    f"🏅 **Wins**: `{wins}`",
                    f"🔢 **Number of guesses**: `{len(demantle["game"].guesses)}`"
                ]

                content = "\n".join(content_lines)

                section = Section(
                    TextDisplay(content=content),
                    accessory=Thumbnail(media=message.author.display_avatar.url),
                )

                await message.channel.send(
                    content=None,
                    components=[section],
                    flags=MessageFlags(
                        is_components_v2=True
                    )
                )

                del self.bot.d3mantles[message.channel.id]  # type: ignore

                if len(self.bot.d3mantles) == 0:  # type: ignore
                    await self.bot.change_presence(
                        activity=None,
                        status=Status.idle
                    )

            # If message is successful but no table cached
            elif guess_result["success"] and demantle["message"] is None:
                await message.delete()
                demantle["message"] = await message.channel.send(guess_result["table"])

            # Any guess after first: If guess is successful and first table cached
            elif guess_result["success"] and demantle["message"]:
                await message.delete()
                demantle["message"] = await demantle["message"].edit(guess_result["table"])

            # First guess: Invalid guess
            elif guess_result["success"] and not demantle["message"]:
                author_id = message.author.id
                await message.delete()
                demantle["message"] = await message.channel.send(f"<@{author_id}> I have no idea what that is X\\_X")

            elif not guess_result.get("success") and demantle.get("message"):
                await message.delete()
                original_content = demantle["message"].content or ""

                lines = original_content.split("\n")
                table_start_index = next((i for i, line in enumerate(lines) if not self.mention_regex.match(line)), -1)
                game_table = "\n".join(lines[table_start_index:]) if table_start_index != -1 else original_content

                if guess_result.get("error") == "invalid_guess":
                    new_content = f"<@{message.author.id}> I have no idea what `{words[0]}` is X\\_X\n{game_table}"
                else:
                    new_content = f"<@{message.author.id}> The word `{words[0]}` has already been guessed!\n{game_table}"

                demantle["message"] = await demantle["message"].edit(content=new_content)

        # Server: Nugs, personal
        if message.guild.id in [1310251717807575131, 871594906907451402]:
            # Albie Weekes joke
            if words[0] == 'albie' and words[1] == 'weekes':
                # Refill and shuffle if empty
                if not self.albie_jokes:
                    with open(os.path.join("Config", "albie_weekes_jokes.json"), 'r') as jokes_file:
                        jokes_data: dict = json.loads(jokes_file.read())
                        self.albie_jokes = jokes_data.get("jokes", [])
                    random.shuffle(self.albie_jokes)
                
                # Pop and reply with joke
                joke = self.albie_jokes.pop()
                await message.reply(joke)

            # "Re" prefix joke handling
            if message.channel.type == ChannelType.text and message.channel.name == "d3mantle":
                return

            re_words = [word for word in words if word.lower().startswith("re") and len(word) > 2]

            if (len(re_words) == len(words) and len(words) > 1) or len(re_words) > 7:
                await message.add_reaction("🤡")
                word_list = "\n".join(f"- {word[2:]} again" for word in re_words)
                await message.reply(f"To:\n{word_list}")
            elif len(words) == 1 and len(re_words) == 1:
                word_without_re = words[0][2:]
                await message.reply(f"To {word_without_re} again 🤡")

        print(f"[{message.guild.name}] {message.author.name}: {message.content}")


def setup(bot):
    bot.add_cog(OnMessageCog(bot))