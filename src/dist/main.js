// global variables
const WORD_LENGTH = 6; // length of the word to be guessed
const TRIES = 6; // maximum number of guesses
// main containers
const gridContainer = document.querySelector(".wordle-grid-container"); // container of all row cotainers containing letter boxes 
function initialize(length, tries, container) {
    for (let i = 0; i < tries; i++) {
        // create a new row 
        const row = document.createElement("div");
        row.classList.add('row-container');
        // add the squares in the row
        for (let j = 0; j < length; j++) {
            const square = document.createElement("div");
            square.classList.add("square");
            row.appendChild(square);
        }
        container.appendChild(row);
    }
}
function isLetter(str) {
    let letterRegex = /^[a-zA-Z]$/; // check from start to end if it matches with any letters ranging from a-Z
    return letterRegex.test(str) && str.length == 1;
    // returns true if it matches with the regex AND if it is a single character
}
initialize(WORD_LENGTH, TRIES, gridContainer);
document.addEventListener("keydown", (event) => {
    console.log(event.key);
});
