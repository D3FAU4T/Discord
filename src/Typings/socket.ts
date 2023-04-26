type ClientConnect = [
    "D3_connect",
    {
        message: string;
        gameId: number;
    }
]

type ClientGuess = [
    "D3_guess",
    {
        gameType: "Random" | "Today" | "Connect";
        gameId: string;
        guess: string;
        guesser: string;
    }
]

type ClientGiveUp = [
    "D3_giveup",
    {
        gameType: "Random" | "Today" | "Connect",
        gameId: string;
    }
]

type ClientRequestData = [
    "D3_requestData",
    { 
        gameType: "Random" | "Today" | "Connect",
        gameId: string;
    }
]

type ClientDisconnect = [
    "D3_disconnect",
    {
        message: string;
        gameId: string;
    }
]

export interface socketMessageClient {
    Client: ClientConnect | ClientGuess | ClientGiveUp | ClientRequestData | ClientDisconnect;
}

export interface socketMessageServer {
    Server: ClientConnect;
}