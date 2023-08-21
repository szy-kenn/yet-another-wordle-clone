// global variables
const WORD_LENGTH = 5; // length of the word to be guessed
const TRIES = 6; // maximum number of guesses
const _WORD_TO_GUESS = 'QUART';
// main containers
const gridContainer = document.querySelector(".wordle-grid-container"); // container of all row cotainers containing letter boxes 
// tracker
let squares = [];
let currentRow = 0;
let currentSquare = 0;
let gameOver = false;
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
function evaluate(word) {
    console.log(word);
    for (let i = 0; i < word.length; i++) {
        // get current cell to evaluate
        const cellToEvaluate = getCell(currentRow, i);
        if (word[i].toLowerCase() === _WORD_TO_GUESS[i].toLowerCase()) {
            cellToEvaluate.classList.add('correct');
        }
        else if (_WORD_TO_GUESS.includes(word[i].toUpperCase())) {
            cellToEvaluate.classList.add('misplaced');
        }
        else {
            cellToEvaluate.classList.add('wrong');
        }
    }
}
initialize(WORD_LENGTH, TRIES, gridContainer);
document.addEventListener("keydown", (event) => {
    if (!gameOver) {
        if (isLetter(event.key) && (currentSquare <= WORD_LENGTH - 1)) {
            const currentCell = getCell(currentRow, currentSquare); // get current cell to fill 
            currentCell.firstElementChild.textContent = event.key; // change text content to the corresponding event key
            currentCell.classList.add('filled'); // change the border color to white (filled cell)
            // update the tracker variables
            currentSquare++;
        }
        else if (event.key === 'Backspace') {
            if (currentSquare !== 0) {
                const currentCell = getCell(currentRow, currentSquare - 1);
                currentCell.firstElementChild.textContent = "";
                currentCell.classList.remove('filled');
                currentSquare--;
            }
        }
        else if (event.key === 'Enter') {
            if (currentSquare === WORD_LENGTH) {
                const word = getWord(currentRow);
                evaluate(word);
                if (currentRow < TRIES - 1) {
                    currentRow++;
                    currentSquare = 0;
                }
                else {
                    gameOver = true;
                }
            }
        }
    }
});
