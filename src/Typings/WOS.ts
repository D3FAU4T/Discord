export interface WOSCorrectResponse {
    level: string;
    createdBy: string;
    totalWords: number;
    id: string;
}

export interface WOSErrorResponse {
    error: "Level not found" | "An error occurred";
}

export interface WOSLevel {
    Level: string;
    Language: string;
    column1: WOScolumn[];
    column2: WOScolumn[];
    column3: WOScolumn[];
}

interface WOScolumn {
    word: string;
    username: string;
    locked: boolean;
    index: number;
}