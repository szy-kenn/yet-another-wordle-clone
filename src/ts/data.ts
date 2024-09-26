import { GameState, UserData, Stats, Settings, Theme, Mode } from "./types";
import { wordlist } from "./wordlist";
// import { auth } from ".";
import { updateUserGameState, updateUserData, updateUser, getUser } from "../firebase";
import { getAuth, User } from "firebase/auth";

const auth = getAuth();
const wordlistLength = wordlist.length;

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

export async function initializeGameData(gameState: GameState) {

  // gameState = await getGameState();

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

    if (auth.currentUser != null) {
      await updateUserGameState(auth.currentUser, newGameState);
      await updateUserData(auth.currentUser, newUserData);
    } else {
      localStorage.setItem("gameState", JSON.stringify(newGameState));
      localStorage.setItem("userData", JSON.stringify(newUserData));
      localStorage.setItem("settings", JSON.stringify(newSettings));
    }

    gameState = newGameState;
    userData = newUserData;
    settings = newSettings;
  } else {

    if (auth.currentUser !== null) {
      const userData = await getUserData();
    } else {
      userData = JSON.parse(localStorage.getItem("userData")) as UserData;
    }
    
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

export const getUserData = async () => {
  if (auth.currentUser !== null) {
    const userData = (await getUser(auth.currentUser)).userData as UserData;
    // console.log("getUserData(): ", userData);
    return userData;
  }
  return JSON.parse(localStorage.getItem("userData")) as UserData;
};
export const getGameState = async () => {

  if (auth.currentUser !== null) {
    const gameState = (await getUser(auth.currentUser)).gameState as GameState;
    return await gameState;
  }
  return JSON.parse(localStorage.getItem("gameState")) as GameState;
};
export const getSettings = (): Settings => {
  return JSON.parse(localStorage.getItem("settings")) as Settings;
};

export async function newGameState() {
  let newGameState: GameState = {
    guesses: [],
    wordToGuess: getRandomWord(),
    ttl: getMidnightTime(),
    triggered: 0,
  };
  gameState = newGameState;

  if (auth.currentUser != null) {
    await updateUserGameState(auth.currentUser, newGameState);
  } else {
    localStorage.setItem("gameState", JSON.stringify(gameState));
  }
}

export async function updateGameStateGuesses(idx, val) {
  gameState = await getGameState();
  gameState.guesses[idx] = val;
  if (auth.currentUser != null) {
    await updateUserGameState(auth.currentUser, gameState);
  } else {
    localStorage.setItem("gameState", JSON.stringify(gameState));
  }
}

export async function updateStats(stat: Stats, val) {
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

  if (auth.currentUser != null) {
    await updateUserData(auth.currentUser, userData);    
  } else {
    localStorage.setItem("userData", JSON.stringify(userData));
  }
}

export async function updateGuessStats(idx) {
  userData.guessDistribution[idx]++;
  if (auth.currentUser != null) {
    await updateUserData(auth.currentUser, userData);    
  } else {
    localStorage.setItem("userData", JSON.stringify(userData));
  }
}

export function updateTheme(theme: Theme) {
  settings.theme = theme;
  localStorage.setItem("settings", JSON.stringify(settings));
}

export function updateMode(mode: Mode) {
  settings.mode = mode;
  localStorage.setItem("settings", JSON.stringify(settings));
}


let gameState: GameState;
let userData: UserData;
let settings: Settings;
