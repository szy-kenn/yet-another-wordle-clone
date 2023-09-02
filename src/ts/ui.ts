import { Evaluation, NoteType } from "./types";
import { WORD_LENGTH, TRIES } from "./game.config";
import { wordlist } from "./wordlist";
import { validWords } from "./valid_words";

const config = require('./game.config');

// main containers
const gridContainer = document.querySelector<HTMLElement>(".wordle-grid-container") // container of all row cotainers containing letter boxes 
const keyContainer = document.querySelector<HTMLElement>(".key-container");

// winner note
const winnerNote = document.querySelector<HTMLElement>(".winner-note");
const notes = ['First Try!', 'Hooray!', 'Nice!', 'You got it!', 'Fantastic!', 'Phew!'];

// array of ALL HTML elements of squares in the grid
let squares: HTMLElement[] = [];

export function initializeUI(length: number = WORD_LENGTH, tries: number = TRIES, container: Element = gridContainer) {
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

export async function displayNote(note: string, delay: number, duration: number, type: NoteType) {

    return new Promise<void>((resolve, reject) => {
        // set text to the passed argument
        setText(winnerNote.firstElementChild, note);
        
        winnerNote.classList.add(type.toString());

        // display the note
        setTimeout(() => {
            winnerNote.classList.add('displayed');
        }, delay);

        setTimeout(() => {
            winnerNote.classList.remove('displayed');

            // to prevent showing the styles getting removed
            setTimeout(() => {
                if (!winnerNote.classList.contains('displayed')) {
                    winnerNote.classList.remove(type.toString());
                }
            }, 250);

            squares.forEach(square => {
                square.style.opacity = '1';
            })

            resolve();
        }, duration + delay);
    });

}

export function isLetter(str: string) {
    let letterRegex = /^[a-zA-Z]$/; // check from start to end if it matches with any letters ranging from a-Z
    return letterRegex.test(str) && str.length == 1; 
    // returns true if it matches with the regex AND if it is a single character
}

export function getCell(row: number, squareIdx: number): HTMLElement {
    // return the HTML ELEMENT of the square in a specific row
    return squares[(row * WORD_LENGTH) + squareIdx];
}

export function getRow(row: number): HTMLElement {
    // +1 since the childNodes has 'text' Element as its first child element
    return gridContainer.childNodes[row+1] as HTMLElement;
}

export function getWord(row: number) {
    // get the substring of the current row from the entire array of squares
    const fullRow = squares.slice((row * WORD_LENGTH), row * WORD_LENGTH + WORD_LENGTH);
    let word: string = "";
    // get each character from the square
    fullRow.forEach(square => word += square.firstElementChild.textContent);
    return word;
}

export function setText(cell: Element, text: string) {
    cell.textContent = text;
}

export function isValid(word: string) {
    return validWords.includes(word.toLowerCase());
}

export async function animateResult(row: number, evaluation: Evaluation, animSpeed = 500, animDelay = 250, animateWin: boolean) {

    return new Promise<void>(async(resolve, reject) => {

        if ((evaluation.word.toLowerCase() === 'dixie') && animSpeed > 0) {
             await displayNote('❤️❤️❤️', 0, 1500, "message");
        }

        for (let i = 0; i < evaluation.result.length; i++) {
            const cellToEvaluate = getCell(row, i);
            cellToEvaluate.style.setProperty('--flip-anim-speed', `${animSpeed/1000}s`);

            setTimeout(() => {
                cellToEvaluate.classList.add('flipped');
            }, i * animDelay);

            setTimeout(async() => {

                let key = document.querySelector(`.keycode-${evaluation.word[i].toLowerCase()}`);
                if (evaluation.result[i] === 'Correct') {
                    cellToEvaluate.classList.add('correct');
                    key.classList.add('correct');
                } else if (evaluation.result[i] === 'Misplaced') {
                    cellToEvaluate.classList.add('misplaced');
                    key.classList.add('misplaced');
                } else {
                    cellToEvaluate.classList.add('wrong');
                    if (!key.classList.contains('correct') && !key.classList.contains('misplaced')) {
                        key.classList.add('wrong');
                    }
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
                if (s >= row * WORD_LENGTH + WORD_LENGTH ||
                    s < row * WORD_LENGTH) {
                        squares[s].style.opacity = '0.1';
                    }
            }

            for (let k = 0; k < WORD_LENGTH; k++) {
                const currentCell = getCell(row, k);
                currentCell.style.opacity = `1`;
                
                setTimeout(() => {
                    currentCell.classList.add('jumped');
                
                    if (k === WORD_LENGTH - 1) {
                        setTimeout(() => {
                            resolve();
                        }, 500);
                    }
                
                }, k * 100);
            }
        }, 250);
    })
}