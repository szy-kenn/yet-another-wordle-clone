import { GameState, UserData, Stats } from "./types";

const config = require("./game.config");

let gameState: GameState = JSON.parse(localStorage.getItem('gameState')) as GameState;
let userData: UserData;

export function initializeGameData() {

    if (gameState == null) {
        let newGameState: GameState = {
            guesses: [],
            wordToGuess: config.word_to_guess
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

export function loadStats() {
    document.querySelector<HTMLElement>('.games-played-value-p').textContent = userData.gamesPlayed.toString();
    document.querySelector<HTMLElement>('.win-rate-value-p').textContent = userData.winRate.toString();
    document.querySelector<HTMLElement>('.current-streak-value-p').textContent = userData.currentStreak.toString();
    document.querySelector<HTMLElement>('.longest-streak-value-p').textContent = userData.longestStreak.toString();
        
    // for (let i = 0; i < config.tries; i++) {
    //     guessStats[i].textContent = userData.guessDistribution[i].toString();
    // }
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
    // const guessNum = guessStats[idx];
    // guessNum.classList.add('added');

    localStorage.setItem('userData', JSON.stringify(userData));
}