import { GameState, UserData, Stats } from "./types";
import { initializeUI, animateResult, isValid, getCell, getWord, setText, endGame } from "./ui";
import { initializeGameData, loadStats, updateGameStateGuesses, updateStats, updateGuessStats } from "./data";

const config = require('./game.config');

// tracker
let currentRow = 0;
let currentSquare = 0;
let gameOver = false;
let isWinner = false;
let isAnimating = false;

function isLetter(str: string) {
    let letterRegex = /^[a-zA-Z]$/; // check from start to end if it matches with any letters ranging from a-Z
    return letterRegex.test(str) && str.length == 1; 
    // returns true if it matches with the regex AND if it is a single character
}

function evaluate(word1: string, word2: string) {

    const evaluation = {
        result: [],

        get correctLetters(): number {
            let count = 0;
            this.result.forEach(res => {
                if (res === 'Correct') {
                    count++;
                }
            });

            return count;
        }
    }

    for (let i = 0; i < word1.length; i++) {

        if (word1[i].toLowerCase() === word2[i].toLowerCase()) {
            evaluation.result.push('Correct')
        } else if (word2.toLowerCase().includes(word1[i].toLowerCase())) {
            evaluation.result.push('Misplaced');
        } else {
            evaluation.result.push('Wrong');
        }
    }

    return evaluation;
}

function loadGameState(gameState: GameState) {
    for (let i = 0; i < gameState.guesses.length; i++) {
        for (let j = 0; j < gameState.guesses[i].length; j++) {
            // get current cell in row i and square index j to get the p element and load the text in gameState
            //TODO: make a function in data.ts to retrieve the inputted guessed in gameState to separate it in this section
            setText(getCell(i, j).firstElementChild, gameState.guesses[i][j]);
        }

        const word: string = getWord(i);    // get current word
        const evalScore = evaluate(word, config.word_to_guess);      // evaluate the current word
        currentRow++;
    }
}

document.addEventListener("keydown", (event) => {

    if (!gameOver && !isAnimating) {

        if (isLetter(event.key) && (currentSquare <= config.word_length - 1)) {
            const currentCell = getCell(currentRow, currentSquare);     // get current cell to fill 
            setText(currentCell.firstElementChild, event.key);          // change text content to the corresponding event key 
            
            currentCell.classList.add('popped');
            currentCell.classList.add('filled');        // change the border color to white (filled cell)
            currentCell.classList.remove('out');
            // update the tracker variables
            currentSquare++;
        }

        else if (event.key === 'Backspace') {
            if (currentSquare !== 0) {
                const currentCell = getCell(currentRow, currentSquare-1);
                currentCell.firstElementChild.textContent = "";
                currentCell.classList.add('out');
                currentCell.classList.remove('filled');
                currentCell.classList.remove('popped');

                currentSquare--;
            }
        }

        else if (event.key === 'Enter') {
            if (currentSquare === config.word_length) {

                const word = getWord(currentRow);

                if (isValid(word)) {

                    const evalScore = evaluate(word, config.word_to_guess); // get evaluation of the current word
                    
                    animateResult(currentRow, evalScore.result, 250, 500, true);
                    updateGameStateGuesses(currentRow, word);

                    if (currentRow < config.tries - 1) {
                        currentRow++;
                        currentSquare = 0;
                    } else {
                        currentRow++;
                        endGame();
                    }
                }

            }
        }

    }

})

initializeUI();
// loadGameState();


