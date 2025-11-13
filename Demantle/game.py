import os
import json
import math
import requests
from prettytable import PrettyTable
from typing import Any

class Demantle:
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))

    with open(os.path.join(BASE_DIR, "BritishEnglish.json"), "r", encoding="utf-8") as f:
        british_english: dict[str, str] = json.load(f)

    def __init__(self, game_type: str):
        self.word: str = "d3fau4t"
        self.vector: list[float] = []
        self.guesses: list[str] = []
        self.table = []
        self.game_type = game_type
        self.set_hidden_word(None)

    def set_hidden_word(self, word: str | None):

        if word:
            self.word = word
            vec = Demantle.get_vector(self.word, self.word)
            self.vector = vec["vec"] if vec else []
            return

        with open(os.path.join(self.BASE_DIR, "English.json"), "r", encoding="utf-8") as file:
            word_list: list[str] = json.load(file)

        if self.game_type.lower() == "random":
            import random
            self.word = random.choice(word_list) or "d3fau4t"
            vec = Demantle.get_vector(self.word, self.word)
            self.vector = vec["vec"] if vec else []
        else:
            import time
            now = int(time.time() * 1000)
            today = math.floor(now / 86400000)
            initial_day = 19021
            puzzle_number = (today - initial_day) % len(word_list)
            self.word = word_list[puzzle_number] if puzzle_number < len(word_list) else "d3fau4t"
            vec = Demantle.get_vector(self.word, self.word)
            self.vector = vec["vec"] if vec else []

    @staticmethod
    def load_json(file_path: str) -> list[str] | None:
        if not os.path.exists(file_path):
            return None

        with open(file_path, "r", encoding="utf-8") as file:
            return json.load(file)

    @staticmethod
    def get_vector(word: str, guess: str):
        res = requests.get(f"https://legacy.semantle.com/model2/{word}/{guess}")
        if "application/json" not in res.headers.get("content-type", ""):
            return None

        return res.json()


    @staticmethod
    def get_similarity(vec_a: list[float], vec_b: list[float]) -> float:
        dot = sum(a * b for a, b in zip(vec_a, vec_b))
        mag_a = math.sqrt(sum(a * a for a in vec_a))
        mag_b = math.sqrt(sum(b * b for b in vec_b))
        return dot / (mag_a * mag_b) if mag_a and mag_b else 0.0

    @staticmethod
    def get_similarity_text(similarity: int, is_percentile: bool = False) -> str:
        if is_percentile:
            if similarity == 1000:
                return "found".ljust(35, " ")
            bars = similarity // 100
            return f"{similarity}/1000 " + "🟩" * bars + "⬛" * (10 - bars)
        else:
            if similarity == 100:
                return "found".ljust(30)
            elif similarity <= 20:
                return "cold".ljust(31)
            elif similarity <= 30:
                return "tepid".ljust(30)
            else:
                return "warm".ljust(31)

    def guess(self, word: str, username: str) -> dict[str, Any]:
        word = word.lower()

        if word in Demantle.british_english:
            word = Demantle.british_english[word]

        if word in self.guesses:
            return {"success": False, "error": "already_guessed"}

        data = Demantle.get_vector(self.word, word)
        if not data:
            return {"success": False, "error": "invalid_guess"}

        self.guesses.append(word)

        similarity = round(Demantle.get_similarity(self.vector, data["vec"]) * 10000) / 100
        getting_close = Demantle.get_similarity_text(
            data.get("percentile", similarity),
            "percentile" in data
        )

        current_guess = {
            "word": word,
            "username": username,
            "similarity": similarity,
            "getting_close": getting_close
        }

        self.table.append(current_guess)
        self.table.sort(key=lambda x: x["similarity"], reverse=True)
        if len(self.table) > 9:
            self.table.pop()

        return {
            "success": True,
            "table": self.get_table(current_guess),
            "current_guess": current_guess
        }

    def get_table(self, current_guess: dict[str, Any]) -> str:
        table = PrettyTable()
        table.field_names = ["From", "#", "Guess", "Similarity", "Getting Close?"]

        easter_eggs = {
            "demon": "demon 😈",
            "angel": "angel 👼",
            "summer": "summer ☀️",
            "love": "love ❤️",
            "heart": "heart ❤️",
            "nugget": "nugget 🐔"
        }

        easter_word = easter_eggs.get(current_guess["word"], current_guess["word"])
        table.add_row([
            current_guess["username"],
            self.guesses.index(current_guess["word"]) + 1,
            easter_word,
            current_guess["similarity"],
            current_guess["getting_close"]
        ])

        table.add_row(["________", "__", "___________", "___________", "__________________________________"])
        table.add_row(["        ", "  ", "           ", "           ", "                                  "])

        for row in self.table:
            table.add_row([
                row["username"],
                self.guesses.index(row["word"]) + 1,
                row["word"],
                row["similarity"],
                row["getting_close"]
            ])

        return f"```\n{table.get_string().replace('-', '').replace('+', '').replace('|', '')}\n```"
