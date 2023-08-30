import { GameState, UserData, Stats, Evaluation } from "./types";
import { WORD_LENGTH, TRIES } from "./game.config";

import { initializeUI, animateResult, isLetter, isValid, 
    getCell, getRow, getWord, setText, displayNote, disableKeypad } from "./ui";

import { initializeGameData, updateGameStateGuesses, getTimeBeforeMidnight,
        getUserData, getGameState, updateStats, updateGuessStats, newGameState } from "./data";

// ========================== HTML Elements =========================================

// guess distribution values
const statsContainer = document.querySelector<HTMLElement>(".stats-container");
const statsText = document.querySelectorAll<HTMLElement>(".value");
const guessStats = document.querySelectorAll<HTMLElement>(".guess-value");

// objects for statistics section
const cover = document.querySelector<HTMLElement>(".cover");
const statsIcon = document.querySelector<HTMLElement>(".stats-icon");   

// keypad keys
const keys = document.querySelectorAll<HTMLElement>(".key");

// new word countdown
const newWordContainer = document.querySelector<HTMLElement>(".next-word-container")
const newWordTimeLeft = document.querySelector<HTMLElement>(".next-word-time-value");

// reveal word sqrs
const wordToGuessContainer = document.querySelector<HTMLElement>(".word-to-guess");
const wordToGuessSqrs = document.querySelectorAll<HTMLElement>(".word-to-guess-sqr");

// =================================================================================

// ======== TRACKER ========
let currentRow = 0;
let currentSquare = 0;
let gameOver = false;
let isWinner = false;
let isAnimating = false;

/**
 * the initial function to call to start the game (initializes UI and game data)
 */
function start() {
    initializeUI();
    initializeGameData();

    // get time before midnight to reload the page with a new word to guess
    const timeBeforeMidnight = getTimeBeforeMidnight();
    
    // reload the page after `timeBeforeMidnight` milliseconds
    setTimeout(() => {
        newGameState();
        location.reload();
    }, timeBeforeMidnight);
}

/**
 * Ends the game, sets the trackers, disables input, and updates stats if desired
 * 
 * @param {boolean} isWinner - the winner status at the end of the game
 * @param {boolean} showNote - determines whether to show note before showing the stats or not
 * @param {boolean} update - determines whether to update the game stats or not (useful for loading game state to avoid duplicating the data)
 */
async function end(isWinner: boolean, showNote: boolean, update: boolean) {

    gameOver = true;
    disableKeypad(true);
    
    // show hidden containers (word reveal, new word timer)
    wordToGuessContainer.classList.add('displayed');
    newWordContainer.classList.add('displayed');
    document.querySelector<HTMLElement>('.hr-one').style.display = 'block';

    // set timer for new word
    const newDate = new Date(getTimeBeforeMidnight());
    const newTime = `${newDate.getUTCHours().toString().padStart(2, '0')}:${newDate.getUTCMinutes().toString().padStart(2, '0')}:${newDate.getUTCSeconds().toString().padStart(2, '0')}`;
    setText(newWordTimeLeft as Element, newTime); 

    setInterval(() => {
        const newDate = new Date(getTimeBeforeMidnight());
        const newTime = `${newDate.getUTCHours().toString().padStart(2, '0')}:${newDate.getUTCMinutes().toString().padStart(2, '0')}:${newDate.getUTCSeconds().toString().padStart(2, '0')}`;
        setText(newWordTimeLeft as Element, newTime); 
    }, 1000);

    // reveal the word
    const wordToGuess = getGameState().wordToGuess;
    const lastEvalScore = evaluate(getWord(currentRow-1), wordToGuess);

    for (let i = 0; i < wordToGuess.length; i++) {
        wordToGuessSqrs[i].classList.add(lastEvalScore.result[i].toLowerCase());
        setText(wordToGuessSqrs[i].firstElementChild, wordToGuess[i]);
    }

    if (update) {
        updateStats("gamesPlayed", getUserData().gamesPlayed+1);
    }

    if (isWinner) {
        // update all stats
        if (update) {
            updateGuessStats(currentRow-1);
            updateStats("gamesWon", getUserData().gamesWon+1);
            updateStats("currentStreak", getUserData().currentStreak+1);
            
            // change longest streak if current streak is already higher
            if (getUserData().currentStreak > getUserData().longestStreak) {
                updateStats("longestStreak", getUserData().currentStreak);
            }
        }
        
        if (showNote) {
            await displayNote('You got it!');
        }

    } else {
        if (update) {
            updateStats("currentStreak", 0);    // make the currentStreak zero
        }
        if (showNote) {
            await displayNote('Unlucky...');    // display the popping note
        }
    }

    if (update) {
        updateStats("winRate", Math.round((getUserData().gamesWon / getUserData().gamesPlayed) * 100));
    }

    showStats(true, getUserData());     // show stats after
}

