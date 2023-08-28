import { GameState, UserData, Stats } from "./types";
import { wordlist } from "./wordlist"

const wordlistLength = wordlist.length;

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.ceil(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomWord() {
    return wordlist[getRandomInt(0, wordlistLength)];
}

let gameState: GameState = JSON.parse(localStorage.getItem('gameState')) as GameState;
let userData: UserData;

const ttl = 60000;

export function initializeGameData() {

    if (gameState == null) {
        let newGameState: GameState = {
            guesses: [],
            wordToGuess: getRandomWord(),
            ttl: new Date().getTime() + ttl
        };
    
        let newUserData: UserData = {
            gamesPlayed: 0,
            gamesWon: 0,
            winRate: 0,
            currentStreak: 0,
            longestStreak: 0,
            guessDistribution: [0, 0, 0, 0, 0, 0]
        };
    
        localStorage.setItem('gameState', JSON.stringify(newGameState));
        localStorage.setItem('userData', JSON.stringify(newUserData));
    
        gameState = newGameState;
        userData = newUserData;
    
    } else {
        userData = JSON.parse(localStorage.getItem('userData')) as UserData;
    }

}

export function getUserData(): UserData {
    return userData;
}

export function getGameState(): GameState {
    return gameState;
}

export function newGameState() {
    let newGameState: GameState = {
        guesses: [],
        wordToGuess: getRandomWord(),
        ttl: new Date().getTime() + ttl
    };
    gameState = newGameState;
}

export function updateGameStateGuesses(idx, val) {
    gameState.guesses[idx] = val;
    localStorage.setItem('gameState', JSON.stringify(gameState));
}

export function updateStats(stat: Stats, val) {
    if (stat === 'gamesPlayed') {
        userData.gamesPlayed = val;
    } else if (stat === 'gamesWon') {
        userData.gamesWon = val;
    } else if (stat === 'winRate') {
        userData.winRate = val;
    } else if (stat === 'currentStreak') {
        userData.currentStreak = val;
    } else if (stat === 'longestStreak') {
        userData.longestStreak = val;
    }

    localStorage.setItem('userData', JSON.stringify(userData));

}
 
export function updateGuessStats(idx) {
    userData.guessDistribution[idx]++;
    localStorage.setItem('userData', JSON.stringify(userData));
}