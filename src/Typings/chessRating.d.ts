interface last {
    rating: number;
    date: number;
    rd: number;
}

interface best {
    rating: number;
    date: number;
    game: string; // It is a link
}

interface record {
    win: number;
    loss: number;
    draw: number;
    time_per_move?: number;
    timeout_percent?: number;
}

interface chessData {
    last: last;
    best: best;
    record: record;
}

interface rating {
    rating: number;
    date: number;
}

interface score {
    total_attempts: number;
    score: number;
}

export interface chessComRating {
    chess_daily: chessData;
    chess960_daily: chessData;
    chess_rapid: chessData;
    chess_bullet: chessData;
    chess_blitz: chessData;
    tactics: {
        highest: rating;
        lowest: rating;
    },
    puzzle_rush: {
        best: score;
        daily: score;
    }
}