// objects
const cover = document.querySelector(".cover");
const statsIcon = document.querySelector(".stats-icon");
document.addEventListener("keydown", (event) => {
    if (!gameOver && !isAnimating) {
        if (isLetter(event.key) && (currentSquare <= WORD_LENGTH - 1)) {
            const currentCell = getCell(currentRow, currentSquare); // get current cell to fill 
            currentCell.firstElementChild.textContent = event.key; // change text content to the corresponding event key
            currentCell.classList.add('popped');
            currentCell.classList.add('filled'); // change the border color to white (filled cell)
            currentCell.classList.remove('out');
            // update the tracker variables
            currentSquare++;
        }
        else if (event.key === 'Backspace') {
            if (currentSquare !== 0) {
                const currentCell = getCell(currentRow, currentSquare - 1);
                currentCell.firstElementChild.textContent = "";
                currentCell.classList.add('out');
                currentCell.classList.remove('filled');
                currentCell.classList.remove('popped');
                currentSquare--;
            }
        }
        else if (event.key === 'Enter') {
            if (currentSquare === WORD_LENGTH) {
                const word = getWord(currentRow);
                if (isValid(word)) {
                    evaluate(word);
                    updateGameStateGuesses(currentRow, word);
                    if (currentRow < TRIES - 1) {
                        currentRow++;
                        currentSquare = 0;
                    }
                    else {
                        currentRow++;
                        endGame();
                    }
                }
            }
        }
    }
});
cover.addEventListener('click', () => {
    showStats(false);
});
statsIcon.addEventListener('click', () => {
    showStats();
});
// global variables
const WORD_LENGTH = 5; // length of the word to be guessed
const TRIES = 6; // maximum number of guesses
const _WORD_TO_GUESS = 'LUCKY';
const ALL_STATS = ['gamesPlayed', 'gamesWon', 'winRate', 'currentStreak', 'longestStreak'];
// main containers
const gridContainer = document.querySelector(".wordle-grid-container"); // container of all row cotainers containing letter boxes 
const keyContainer = document.querySelector(".key-container");
const statsContainer = document.querySelector(".stats-container");
// winner note
const winnerNote = document.querySelector(".winner-note");
const notes = ['First Try!', 'Hooray!', 'Nice!', 'You got it!', 'Fantastic!', 'Phew!'];
// tracker
let squares = [];
let currentRow = 0;
let currentSquare = 0;
let gameOver = false;
let isWinner = false;
let isAnimating = false;
function initialize(length, tries, container) {
    for (let i = 0; i < tries; i++) {
        // create a new row 
        const row = document.createElement("div");
        row.classList.add('row-container');
        // add the squares in the row
        for (let j = 0; j < length; j++) {
            // create square
            const square = document.createElement("div");
            square.classList.add("square");
            // create paragraph element for the text
            const p = document.createElement("p");
            square.appendChild(p);
            row.appendChild(square);
            squares.push(square);
        }
        container.appendChild(row);
    }
}
function disableKeypad(disable = true) {
    keyContainer.style.opacity = disable ? '0.5' : '1';
    keyContainer.style.pointerEvents = disable ? 'none' : 'all';
    isAnimating = disable;
}
function displayNote() {
    // displays the winner note
    setTimeout(() => {
        winnerNote.classList.add('displayed');
    }, (WORD_LENGTH * 100) + 500);
    setTimeout(() => {
        winnerNote.classList.remove('displayed');
        squares.forEach(square => {
            square.style.opacity = '1';
        });
        showStats();
    }, (WORD_LENGTH * 100) + 2000);
}
function endGame(isOver = true) {
    gameOver = isOver;
    updateStats("gamesPlayed", userData.gamesPlayed + 1);
    if (isWinner) {
        updateGuessStats(currentRow - 1);
        updateStats("gamesWon", userData.gamesWon + 1);
        updateStats("currentStreak", userData.currentStreak + 1);
        if (userData.currentStreak > userData.longestStreak) {
            updateStats("longestStreak", userData.currentStreak);
        }
    }
    else {
        updateStats("currentStreak", 0);
        winnerNote.firstElementChild.textContent = 'Unlucky...';
        setTimeout(() => {
            displayNote();
        }, 250);
    }
    updateStats("winRate", Math.round((userData.gamesWon / userData.gamesPlayed) * 100));
    disableKeypad(true);
}
function isLetter(str) {
    let letterRegex = /^[a-zA-Z]$/; // check from start to end if it matches with any letters ranging from a-Z
    return letterRegex.test(str) && str.length == 1;
    // returns true if it matches with the regex AND if it is a single character
}
function getCell(row, squareIdx) {
    return squares[(row * WORD_LENGTH) + squareIdx];
}
function getWord(row) {
    // get the substring of the current row from the entire array of squares
    const fullRow = squares.slice((row * WORD_LENGTH), row * WORD_LENGTH + WORD_LENGTH);
    let word = "";
    // get each character from the square
    fullRow.forEach(square => word += square.firstElementChild.textContent);
    return word;
}
function isValid(word) {
    return true;
}
function evaluate(word) {
    let correctLetters = 0;
    disableKeypad(true);
    for (let i = 0; i < word.length; i++) {
        // get current cell to evaluate
        const cellToEvaluate = getCell(currentRow, i);
        setTimeout(() => {
            cellToEvaluate.classList.add('flipped');
        }, i * 250);
        setTimeout(() => {
            if (word[i].toLowerCase() === _WORD_TO_GUESS[i].toLowerCase()) {
                cellToEvaluate.classList.add('correct');
                correctLetters++;
            }
            else if (_WORD_TO_GUESS.includes(word[i].toUpperCase())) {
                cellToEvaluate.classList.add('misplaced');
            }
            else {
                cellToEvaluate.classList.add('wrong');
            }
            if (i === word.length - 1) {
                // if the player guessed the word 
                if (correctLetters === WORD_LENGTH) {
                    isWinner = true;
                    endGame(); // ends the game
                    winnerNote.firstElementChild.textContent = notes[currentRow - 1];
                    // animate the row
                    setTimeout(() => {
                        // lower opacity of squares not in the correct row
                        for (let s = 0; s < squares.length; s++) {
                            if (s >= (currentRow - 1) * WORD_LENGTH + WORD_LENGTH ||
                                s < (currentRow - 1) * WORD_LENGTH) {
                                squares[s].style.opacity = '0.1';
                            }
                        }
                        for (let k = 0; k < WORD_LENGTH; k++) {
                            const currentCell = getCell(currentRow - 1, k);
                            currentCell.style.opacity = `1`;
                            setTimeout(() => {
                                currentCell.classList.add('jumped');
                            }, k * 100);
                        }
                    }, 250);
                    displayNote();
                }
                else {
                    // if not, the keypad will be enabled again
                    setTimeout(() => {
                        disableKeypad(false);
                    }, 500);
                }
            }
        }, (i * 250) + 250);
    }
}
// LOCAL STORAGE
// initialization
let gameState = JSON.parse(localStorage.getItem('gameState'));
let userData;
// guess distribution values
const statsText = document.querySelectorAll(".value");
const guessStats = document.querySelectorAll(".guess-value");
if (gameState == null) {
    let newGameState = {
        guesses: [],
        wordToGuess: _WORD_TO_GUESS
    };
    let newUserData = {
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
}
else {
    userData = JSON.parse(localStorage.getItem('userData'));
}
function loadGameState() {
    for (let i = 0; i < gameState.guesses.length; i++) {
        for (let j = 0; j < gameState.guesses[i].length; j++) {
            squares[i * WORD_LENGTH + j].firstElementChild.textContent = gameState.guesses[i][j];
        }
        const word = getWord(i);
        evaluate(word);
        currentRow++;
    }
}
function loadStats() {
    document.querySelector('.games-played-value-p').textContent = userData.gamesPlayed.toString();
    document.querySelector('.win-rate-value-p').textContent = userData.winRate.toString();
    document.querySelector('.current-streak-value-p').textContent = userData.currentStreak.toString();
    document.querySelector('.longest-streak-value-p').textContent = userData.longestStreak.toString();
    for (let i = 0; i < TRIES; i++) {
        guessStats[i].textContent = userData.guessDistribution[i].toString();
    }
}
function updateGameStateGuesses(idx, val) {
    gameState.guesses[idx] = val;
    localStorage.setItem('gameState', JSON.stringify(gameState));
}
function updateStats(stat, val) {
    if (stat === 'gamesPlayed') {
        userData.gamesPlayed = val;
    }
    else if (stat === 'gamesWon') {
        userData.gamesWon = val;
    }
    else if (stat === 'winRate') {
        userData.winRate = val;
    }
    else if (stat === 'currentStreak') {
        userData.currentStreak = val;
    }
    else if (stat === 'longestStreak') {
        userData.longestStreak = val;
    }
    localStorage.setItem('userData', JSON.stringify(userData));
}
function updateGuessStats(idx) {
    userData.guessDistribution[idx]++;
    const guessNum = guessStats[idx];
    guessNum.classList.add('added');
    localStorage.setItem('userData', JSON.stringify(userData));
}
function showStats(show = true) {
    if (show) {
        // update stats in texts
        loadStats();
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
    }
    else {
        cover.classList.remove('displayed');
        statsContainer.classList.remove('displayed');
    }
}
initialize(WORD_LENGTH, TRIES, gridContainer);
loadGameState();
// keypad
const keys = document.querySelectorAll(".key");
keys.forEach(key => {
    ['mousedown', 'touchstart'].forEach(event => {
        key.addEventListener(event, () => {
            key.classList.add('pressed');
        });
    });
    ['mouseup', 'touchend'].forEach(event => {
        key.addEventListener(event, () => {
            key.classList.remove('pressed');
        });
    });
    ['mouseleave', 'touchcancel'].forEach(event => {
        key.addEventListener(event, () => {
            if (key.classList.contains('pressed')) {
                key.classList.remove('pressed');
            }
        });
    });
    key.addEventListener('click', () => {
        key.classList.add('popped');
        console.log("here");
        setTimeout(() => {
            key.classList.remove('popped');
        }, 100);
        // fire an event that simulates a keydown event
        let keyCode = key.textContent;
        if (key.textContent === 'Delete') {
            keyCode = 'Backspace';
        }
        const keyEvent = new KeyboardEvent('keydown', { key: keyCode });
        document.dispatchEvent(keyEvent);
    });
});
