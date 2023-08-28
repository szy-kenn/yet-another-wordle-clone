import { GameState } from "./types";

const config = require('./game.config');

// main containers
const gridContainer = document.querySelector<HTMLElement>(".wordle-grid-container") // container of all row cotainers containing letter boxes 
const keyContainer = document.querySelector<HTMLElement>(".key-container");
const statsContainer = document.querySelector<HTMLElement>(".stats-container");

// winner note
const winnerNote = document.querySelector<HTMLElement>(".winner-note");
const notes = ['First Try!', 'Hooray!', 'Nice!', 'You got it!', 'Fantastic!', 'Phew!'];

// guess distribution values
const statsText = document.querySelectorAll<HTMLElement>(".value");
const guessStats = document.querySelectorAll<HTMLElement>(".guess-value");

// objects
const cover = document.querySelector<HTMLElement>(".cover");
const statsIcon = document.querySelector<HTMLElement>(".stats-icon");

// array of ALL HTML elements of squares in the grid
let squares: HTMLElement[] = [];

export function initializeUI(length: number = config.word_length, tries: number = config.tries, container: Element = gridContainer) {
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

export function disableKeypad(disable:boolean = true) {
    // if disabled, set it to the first value, else to the second value
    keyContainer.style.opacity = disable ? '0.5' : '1';
    keyContainer.style.pointerEvents = disable ? 'none' : 'all';

    //TODO: this function should not touch any external variables
    // isAnimating = disable;   
}

export function displayNote() {

    // displays the winner note
    setTimeout(() => {
        winnerNote.classList.add('displayed');
    }, (config.config.word_length * 100) + 500);

    setTimeout(() => {
        winnerNote.classList.remove('displayed');
        squares.forEach(square => {
            square.style.opacity = '1';
        })

        // TODO: should not handle showStats()
        // showStats();

    }, (config.word_length * 100) + 2000); 
}

export function endGame(isOver: boolean = true) {

    // gameOver = isOver;

    // updateStats("gamesPlayed", userData.gamesPlayed+1);

    // if (isWinner) {
    //     updateGuessStats(currentRow-1);
    //     updateStats("gamesWon", userData.gamesWon+1);
    //     updateStats("currentStreak", userData.currentStreak+1);

    //     if (userData.currentStreak > userData.longestStreak) {
    //         updateStats("longestStreak", userData.currentStreak);
    //     }
    // } else {
    //     updateStats("currentStreak", 0);

    //     winnerNote.firstElementChild.textContent = 'Unlucky...';

    //     setTimeout(() => {
    //         displayNote();
    //     }, 250);
    // }

    // updateStats("winRate", Math.round((userData.gamesWon / userData.gamesPlayed) * 100));
    // disableKeypad(true);
}

// export function showStats(show: boolean=true) {

//     if (show) {
//         // update stats in texts
//         loadStats();
        
//         if (userData.gamesPlayed > 0) {
//             for (let i = 0; i < guessStats.length; i++) {

//                 let newWidth = ((userData.guessDistribution[i] / userData.gamesPlayed) * 100);
                
//                 if (userData.guessDistribution[i] > 0 && newWidth <= parseFloat(guessStats[i].style.minWidth)) {
//                     newWidth += 1;
//                 }
//                 guessStats[i].style.width = `${newWidth}%`;
//             }
//         }

//         cover.classList.add('displayed');
//         statsContainer.classList.add('displayed');
//     } else {
//         cover.classList.remove('displayed');
//         statsContainer.classList.remove('displayed');
//     }
// }

export function getCell(row: number, squareIdx: number): HTMLElement {
    // return the HTML ELEMENT of the square in a specific row
    return squares[(row * config.word_length) + squareIdx];
}

export function getWord(row: number) {
    // get the substring of the current row from the entire array of squares
    const fullRow = squares.slice((row * config.word_length), row * config.word_length + config.word_length);
    let word: string = "";
    // get each character from the square
    fullRow.forEach(square => word += square.firstElementChild.textContent);
    return word;
}

export function setText(cell: Element, text: string) {
    cell.textContent = text;
}

export function isValid(word: string) {
    return true;
}

export function animateResult(row: number, result: string[], animSpeed = 500, animDelay = 250, handleKeypad: boolean = true) {

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
            //     if (correctLetters === config.word_length) {
            //         isWinner = true;
            //         endGame();  // ends the game
            //         winnerNote.firstElementChild.textContent = notes[currentRow-1];

            //         // animate the row
            //         setTimeout(() => {

            //             // lower opacity of squares not in the correct row
            //             for (let s = 0; s < squares.length; s++) {
            //                 if (s >= (currentRow-1) * config.word_length + config.word_length ||
            //                     s < (currentRow-1) * config.word_length) {
            //                         squares[s].style.opacity = '0.1';
            //                     }
            //             }

            //             for (let k = 0; k < config.word_length; k++) {
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



cover.addEventListener('click', () => {
    // showStats(false);
})

statsIcon.addEventListener('click', () => {
    // showStats();
})