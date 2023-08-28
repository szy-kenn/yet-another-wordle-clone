/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/data.ts":
/*!*********************!*\
  !*** ./src/data.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getGameState: () => (/* binding */ getGameState),
/* harmony export */   getUserData: () => (/* binding */ getUserData),
/* harmony export */   initializeGameData: () => (/* binding */ initializeGameData),
/* harmony export */   updateGameStateGuesses: () => (/* binding */ updateGameStateGuesses),
/* harmony export */   updateGuessStats: () => (/* binding */ updateGuessStats),
/* harmony export */   updateStats: () => (/* binding */ updateStats)
/* harmony export */ });
const config = __webpack_require__(/*! ./game.config */ "./src/game.config.ts");
let gameState = JSON.parse(localStorage.getItem('gameState'));
let userData;
function initializeGameData() {
    if (gameState == null) {
        let newGameState = {
            guesses: [],
            wordToGuess: config.word_to_guess
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
}
function getUserData() {
    return userData;
}
function getGameState() {
    return gameState;
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
    // const guessNum = guessStats[idx];
    // guessNum.classList.add('added');
    localStorage.setItem('userData', JSON.stringify(userData));
}


/***/ }),

/***/ "./src/game.config.ts":
/*!****************************!*\
  !*** ./src/game.config.ts ***!
  \****************************/
/***/ ((module) => {

module.exports = {
    word_length: 5,
    tries: 6,
    word_to_guess: 'LUCKY' // current word to be guessed
};


/***/ }),

/***/ "./src/ui.ts":
/*!*******************!*\
  !*** ./src/ui.ts ***!
  \*******************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   animateResult: () => (/* binding */ animateResult),
/* harmony export */   disableKeypad: () => (/* binding */ disableKeypad),
/* harmony export */   displayNote: () => (/* binding */ displayNote),
/* harmony export */   endGame: () => (/* binding */ endGame),
/* harmony export */   getCell: () => (/* binding */ getCell),
/* harmony export */   getWord: () => (/* binding */ getWord),
/* harmony export */   initializeUI: () => (/* binding */ initializeUI),
/* harmony export */   isValid: () => (/* binding */ isValid),
/* harmony export */   setText: () => (/* binding */ setText)
/* harmony export */ });
const config = __webpack_require__(/*! ./game.config */ "./src/game.config.ts");
// main containers
const gridContainer = document.querySelector(".wordle-grid-container"); // container of all row cotainers containing letter boxes 
const keyContainer = document.querySelector(".key-container");
// winner note
const winnerNote = document.querySelector(".winner-note");
const notes = ['First Try!', 'Hooray!', 'Nice!', 'You got it!', 'Fantastic!', 'Phew!'];
// array of ALL HTML elements of squares in the grid
let squares = [];
function initializeUI(length = config.word_length, tries = config.tries, container = gridContainer) {
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
    // if disabled, set it to the first value, else to the second value
    keyContainer.style.opacity = disable ? '0.5' : '1';
    keyContainer.style.pointerEvents = disable ? 'none' : 'all';
    //TODO: this function should not touch any external variables
    // isAnimating = disable;   
}
function displayNote() {
    // displays the winner note
    setTimeout(() => {
        winnerNote.classList.add('displayed');
    }, (config.config.word_length * 100) + 500);
    setTimeout(() => {
        winnerNote.classList.remove('displayed');
        squares.forEach(square => {
            square.style.opacity = '1';
        });
        // TODO: should not handle showStats()
        // showStats();
    }, (config.word_length * 100) + 2000);
}
function endGame(isOver = true) {
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
function getCell(row, squareIdx) {
    // return the HTML ELEMENT of the square in a specific row
    return squares[(row * config.word_length) + squareIdx];
}
function getWord(row) {
    // get the substring of the current row from the entire array of squares
    const fullRow = squares.slice((row * config.word_length), row * config.word_length + config.word_length);
    let word = "";
    // get each character from the square
    fullRow.forEach(square => word += square.firstElementChild.textContent);
    return word;
}
function setText(cell, text) {
    cell.textContent = text;
}
function isValid(word) {
    return true;
}
function animateResult(row, result, animSpeed = 500, animDelay = 250, handleKeypad = true) {
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
            }
            else if (result[i] === 'Misplaced') {
                cellToEvaluate.classList.add('misplaced');
            }
            else {
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


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _ui__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ui */ "./src/ui.ts");
/* harmony import */ var _data__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./data */ "./src/data.ts");


