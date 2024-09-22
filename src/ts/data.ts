import { GameState, UserData, Stats, Settings, Theme, Mode } from "./types";
import { wordlist } from "./wordlist";

const wordlistLength = wordlist.length;

let gameState: GameState = JSON.parse(
  localStorage.getItem("gameState"),
) as GameState;
let userData: UserData;
let settings: Settings;

function getRandomInt(min, max) {
  min = Math.ceil(min);

  max = Math.ceil(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function daysIntoYear(date): number {
  return (
    (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) -
      Date.UTC(date.getFullYear(), 0, 0)) /
    24 /
    60 /
    60 /
    1000
  );
}

function getRandomWord() {
  return wordlist[wordlist.length % daysIntoYear(new Date())];
  // return wordlist[getRandomInt(0, wordlistLength)];
}

function getMidnightTime() {
  const now = new Date();
  const mn = new Date(now);
  mn.setHours(24, 0, 0, 0);
  return mn.getTime();
}

export function getTimeBeforeMidnight() {
  // returns time before midnight in milliseconds
  return getMidnightTime() - new Date().getTime();
}

export function initializeGameData() {
  if (gameState == null) {
    let newGameState: GameState = {
      guesses: [],
      // wordToGuess: 'hello',
      wordToGuess: getRandomWord(),
      ttl: getMidnightTime(),
      triggered: 0,
    };

    let newUserData: UserData = {
      gamesPlayed: 0,
      gamesWon: 0,
      winRate: 0,
      currentStreak: 0,
      longestStreak: 0,
      guessDistribution: [0, 0, 0, 0, 0, 0, 0],
    };

    let newSettings: Settings = {
      theme: "light",
      mode: "normal",
    };

    localStorage.setItem("gameState", JSON.stringify(newGameState));
    localStorage.setItem("userData", JSON.stringify(newUserData));
    localStorage.setItem("settings", JSON.stringify(newSettings));

    gameState = newGameState;
    userData = newUserData;
    settings = newSettings;
  } else {
    userData = JSON.parse(localStorage.getItem("userData")) as UserData;
    settings = JSON.parse(localStorage.getItem("settings")) as Settings;
  }

  if (settings == null || localStorage.getItem("theme") != null) {
    if (localStorage.getItem("theme") != null) {
      localStorage.removeItem("theme");
    }

    settings = {
      theme: "light",
      mode: "normal",
    };

    localStorage.setItem("settings", JSON.stringify(settings));
  }
}

export const getUserData = (): UserData => {
  return JSON.parse(localStorage.getItem("userData")) as UserData;
};
export const getGameState = (): GameState => {
  return JSON.parse(localStorage.getItem("gameState")) as GameState;
};
export const getSettings = (): Settings => {
  return JSON.parse(localStorage.getItem("settings")) as Settings;
};

export function newGameState() {
  let newGameState: GameState = {
    guesses: [],
    wordToGuess: getRandomWord(),
    ttl: getMidnightTime(),
    triggered: 0,
  };
  gameState = newGameState;
  localStorage.setItem("gameState", JSON.stringify(gameState));
}

export function updateGameStateGuesses(idx, val) {
  gameState = getGameState();
  gameState.guesses[idx] = val;
  localStorage.setItem("gameState", JSON.stringify(gameState));
}

export function updateStats(stat: Stats, val) {
  if (stat === "gamesPlayed") {
    userData.gamesPlayed = val;
  } else if (stat === "gamesWon") {
    userData.gamesWon = val;
  } else if (stat === "winRate") {
    userData.winRate = val;
  } else if (stat === "currentStreak") {
    userData.currentStreak = val;
  } else if (stat === "longestStreak") {
    userData.longestStreak = val;
  }

  localStorage.setItem("userData", JSON.stringify(userData));
}

export function updateGuessStats(idx) {
  userData.guessDistribution[idx]++;
  localStorage.setItem("userData", JSON.stringify(userData));
}

export function updateTheme(theme: Theme) {
  settings.theme = theme;
  localStorage.setItem("settings", JSON.stringify(settings));
}

export function updateMode(mode: Mode) {
  settings.mode = mode;
  localStorage.setItem("settings", JSON.stringify(settings));
}
