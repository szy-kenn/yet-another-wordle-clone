// custom types 
export type GameState = {
    guesses?: string[];
    wordToGuess: string;
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