const config = __webpack_require__(/*! ./game.config */ "./src/game.config.ts");
// guess distribution values
const statsContainer = document.querySelector(".stats-container");
const statsText = document.querySelectorAll(".value");
const guessStats = document.querySelectorAll(".guess-value");
// objects
const cover = document.querySelector(".cover");
const statsIcon = document.querySelector(".stats-icon");
// tracker
let currentRow = 0;
let currentSquare = 0;
let gameOver = false;
let isWinner = false;
let isAnimating = false;
function isLetter(str) {
    let letterRegex = /^[a-zA-Z]$/; // check from start to end if it matches with any letters ranging from a-Z
    return letterRegex.test(str) && str.length == 1;
    // returns true if it matches with the regex AND if it is a single character
}
function evaluate(word1, word2) {
    const evaluation = {
        result: [],
        get correctLetters() {
            let count = 0;
            this.result.forEach(res => {
                if (res === 'Correct') {
                    count++;
                }
            });
            return count;
        }
    };
    for (let i = 0; i < word1.length; i++) {
        if (word1[i].toLowerCase() === word2[i].toLowerCase()) {
            evaluation.result.push('Correct');
        }
        else if (word2.toLowerCase().includes(word1[i].toLowerCase())) {
            evaluation.result.push('Misplaced');
        }
        else {
            evaluation.result.push('Wrong');
        }
    }
    return evaluation;
}
function showStats(show = true, userData) {
    if (show) {
        // update stats in texts
        document.querySelector('.games-played-value-p').textContent = userData.gamesPlayed.toString();
        document.querySelector('.win-rate-value-p').textContent = userData.winRate.toString();
        document.querySelector('.current-streak-value-p').textContent = userData.currentStreak.toString();
        document.querySelector('.longest-streak-value-p').textContent = userData.longestStreak.toString();
        for (let i = 0; i < config.tries; i++) {
            guessStats[i].textContent = userData.guessDistribution[i].toString();
        }
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
function loadGameState(gameState) {
    for (let i = 0; i < gameState.guesses.length; i++) {
        for (let j = 0; j < gameState.guesses[i].length; j++) {
            // get current cell in row i and square index j to get the p element and load the text in gameState
            //TODO: make a function in data.ts to retrieve the inputted guessed in gameState to separate it in this section
            (0,_ui__WEBPACK_IMPORTED_MODULE_0__.setText)((0,_ui__WEBPACK_IMPORTED_MODULE_0__.getCell)(i, j).firstElementChild, gameState.guesses[i][j]);
        }
        const word = (0,_ui__WEBPACK_IMPORTED_MODULE_0__.getWord)(i); // get current word
        const evalScore = evaluate(word, config.word_to_guess); // evaluate the current word
        currentRow++;
    }
}
document.addEventListener("keydown", (event) => {
    if (!gameOver && !isAnimating) {
        if (isLetter(event.key) && (currentSquare <= config.word_length - 1)) {
            const currentCell = (0,_ui__WEBPACK_IMPORTED_MODULE_0__.getCell)(currentRow, currentSquare); // get current cell to fill 
            (0,_ui__WEBPACK_IMPORTED_MODULE_0__.setText)(currentCell.firstElementChild, event.key); // change text content to the corresponding event key 
            currentCell.classList.add('popped');
            currentCell.classList.add('filled'); // change the border color to white (filled cell)
            currentCell.classList.remove('out');
            // update the tracker variables
            currentSquare++;
        }
        else if (event.key === 'Backspace') {
            if (currentSquare !== 0) {
                const currentCell = (0,_ui__WEBPACK_IMPORTED_MODULE_0__.getCell)(currentRow, currentSquare - 1);
                currentCell.firstElementChild.textContent = "";
                currentCell.classList.add('out');
                currentCell.classList.remove('filled');
                currentCell.classList.remove('popped');
                currentSquare--;
            }
        }
        else if (event.key === 'Enter') {
            if (currentSquare === config.word_length) {
                const word = (0,_ui__WEBPACK_IMPORTED_MODULE_0__.getWord)(currentRow);
                if ((0,_ui__WEBPACK_IMPORTED_MODULE_0__.isValid)(word)) {
                    const evalScore = evaluate(word, config.word_to_guess); // get evaluation of the current word
                    (0,_ui__WEBPACK_IMPORTED_MODULE_0__.animateResult)(currentRow, evalScore.result, 250, 250, true);
                    (0,_data__WEBPACK_IMPORTED_MODULE_1__.updateGameStateGuesses)(currentRow, word);
                    if (currentRow < config.tries - 1) {
                        currentRow++;
                        currentSquare = 0;
                    }
                    else {
                        currentRow++;
                        (0,_ui__WEBPACK_IMPORTED_MODULE_0__.endGame)();
                    }
                }
            }
        }
    }
});
cover.addEventListener('click', () => {
    showStats(false, (0,_data__WEBPACK_IMPORTED_MODULE_1__.getUserData)());
});
statsIcon.addEventListener('click', () => {
    showStats(true, (0,_data__WEBPACK_IMPORTED_MODULE_1__.getUserData)());
});
(0,_ui__WEBPACK_IMPORTED_MODULE_0__.initializeUI)();
(0,_data__WEBPACK_IMPORTED_MODULE_1__.initializeGameData)();
// loadGameState();

})();

/******/ })()
;