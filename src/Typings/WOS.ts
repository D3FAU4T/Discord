export interface WOSCorrectResponse {
    level: string;
    createdBy: string;
    totalWords: number;
    id: string;
}

export interface WOSErrorResponse {
    error: "Level not found" | "An error occurred";
}