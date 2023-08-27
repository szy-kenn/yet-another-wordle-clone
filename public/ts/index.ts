// global variables
const WORD_LENGTH = 5;        // length of the word to be guessed
const TRIES = 6;              // maximum number of guesses
const _WORD_TO_GUESS = 'LUCKY';
const ALL_STATS = ['gamesPlayed', 'gamesWon', 'winRate', 'currentStreak', 'longestStreak']

// custom types 
type GameState = {
    guesses?: string[];
    wordToGuess: string;
};

type UserData = {
    gamesPlayed: number;
    gamesWon: number;
    winRate: number;
    currentStreak: number;
    longestStreak: number;
    guessDistribution: number[];
}


type Stats = 'gamesPlayed' | 'gamesWon' | 'winRate' | 'currentStreak' | 'longestStreak'

// main containers
const gridContainer = document.querySelector<HTMLElement>(".wordle-grid-container") // container of all row cotainers containing letter boxes 
const keyContainer = document.querySelector<HTMLElement>(".key-container");
const statsContainer = document.querySelector<HTMLElement>(".stats-container");

// winner note
const winnerNote = document.querySelector<HTMLElement>(".winner-note");
const notes = ['First Try!', 'Hooray!', 'Nice!', 'You got it!', 'Fantastic!', 'Phew!'];

// tracker
let squares: HTMLElement[] = []
let currentRow = 0;
let currentSquare = 0;
let gameOver = false;
let isWinner = false;
let isAnimating = false;

function initialize(length: number, tries: number, container: Element) {
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

function disableKeypad(disable:boolean = true) {
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
        })

        showStats();

    }, (WORD_LENGTH * 100) + 2000); 
}

function endGame(isOver: boolean = true) {

    gameOver = isOver;

    updateStats("gamesPlayed", userData.gamesPlayed+1);

    if (isWinner) {
        updateGuessStats(currentRow-1);
        updateStats("gamesWon", userData.gamesWon+1);
        updateStats("currentStreak", userData.currentStreak+1);

        if (userData.currentStreak > userData.longestStreak) {
            updateStats("longestStreak", userData.currentStreak);
        }
    } else {
        updateStats("currentStreak", 0);

        winnerNote.firstElementChild.textContent = 'Unlucky...';

        setTimeout(() => {
            displayNote();
        }, 250);
    }

    updateStats("winRate", Math.round((userData.gamesWon / userData.gamesPlayed) * 100));
    disableKeypad(true);
}

function isLetter(str: string) {
    let letterRegex = /^[a-zA-Z]$/; // check from start to end if it matches with any letters ranging from a-Z
    return letterRegex.test(str) && str.length == 1; 
    // returns true if it matches with the regex AND if it is a single character
}

function getCell(row: number, squareIdx: number): HTMLElement {
    return squares[(row * WORD_LENGTH) + squareIdx];
}

function getWord(row: number) {
    // get the substring of the current row from the entire array of squares
    const fullRow = squares.slice((row * WORD_LENGTH), row * WORD_LENGTH + WORD_LENGTH);
    let word: string = "";
    // get each character from the square
    fullRow.forEach(square => word += square.firstElementChild.textContent);
    return word;
}

function isValid(word: string) {
    return true;
}

function evaluate(word: string) {

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

    /**TODO: this should not handle animations, the function should only return the
                evaluation of the word (ex. C-C-M-W-W)
    **/

    for (let i = 0; i < word.length; i++) {

        if (word[i].toLowerCase() === gameState.wordToGuess[i].toLowerCase()) {
            evaluation.result.push('Correct')
        } else if (gameState.wordToGuess.toLowerCase().includes(word[i].toLowerCase())) {
            evaluation.result.push('Misplaced');
        } else {
            evaluation.result.push('Wrong');
        }
    }

    return evaluation;
}

