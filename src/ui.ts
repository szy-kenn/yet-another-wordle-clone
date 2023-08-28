import { Evaluation } from "./types";

const config = require('./game.config');

// main containers
const gridContainer = document.querySelector<HTMLElement>(".wordle-grid-container") // container of all row cotainers containing letter boxes 
const keyContainer = document.querySelector<HTMLElement>(".key-container");

// winner note
const winnerNote = document.querySelector<HTMLElement>(".winner-note");
const notes = ['First Try!', 'Hooray!', 'Nice!', 'You got it!', 'Fantastic!', 'Phew!'];

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

export async function displayNote(note: string) {

    return new Promise<void>((resolve, reject) => {
        // set text to the passed argument
        setText(winnerNote.firstElementChild, note);

        // displays the winner note
        setTimeout(() => {
            winnerNote.classList.add('displayed');
        }, (config.word_length * 100) + 500);

        setTimeout(() => {
            winnerNote.classList.remove('displayed');
            squares.forEach(square => {
                square.style.opacity = '1';
            })

            resolve();
        }, (config.word_length * 100) + 2000); 
    })

}

export function isLetter(str: string) {
    let letterRegex = /^[a-zA-Z]$/; // check from start to end if it matches with any letters ranging from a-Z
    return letterRegex.test(str) && str.length == 1; 
    // returns true if it matches with the regex AND if it is a single character
}

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

export async function animateResult(row: number, evaluation: Evaluation, animSpeed = 500, animDelay = 250, animateWin: boolean) {

    return new Promise<void>((resolve, reject) => {

        for (let i = 0; i < evaluation.result.length; i++) {
            const cellToEvaluate = getCell(row, i);
            cellToEvaluate.style.setProperty('--flip-anim-speed', `${animSpeed/1000}s`);

            setTimeout(() => {
                cellToEvaluate.classList.add('flipped');
            }, i * animDelay);

            setTimeout(async() => {
                if (evaluation.result[i] === 'Correct') {
                    cellToEvaluate.classList.add('correct');
                } else if (evaluation.result[i] === 'Misplaced') {
                    cellToEvaluate.classList.add('misplaced');
                } else {
                    cellToEvaluate.classList.add('wrong');
                }

                if (i === evaluation.result.length - 1) {
                    if (animateWin && (evaluation.correctLetters() === evaluation.result.length)) {
                        await animateWinResult(row);
                    }
                    resolve();
                } 

            }, (i * animDelay) + (animSpeed / 2));
        }
    })
}

export async function animateWinResult(row: number) {
    
    return new Promise<void>((resolve, reject) => {
        // animate the row
        setTimeout(() => {
            // lower opacity of squares not in the correct row
            for (let s = 0; s < squares.length; s++) {
                if (s >= row * config.word_length + config.word_length ||
                    s < row * config.word_length) {
                        squares[s].style.opacity = '0.1';
                    }
            }

            for (let k = 0; k < config.word_length; k++) {
                const currentCell = getCell(row, k);
                currentCell.style.opacity = `1`;
                
                setTimeout(() => {
                    currentCell.classList.add('jumped');
                
                    if (k === config.word_length - 1) {
                        setTimeout(() => {
                            resolve();
                        }, 500);
                    }
                
                }, k * 100);
            }
        }, 250);
    })
}