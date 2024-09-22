// custom types
export type Stats =
  | "gamesPlayed"
  | "gamesWon"
  | "winRate"
  | "currentStreak"
  | "longestStreak";
export type Theme = "light" | "dark";
export type Mode = "normal" | "hard";
export type NoteType = "info" | "message" | "error" | "warning" | "system";

export type GameState = {
  guesses?: string[];
  wordToGuess: string;
  ttl: number;
  triggered?: number;
};

export type UserData = {
  gamesPlayed: number;
  gamesWon: number;
  winRate: number;
  currentStreak: number;
  longestStreak: number;
  guessDistribution: number[];
};

export type Settings = {
  theme: Theme;
  mode: Mode;
};

export type Evaluation = {
  word: string;
  result: string[];
  correctLetters: () => number;
};