function animateResult(row: number, result: string[], animSpeed = 500, animDelay = 250, handleKeypad: boolean = true) {

    if (handleKeypad) {
        disableKeypad(true);
    }

    for (let i = 0; i < result.length; i++) {
        const cellToEvaluate = getCell(row, i);

        setTimeout(() => {
            cellToEvaluate.classList.add('flipped');
        }, i * animDelay);

        setTimeout(() => {
            if (result[i] === 'Correct') {
                cellToEvaluate.classList.add('correct');
            } else if (result[i] === 'Misplaced') {
                cellToEvaluate.classList.add('misplaced');
            } else {
                cellToEvaluate.classList.add('wrong');
            }

            if (i === result.length - 1) {
                if (handleKeypad) {
                    disableKeypad(false);
                }
            }

            // if (i === result.length - 1) {

            //     // if the player guessed the word 
            //     if (correctLetters === WORD_LENGTH) {
            //         isWinner = true;
            //         endGame();  // ends the game
            //         winnerNote.firstElementChild.textContent = notes[currentRow-1];

            //         // animate the row
            //         setTimeout(() => {

            //             // lower opacity of squares not in the correct row
            //             for (let s = 0; s < squares.length; s++) {
            //                 if (s >= (currentRow-1) * WORD_LENGTH + WORD_LENGTH ||
            //                     s < (currentRow-1) * WORD_LENGTH) {
            //                         squares[s].style.opacity = '0.1';
            //                     }
            //             }

            //             for (let k = 0; k < WORD_LENGTH; k++) {
            //                 const currentCell = getCell(currentRow-1, k);
            //                 currentCell.style.opacity = `1`;
            //                 setTimeout(() => {
            //                     currentCell.classList.add('jumped');
            //                 }, k * 100);
            //             }
            //         }, 250);

            //         displayNote();
            //     } 
                
            //     else {
            //         // if not, the keypad will be enabled again
            //         setTimeout(() => {
            //             disableKeypad(false);
            //         }, 500);
            //     }
            // }

        }, (i * animDelay) + animDelay);
    }
}

// LOCAL STORAGE

// initialization
let gameState: GameState = JSON.parse(localStorage.getItem('gameState')) as GameState;
let userData: UserData;

// guess distribution values
const statsText = document.querySelectorAll<HTMLElement>(".value");
const guessStats = document.querySelectorAll<HTMLElement>(".guess-value");

// objects
const cover = document.querySelector<HTMLElement>(".cover");
const statsIcon = document.querySelector<HTMLElement>(".stats-icon");

if (gameState == null) {
    let newGameState: GameState = {
        guesses: [],
        wordToGuess: _WORD_TO_GUESS
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

function loadGameState() {
    for (let i = 0; i < gameState.guesses.length; i++) {
        for (let j = 0; j < gameState.guesses[i].length; j++) {
            squares[i * WORD_LENGTH + j].firstElementChild.textContent = gameState.guesses[i][j];
        }

        const word: string = getWord(i);    // get current word
        const evalScore = evaluate(word);      // evaluate the current word
        currentRow++;
    }
}

function loadStats() {
    document.querySelector<HTMLElement>('.games-played-value-p').textContent = userData.gamesPlayed.toString();
    document.querySelector<HTMLElement>('.win-rate-value-p').textContent = userData.winRate.toString();
    document.querySelector<HTMLElement>('.current-streak-value-p').textContent = userData.currentStreak.toString();
    document.querySelector<HTMLElement>('.longest-streak-value-p').textContent = userData.longestStreak.toString();
        
    for (let i = 0; i < TRIES; i++) {
        guessStats[i].textContent = userData.guessDistribution[i].toString();
    }
}

function updateGameStateGuesses(idx, val) {
    gameState.guesses[idx] = val;

    localStorage.setItem('gameState', JSON.stringify(gameState));
}

function updateStats(stat: Stats, val) {
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
 
function updateGuessStats(idx) {
    userData.guessDistribution[idx]++;
    const guessNum = guessStats[idx];
    guessNum.classList.add('added');

    localStorage.setItem('userData', JSON.stringify(userData));
}

function showStats(show: boolean=true) {

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
    } else {
        cover.classList.remove('displayed');
        statsContainer.classList.remove('displayed');
    }
}

document.addEventListener("keydown", (event) => {

    if (!gameOver && !isAnimating) {

        if (isLetter(event.key) && (currentSquare <= WORD_LENGTH - 1)) {
            const currentCell = getCell(currentRow, currentSquare);     // get current cell to fill 
            currentCell.firstElementChild.textContent = event.key;      // change text content to the corresponding event key
            
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
            if (currentSquare === WORD_LENGTH) {
                const word = getWord(currentRow);

                if (isValid(word)) {

                    const evalScore = evaluate(word); // get evaluation of the current word
                    
                    animateResult(currentRow, evalScore.result, 250, 500, true);
                    updateGameStateGuesses(currentRow, word);

                    if (currentRow < TRIES - 1) {
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

cover.addEventListener('click', () => {
    showStats(false);
})

statsIcon.addEventListener('click', () => {
    showStats();
})

initialize(WORD_LENGTH, TRIES, gridContainer);
// loadGameState();