/**
 * Evaluates every letter in the inputted word (Correct, Misplaced, or Wrong)
 * 
 * @param word1 - word input by the player
 * @param word2 - word to be guessed
 * @returns {Evaluation} containing array of results and a function to get number of correct letters
 */
function evaluate(word1: string, word2: string): Evaluation {

    // creates a new object containing the result that will be returned
    const evaluation: Evaluation = {

        word: word1,
        result: [],
        correctLetters(): number {
            let count = 0;
            this.result.forEach(res => {
                if (res === 'Correct') {
                    count++;
                }
            });

            return count;
        }
    }

    // check every letters if it is correct, misplaced, or wrong
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

/**
 * show/hide the data passed
 * 
 * @param {boolean} show - whether to show the stats container or not 
 * @param {boolean} userData - the data that will be displayed
 */
function showStats(show: boolean=true, userData: UserData) {

    if (show) {

        // flip the squares containing the revealed word (if the game is already over)
        if (gameOver) {
            for (let i = 0; i < wordToGuessSqrs.length; i++) {

                setTimeout(() => {
                    wordToGuessSqrs[i].classList.add('flipped');
                    setTimeout(() => {
                        wordToGuessSqrs[i].classList.remove('flipped');
                    }, 500);

                }, i * 200);
            }
        }
        
        if (isWinner) {
            // highlight the guess number
            const guessNum = guessStats[currentRow-1];
            guessNum.classList.add('added');
        }

        // update stats in texts
        document.querySelector<HTMLElement>('.games-played-value-p').textContent = userData.gamesPlayed.toString();
        document.querySelector<HTMLElement>('.win-rate-value-p').textContent = userData.winRate.toString();
        document.querySelector<HTMLElement>('.current-streak-value-p').textContent = userData.currentStreak.toString();
        document.querySelector<HTMLElement>('.longest-streak-value-p').textContent = userData.longestStreak.toString();
        
        for (let i = 0; i < TRIES; i++) {
            setText(guessStats[i], userData.guessDistribution[i].toString());
        }
        
        // if the player has played any games, every guess percentage width will now be based on its value
        if (userData.gamesPlayed > 0) {
            for (let i = 0; i < guessStats.length; i++) {

                let newWidth = ((userData.guessDistribution[i] / userData.gamesPlayed) * 100);
                
                if (userData.guessDistribution[i] > 0 && newWidth <= parseFloat(guessStats[i].style.minWidth)) {
                    newWidth += 1;
                }
                guessStats[i].style.width = `${newWidth}%`;
            }
        }

        cover.classList.add('displayed');
        statsContainer.classList.add('displayed');
    } else {
        cover.classList.remove('displayed');
        statsContainer.classList.remove('displayed');
    }
}

/**
 * Loads an existing game state to the browser
 * 
 * @param {GameState} gameState - the game state object to be loaded
 * @returns {Promise} - returns a new Promise that will be resolved after loading the game state
 */
async function loadGameState(gameState: GameState) {

    return new Promise<void>(async(resolve, reject) => {

        if (gameState.ttl == null || gameState.ttl < new Date().getTime()) {
            newGameState();
        }

        for (let i = 0; i < gameState.guesses.length; i++) {
            for (let j = 0; j < gameState.guesses[i].length; j++) {
                // get current cell in row i and square index j to get the p element and load the text in gameState
                // TODO: make a function in data.ts to retrieve the inputted guessed in gameState to separate it in this section
                setText(getCell(i, j).firstElementChild, gameState.guesses[i][j]);
            }

            const word: string = getWord(i); // get current word
            const evalScore = evaluate(word, getGameState().wordToGuess); // evaluate the current word
            
            // show the result of evaluated word
            isAnimating = true;
            await animateResult(i, evalScore, 0, 0, true);  
            isAnimating = false;

            currentRow++;

            if (evalScore.correctLetters() === WORD_LENGTH) {
                //  if the user has already input the correct word
                isWinner = true;
                end(isWinner, false, false);
                resolve();
                break;
            } else if (currentRow === WORD_LENGTH + 1) {
                end(isWinner, false, false);
                resolve();
                break;
            }
            
            if (i === gameState.guesses.length - 1) {
                resolve();
            }
        }
    })
}

cover.addEventListener('click', () => {
    // if the cover is displayed, clicking it should close the stats
    showStats(false, getUserData());
});

statsIcon.addEventListener('click', () => {
    showStats(true, getUserData());
})

// keypad
keys.forEach(key => {

    ['mousedown', 'touchstart'].forEach(event => {
        key.addEventListener(event, () => {
            key.classList.add('pressed');
        })
    });

    ['mouseup', 'touchend'].forEach(event => {
        key.addEventListener(event, () => {
            key.classList.remove('pressed');
        })
    });

    ['mouseleave', 'touchcancel'].forEach(event => {
        key.addEventListener(event, () => {
            if (key.classList.contains('pressed')) {
                key.classList.remove('pressed');
            }
        })
    })

    key.addEventListener('click', () => {
        key.classList.add('popped');
        setTimeout(() => {
            key.classList.remove('popped');
        }, 100);

        // fire an event that simulates a keydown event
        let keyCode = key.textContent;

        if (key.textContent === 'Delete') {
            keyCode = 'Backspace';
        }

        const keyEvent = new KeyboardEvent('keydown', {key: keyCode});
        document.dispatchEvent(keyEvent);

    })
})

document.addEventListener("keydown", async (event) => {

    if (!gameOver && !isAnimating) {

        let currentKey;

        if (isLetter(event.key) && (currentSquare <= WORD_LENGTH - 1)) {
            const currentCell = getCell(currentRow, currentSquare);     // get current cell to fill 
            setText(currentCell.firstElementChild, event.key);          // change text content to the corresponding event key 
            
            currentCell.classList.add('popped');
            currentCell.classList.add('filled');        // change the border color to white (filled cell)
            currentCell.classList.remove('out');
            
            currentKey = document.querySelector<HTMLElement>(`.keycode-${event.key.toLowerCase()}`);
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

                currentKey = document.querySelector<HTMLElement>(`.delete`);

                currentSquare--;
            }
        }

        else if (event.key === 'Enter') {
            if (currentSquare === WORD_LENGTH) {

                currentKey = document.querySelector<HTMLElement>(`.enter`);
                const word = getWord(currentRow);

                if (isValid(word)) {

                    const evalScore = evaluate(word, getGameState().wordToGuess); // get evaluation of the current word
                    
                    // flip the row and show the result based on evalScore
                    disableKeypad(true);
                    isAnimating = true;
                    await animateResult(currentRow, evalScore, 200, 250, true);
                    disableKeypad(false);
                    isAnimating = false;
                    
                    // save the inputted word in the current game state
                    updateGameStateGuesses(currentRow, word);

                    // if the player got all correct scores in evalScore
                    if (evalScore.correctLetters() === WORD_LENGTH) {
                        currentRow++;
                        isWinner = true;
                        end(isWinner, true, true);
                    }

                    else if (currentRow < TRIES - 1) {
                        // if there is still any remaining tries
                        currentRow++;
                        currentSquare = 0;
                    } else {
                        // if there are no more remaining tries left
                        currentRow++;
                        end(isWinner, true, true);
                    }
                } else {
                    const wrongRow = getRow(currentRow);
                    wrongRow.classList.add('shake');
                    setTimeout(() => {
                        wrongRow.classList.remove('shake');
                    }, 100);
                }
            }
        }

        // make keypad press
        currentKey.classList.add('pressed');
        setTimeout(() => {
            currentKey.classList.remove('pressed');
        }, 50);
    }
})
 
// Starts the game
start();
loadGameState(getGameState());





