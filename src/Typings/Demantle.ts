import { Message } from "discord.js";

export const enum HiddenWordType {
  Senior = 1,
  Random = 2
}

export interface GuessData {
  guesser: string;
  word: string;
  similarity: number;
  gettingClose: string;
}

// Enums for ResponseType for less confusion of Reason names
export const enum ResponseType {
  InvalidWord = "unknownWord",
  Found = "found",
  AlreadyExists = "delDuplicate",
  EditSelfMessageContent = "editSelfMessageContent",
  UpdateInitialMessage = "deletemsgUpdatemsgSendmsgUpdateBool",
  UpdateInitialMessageEdit = "deletemsgSendselfeditedmsgUpdatemsg"
}

export interface d3mantleConfig {
  hiddenWord: string;
  findTheWord: boolean;
  message: Message<boolean> | null;
  initialMessage: boolean;
}

export interface responses {
  reason: ResponseType;
  message: string;
  initialMessage: Message<boolean> | null;
  word?: string;
  scoreboard?: string;
  guessLength?: number;
  guesses: GuessData[];
  indexes: string[];
}

export interface metaData { 
    guesses: GuessData[];
    indexes: string[];
}