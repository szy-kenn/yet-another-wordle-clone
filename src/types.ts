// custom types 
export type GameState = {
    guesses?: string[];
    wordToGuess: string;
    ttl: number;
};

export type UserData = {
    gamesPlayed: number;
    gamesWon: number;
    winRate: number;
    currentStreak: number;
    longestStreak: number;
    guessDistribution: number[];
}

export type Stats = 'gamesPlayed' | 'gamesWon' | 'winRate' | 'currentStreak' | 'longestStreak';

export type Evaluation = {
    word: string;
    result: string[];
    correctLetters: () => number;
}