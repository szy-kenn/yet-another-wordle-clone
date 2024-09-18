import { GameState, UserData, Stats, Evaluation } from "./types";
import { WORD_LENGTH, TRIES as defaultTries } from "./game.config";

import {
    initializeUI,
    animateResult,
    isLetter,
    isValid,
    getCell,
    getRow,
    getWord,
    setText,
    displayNote,
    disableKeypad,
    triggerRareEvent,
} from "./ui";

import {
    initializeGameData,
    updateGameStateGuesses,
    getTimeBeforeMidnight,
    getUserData,
    getGameState,
    getSettings,
    updateStats,
    updateGuessStats,
    updateTheme,
    updateMode,
    newGameState,
} from "./data";

export let TRIES = defaultTries;

// ========================== HTML Elements =========================================

// guess distribution values
const statsContainer = document.querySelector<HTMLElement>(".stats-container");
const settingsContainer = document.querySelector<HTMLElement>(
    ".settings-container"
);
const infoContainer = document.querySelector<HTMLElement>(".info-container");
const statsText = document.querySelectorAll<HTMLElement>(".value");
const guessStats = document.querySelectorAll<HTMLElement>(".guess-value");

// objects for statistics section
const cover = document.querySelector<HTMLElement>(".cover");
const statsIcon = document.querySelector<HTMLElement>(".stats-icon");
const settingsIcon = document.querySelector<HTMLElement>(".settings-icon");
const infoIcon = document.querySelector<HTMLElement>(".info-icon");
const copyToClipboardBtn = document.querySelector<HTMLButtonElement>(".copy-to-clipboard-btn");

// keypad keys
const keys = document.querySelectorAll<HTMLElement>(".key");

// new word countdown
const newWordContainer = document.querySelector<HTMLElement>(
    ".next-word-container"
);
const newWordTimeLeft = document.querySelector<HTMLElement>(
    ".next-word-time-value"
);

// reveal word sqrs
const wordToGuessContainer =
    document.querySelector<HTMLElement>(".word-to-guess");
const wordToGuessSqrs =
    document.querySelectorAll<HTMLElement>(".word-to-guess-sqr");

// switch containers and handles
const hardModeSwitchContainer = document.querySelector<HTMLElement>(
    ".hard-mode-switch-container"
);
const hardModeSwitchHandle = document.querySelector<HTMLElement>(
    ".hard-mode-switch-handle"
);
const darkModeSwitchContainer = document.querySelector<HTMLElement>(
    ".dark-mode-switch-container"
);
const darkModeSwitchHandle = document.querySelector<HTMLElement>(
    ".dark-mode-switch-handle"
);
// =================================================================================

// ======== TRACKER ========
let currentRow = 0;
let currentSquare = 0;

// letters that have already been evaluated (correct, misplaced, wrong)

let revealedHints = {
    correct: new Array(WORD_LENGTH),
    misplaced: [],
};

let usedMisplacedLetters = [];

let gameOver = false;
let isWinner = false;
let isAnimating = false;
let shownContainer = null;

/**
 * the initial function to call to start the game (initializes UI and game data)
 */
function start() {
    initializeGameData();

    TRIES = defaultTries + (getGameState().triggered != null && getGameState().triggered === 1 ? 1 : 0);
    initializeUI();

    // load theme
    if (getSettings().theme === "dark") {
        enableDarkMode();
        darkModeSwitchContainer.classList.add("on");
    } else {
        disableDarkMode();
        darkModeSwitchContainer.classList.remove("on");
    }

    // load mode
    if (getSettings().mode === "normal") {
        hardModeSwitchContainer.classList.remove("on");
    } else {
        hardModeSwitchContainer.classList.add("on");
    }

    // get time before midnight to reload the page with a new word to guess
    const timeBeforeMidnight = getTimeBeforeMidnight();

    // reload the page after `timeBeforeMidnight` milliseconds
    setTimeout(() => {
        hideWordToGuess();
        location.reload();
    }, timeBeforeMidnight);
}

/**
 *  display the reveal words and next word timer section in stats container
 */
function revealWordToGuess() {
    wordToGuessContainer.classList.add("displayed");
    newWordContainer.classList.add("displayed");
    document.querySelector<HTMLElement>(".hr-one").style.display = "block";
}

/**
 *  hide the reveal words and next word timer section in stats container
 */
function hideWordToGuess() {
    wordToGuessContainer.classList.remove("displayed");
    newWordContainer.classList.remove("displayed");
    document.querySelector<HTMLElement>(".hr-one").style.display = "none";
}

function addCorrectLetter(i, letter) {
    revealedHints.correct[i] = letter;
}

function addMisplacedLetter(letter) {
    revealedHints.misplaced.push(letter);
}

/**
 * Ends the game, sets the trackers, disables input, and updates stats if desired
 *
 * @param {boolean} isWinner - the winner status at the end of the game
 * @param {boolean} showNote - determines whether to show note before showing the stats or not
 * @param {boolean} update - determines whether to update the game stats or not (useful for loading game state to avoid duplicating the data)
 */
async function end(isWinner: boolean, showNote: boolean, update: boolean) {

    if ((getGameState().triggered == null || getGameState().triggered !== 1) && Math.random() < 0.0001) {
        triggerRareEvent();
        localStorage.setItem("gameState", JSON.stringify({...getGameState(), triggered: 1}));
        TRIES += 1;
        currentSquare = 0;
        currentRow = 6;
        return;
    }

    gameOver = true;
    disableKeypad(true);

    // show hidden containers (word reveal, new word timer)
    revealWordToGuess();

    // set timer for new word
    const newDate = new Date(getTimeBeforeMidnight());
    const newTime = `${newDate
        .getUTCHours()
        .toString()
        .padStart(2, "0")}:${newDate
        .getUTCMinutes()
        .toString()
        .padStart(2, "0")}:${newDate
        .getUTCSeconds()
        .toString()
        .padStart(2, "0")}`;
    setText(newWordTimeLeft as Element, newTime);

    setInterval(() => {
        const newDate = new Date(getTimeBeforeMidnight());
        const newTime = `${newDate
            .getUTCHours()
            .toString()
            .padStart(2, "0")}:${newDate
            .getUTCMinutes()
            .toString()
            .padStart(2, "0")}:${newDate
            .getUTCSeconds()
            .toString()
            .padStart(2, "0")}`;
        setText(newWordTimeLeft as Element, newTime);
    }, 1000);

    // enable the copy to clipboard
    // TODO: make this a separate function (this is duplicate with the other TODO)
    copyToClipboardBtn.classList.remove("disabled");

    // reveal the word
    const wordToGuess = getGameState().wordToGuess;
    const lastEvalScore = evaluate(getWord(currentRow - 1), wordToGuess);

    for (let i = 0; i < wordToGuess.length; i++) {
        wordToGuessSqrs[i].classList.add(lastEvalScore.result[i].toLowerCase());
        setText(wordToGuessSqrs[i].firstElementChild, wordToGuess[i]);
    }

    if (update) {
        updateStats("gamesPlayed", getUserData().gamesPlayed + 1);
    }

    if (isWinner) {
        // update all stats
        if (update) {
            updateGuessStats(currentRow - 1);
            updateStats("gamesWon", getUserData().gamesWon + 1);
            updateStats("currentStreak", getUserData().currentStreak + 1);

            // change longest streak if current streak is already higher
            if (getUserData().currentStreak > getUserData().longestStreak) {
                updateStats("longestStreak", getUserData().currentStreak);
            }
        }

        if (showNote) {
            await displayNote(
                "You got it!",
                WORD_LENGTH * 100 + 500,
                1500,
                "message"
            );
        }
    } else {
        if (update) {
            // make the currentStreak zero
            updateStats("currentStreak", 0);
        }
        if (showNote) {
            // display the popping note
            await displayNote(
                "Unlucky...",
                WORD_LENGTH * 100 + 500,
                1500,
                "message"
            );
        }
    }

    if (update) {
        updateStats(
            "winRate",
            Math.round(
                (getUserData().gamesWon / getUserData().gamesPlayed) * 100
            )
        );
    }

    // show stats after
    showStats(true, getUserData());
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
        result: new Array(WORD_LENGTH),
        correctLetters(): number {
            let count = 0;
            this.result.forEach((res) => {
                if (res === "Correct") {
                    count++;
                }
            });

            return count;
        },
    };

    // convert the string to array of characters
    const availableLetters = word2.toLowerCase().split("");

    // check the correct letters in the correct positions first
    for (let i = 0; i < word1.length; i++) {
        if (word1[i].toLowerCase() === word2[i].toLowerCase()) {
            evaluation.result[i] = "Correct";
            availableLetters[i] = "0";
            addCorrectLetter(i, word1[i].toLowerCase());
        }
    }

    // check for misplaced
    for (let i = 0; i < word1.length; i++) {
        if (evaluation.result[i] !== undefined) {
            continue;
        }
        if (availableLetters.includes(word1[i].toLowerCase())) {
            evaluation.result[i] = "Misplaced";
            availableLetters[availableLetters.indexOf(word1[i].toLowerCase())] =
                "0";
            addMisplacedLetter(word1[i].toLowerCase());
        }
    }

    // make all undefined elements wrong
    for (let i = 0; i < WORD_LENGTH; i++) {
        if (evaluation.result[i] === undefined) {
            evaluation.result[i] = "Wrong";
        }
    }

    return evaluation;
}

function showContainer(container: HTMLElement) {
    if (shownContainer != null) {
        hideContainer(shownContainer);
    }
    container.classList.add("displayed");
    cover.classList.add("displayed");
    shownContainer = container;
}

function hideContainer(container: HTMLElement) {
    container.classList.remove("displayed");
    cover.classList.remove("displayed");
    shownContainer = null;
}

/**
 * show/hide the data passed
 *
 * @param {boolean} show - whether to show the stats container or not
 * @param {boolean} userData - the data that will be displayed
 */
function showStats(show: boolean = true, userData: UserData) {

    // only show the 7 in Guess Distribution if it is triggered, or the player already has a correct guess in the rare 7th try 
    if (getGameState().triggered === 1 || getUserData().guessDistribution[defaultTries] > 0) {
        document.getElementById("guess-distrib-7").style.display = "grid";
    } else {
        document.getElementById("guess-distrib-7").style.display = "none";
    };

    if (show) {
        // flip the squares containing the revealed word (if the game is already over)
        if (gameOver) {
            for (let i = 0; i < wordToGuessSqrs.length; i++) {
                setTimeout(() => {
                    wordToGuessSqrs[i].classList.add("flipped");
                    setTimeout(() => {
                        wordToGuessSqrs[i].classList.remove("flipped");
                    }, 500);
                }, i * 200);
            }
        }

        if (isWinner) {
            // highlight the guess number
            const guessNum = guessStats[currentRow - 1];
            guessNum.classList.add("added");
        }

        // update stats in texts
        document.querySelector<HTMLElement>(
            ".games-played-value-p"
        ).textContent = userData.gamesPlayed.toString();
        document.querySelector<HTMLElement>(".win-rate-value-p").textContent =
            userData.winRate.toString();
        document.querySelector<HTMLElement>(
            ".current-streak-value-p"
        ).textContent = userData.currentStreak.toString();
        document.querySelector<HTMLElement>(
            ".longest-streak-value-p"
        ).textContent = userData.longestStreak.toString();

        for (let i = 0; i < TRIES; i++) {
            setText(guessStats[i], userData.guessDistribution[i].toString());
        }

        // if the player has played any games, every guess percentage width will now be based on its value
        if (userData.gamesPlayed > 0) {
            for (let i = 0; i < guessStats.length; i++) {
                let newWidth =
                    (userData.guessDistribution[i] / userData.gamesWon) * 100;

                if (
                    userData.guessDistribution[i] > 0 &&
                    newWidth <= parseFloat(guessStats[i].style.minWidth)
                ) {
                    newWidth += 1;
                }
                guessStats[i].style.width = `${newWidth}%`;
            }
        }

        showContainer(statsContainer);
    } else {
        hideContainer(statsContainer);
    }
}

/**
 * 
 * @param {GameState} gameState - the current game state (should be completed)
 * @returns {void} - it will just copy to clipboard
 */
export async function copyToClipboard() {
    const gameState: GameState = getGameState();
    const blue: string = "🟦";
    const orange: string = "🟧";
    const gray: string = "⬛";

    const evaluations: string[] = [
        `Wordle ${new Date().toLocaleDateString()}`
    ];

    gameState.guesses.forEach((guess) => {
        let squares = "";  
        evaluate(guess, gameState.wordToGuess).result.forEach(res => {
            if (res === "Correct") {
                squares += blue;
            } else if (res === "Misplaced") {
                squares += orange;
            } else {
                squares += gray;
            }
        });
        evaluations.push(squares);
    });


    if (gameState.guesses[gameState.guesses.length - 1].toLowerCase() === gameState.wordToGuess.toLowerCase()) {
        evaluations.push(`Guessed the word in ${gameState.guesses.length} ${gameState.guesses.length === 1 ? "try" : "tries"} in ${getSettings().mode === "hard" ? "Hard Mode" : "Normal Mode"}.`);
    } else {
        evaluations.push("Failed to guess the word for today.");
    }

    navigator.clipboard.writeText(evaluations.join("\n"));
    // alert("Copied to Clipboard!");
    await displayNote("Copied to clipboard!", 0, 1500, "system");
}


/**
 * Loads an existing game state to the browser
 *
 * @param {GameState} gameState - the game state object to be loaded
 * @returns {Promise} - returns a new Promise that will be resolved after loading the game state
 */
async function loadGameState(gameState: GameState) {
    return new Promise<void>(async (resolve, reject) => {
        if (gameState.ttl == null || gameState.ttl < new Date().getTime()) {
            newGameState();
            hideWordToGuess();
            // TODO: make this a separate function
            copyToClipboardBtn.classList.add("disabled");
            location.reload();
        }

        for (let i = 0; i < gameState.guesses.length; i++) {
            for (let j = 0; j < gameState.guesses[i].length; j++) {
                // get current cell in row i and square index j to get the p element and load the text in gameState
                // TODO: make a function in data.ts to retrieve the inputted guessed in gameState to separate it in this section
                setText(
                    getCell(i, j).firstElementChild,
                    gameState.guesses[i][j]
                );

                // set stricter checking when in hard mode
                if (getSettings().mode === "hard") {
                    let used = revealedHints.misplaced.splice(
                        revealedHints.misplaced.indexOf(
                            gameState.guesses[i][j]
                        ),
                        1
                    );
                    usedMisplacedLetters = usedMisplacedLetters.concat(used);
                }
            }

            const word: string = getWord(i); // get current word
            const evalScore = evaluate(word, getGameState().wordToGuess); // evaluate the current word

            usedMisplacedLetters = [];

            // show the result of evaluated word
            isAnimating = true;
            await animateResult(i, evalScore, 0, 0, true);
            isAnimating = false;

            if (currentRow === 0) {
                hardModeSwitchContainer.classList.add("disabled");
            }

            currentRow++;

            if (evalScore.correctLetters() === WORD_LENGTH) {
                //  if the user has already input the correct word
                isWinner = true;
                end(isWinner, true, false);
                resolve();
                break;
            } else if (currentRow === TRIES) {
                end(isWinner, true, false);
                resolve();
                break;
            }

            if (i === gameState.guesses.length - 1) {
                resolve();
            }
        }
    });
}


const enableDarkMode = () => {
    document.documentElement.style.setProperty(
        "--background-color",
        getComputedStyle(document.documentElement).getPropertyValue(
            "--dark-background-color"
        )
    );
    document.documentElement.style.setProperty(
        "--background-color-rgb",
        getComputedStyle(document.documentElement).getPropertyValue(
            "--dark-background-color-rgb"
        )
    );
    document.documentElement.style.setProperty(
        "--square-border-color",
        getComputedStyle(document.documentElement).getPropertyValue(
            "--dark-square-border-color"
        )
    );
    document.documentElement.style.setProperty(
        "--square-border-color-rgb",
        getComputedStyle(document.documentElement).getPropertyValue(
            "--dark-square-border-color-rgb"
        )
    );
    document.documentElement.style.setProperty(
        "--filled-color",
        getComputedStyle(document.documentElement).getPropertyValue(
            "--dark-filled-color"
        )
    );
    document.documentElement.style.setProperty(
        "--filled-color-rgb",
        getComputedStyle(document.documentElement).getPropertyValue(
            "--dark-filled-color-rgb"
        )
    );
    document.documentElement.style.setProperty(
        "--correct",
        getComputedStyle(document.documentElement).getPropertyValue(
            "--dark-correct"
        )
    );
    document.documentElement.style.setProperty(
        "--misplaced",
        getComputedStyle(document.documentElement).getPropertyValue(
            "--dark-misplaced"
        )
    );
    document.documentElement.style.setProperty(
        "--wrong",
        getComputedStyle(document.documentElement).getPropertyValue(
            "--dark-wrong"
        )
    );
    document.documentElement.style.setProperty(
        "--error",
        getComputedStyle(document.documentElement).getPropertyValue(
            "--dark-error"
        )
    );
    document.documentElement.style.setProperty(
        "--primary",
        getComputedStyle(document.documentElement).getPropertyValue(
            "--dark-primary"
        )
    );
    document.documentElement.style.setProperty(
        "--primary-rgb",
        getComputedStyle(document.documentElement).getPropertyValue(
            "--dark-primary-rgb"
        )
    );
    document.documentElement.style.setProperty(
        "--secondary",
        getComputedStyle(document.documentElement).getPropertyValue(
            "--dark-secondary"
        )
    );
    document.documentElement.style.setProperty(
        "--secondary-rgb",
        getComputedStyle(document.documentElement).getPropertyValue(
            "--dark-secondary-rgb"
        )
    );
    document.documentElement.style.setProperty(
        "--system-color-rgb",
        getComputedStyle(document.documentElement).getPropertyValue(
            "--dark-system-color-rgb"
        )
    );
};

const disableDarkMode = () => {
    document.documentElement.style.setProperty(
        "--background-color",
        getComputedStyle(document.documentElement).getPropertyValue(
            "--light-background-color"
        )
    );
    document.documentElement.style.setProperty(
        "--background-color-rgb",
        getComputedStyle(document.documentElement).getPropertyValue(
            "--light-background-color-rgb"
        )
    );
    document.documentElement.style.setProperty(
        "--square-border-color",
        getComputedStyle(document.documentElement).getPropertyValue(
            "--light-square-border-color"
        )
    );
    document.documentElement.style.setProperty(
        "--square-border-color-rgb",
        getComputedStyle(document.documentElement).getPropertyValue(
            "--light-square-border-color-rgb"
        )
    );
    document.documentElement.style.setProperty(
        "--filled-color",
        getComputedStyle(document.documentElement).getPropertyValue(
            "--light-filled-color"
        )
    );
    document.documentElement.style.setProperty(
        "--filled-color-rgb",
        getComputedStyle(document.documentElement).getPropertyValue(
            "--light-filled-color-rgb"
        )
    );
    document.documentElement.style.setProperty(
        "--correct",
        getComputedStyle(document.documentElement).getPropertyValue(
            "--light-correct"
        )
    );
    document.documentElement.style.setProperty(
        "--misplaced",
        getComputedStyle(document.documentElement).getPropertyValue(
            "--light-misplaced"
        )
    );
    document.documentElement.style.setProperty(
        "--wrong",
        getComputedStyle(document.documentElement).getPropertyValue(
            "--light-wrong"
        )
    );
    document.documentElement.style.setProperty(
        "--error",
        getComputedStyle(document.documentElement).getPropertyValue(
            "--light-error"
        )
    );
    document.documentElement.style.setProperty(
        "--primary",
        getComputedStyle(document.documentElement).getPropertyValue(
            "--light-primary"
        )
    );
    document.documentElement.style.setProperty(
        "--primary-rgb",
        getComputedStyle(document.documentElement).getPropertyValue(
            "--light-primary-rgb"
        )
    );
    document.documentElement.style.setProperty(
        "--secondary",
        getComputedStyle(document.documentElement).getPropertyValue(
            "--light-secondary"
        )
    );
    document.documentElement.style.setProperty(
        "--secondary-rgb",
        getComputedStyle(document.documentElement).getPropertyValue(
            "--light-secondary-rgb"
        )
    );
    document.documentElement.style.setProperty(
        "--system-color-rgb",
        getComputedStyle(document.documentElement).getPropertyValue(
            "--light-system-color-rgb"
        )
    );
};

cover.addEventListener("click", () => {
    // if the cover is displayed, clicking it should close the stats
    hideContainer(shownContainer);
});

infoIcon.addEventListener("click", () => {
    showContainer(infoContainer);

    // animate squares with evaluated colors
    const flipSquares = [
        document.querySelector<HTMLElement>(".square.tutorial-sqr.correct"),
        document.querySelector<HTMLElement>(".square.tutorial-sqr.misplaced"),
        document.querySelector<HTMLElement>(".square.tutorial-sqr.wrong"),
    ];

    // animate colored squares
    for (let i = 0; i < flipSquares.length; i++) {
        setTimeout(() => {
            flipSquares[i].classList.add("flipped");
        }, i * 250);

        setTimeout(() => {
            flipSquares[i].classList.remove("flipped");
        }, i * 250 + 500);
    }
});

statsIcon.addEventListener("click", () => {
    showStats(true, getUserData());
});

settingsIcon.addEventListener("click", () => {
    showContainer(settingsContainer);
});

copyToClipboardBtn.addEventListener("click", () => {
    copyToClipboard();
});

hardModeSwitchContainer.addEventListener("click", () => {
    if (currentRow === 0) {
        hardModeSwitchContainer.classList.toggle("on");
        if (hardModeSwitchContainer.classList.contains("on")) {
            updateMode("hard");
        } else {
            updateMode("normal");
        }
    } else {
        if (hardModeSwitchContainer.classList.contains("on")) {
            displayNote(
                "Hard mode can only be disabled at the start of the round.",
                0,
                1500,
                "error"
            );
        } else {
            displayNote(
                "Hard mode can only be enabled at the start of the round.",
                0,
                1500,
                "error"
            );
        }
    }
});

darkModeSwitchContainer.addEventListener("click", () => {
    darkModeSwitchContainer.classList.toggle("on");
    if (darkModeSwitchContainer.classList.contains("on")) {
        enableDarkMode();
        updateTheme("dark");
    } else {
        disableDarkMode();
        updateTheme("light");
    }
});

// keypad
keys.forEach((key) => {
    ["mousedown", "touchstart"].forEach((event) => {
        key.addEventListener(event, () => {
            if (key.classList.contains("wrong")) {
                key.classList.add("error");
            }
            key.classList.add("pressed");
        });
    });

    ["mouseup", "touchend"].forEach((event) => {
        key.addEventListener(event, () => {
            key.classList.remove("pressed");
        });
    });

    ["mouseleave", "touchcancel"].forEach((event) => {
        key.addEventListener(event, () => {
            if (key.classList.contains("pressed")) {
                key.classList.remove("pressed");
            }
        });
    });

    key.addEventListener("click", () => {
        key.classList.add("popped");
        setTimeout(() => {
            key.classList.remove("popped");
        }, 100);

        // fire an event that simulates a keydown event
        let keyCode = key.textContent;

        if (key.textContent === "Delete") {
            keyCode = "Backspace";
        }

        const keyEvent = new KeyboardEvent("keydown", { key: keyCode });
        document.dispatchEvent(keyEvent);
    });
});

document.addEventListener("keydown", async (event) => {
    if (!gameOver && !isAnimating) {
        let currentKey;

        if (isLetter(event.key) && currentSquare <= WORD_LENGTH - 1) {
            // player should not be able to reuse letters that have already been marked as 'wrong' / incorrect
            if (getSettings().mode === "hard") {

                const keyPressed = document.querySelector<HTMLElement>(`.keycode-${event.key.toLowerCase()}`);

                if (
                    keyPressed.classList.contains("wrong")
                ) {
                    keyPressed.classList.add("pressed");
                    keyPressed.classList.add("error");
                    setTimeout(() => {
                        keyPressed.classList.remove("error");
                        keyPressed.classList.remove("pressed");
                    }, 100);
                    return;
                }

                if (
                    revealedHints.correct[currentSquare] !== undefined &&
                    revealedHints.correct[currentSquare] !==
                        event.key.toLowerCase()
                ) {
                    displayNote(
                        "Hard mode is enabled. Revealed hints must be used.",
                        0,
                        1000,
                        "error"
                    );
                    keyPressed.classList.add("pressed");
                    keyPressed.classList.add("error");
                    setTimeout(() => {
                        keyPressed.classList.remove("error");
                        keyPressed.classList.remove("pressed");
                    }, 100);
                    return;
                }

                if (
                    revealedHints.misplaced.includes(event.key.toLowerCase()) &&
                    revealedHints.correct[currentSquare] !==
                        event.key.toLowerCase()
                ) {
                    let used = revealedHints.misplaced.splice(
                        revealedHints.misplaced.indexOf(
                            event.key.toLowerCase()
                        ),
                        1
                    );
                    usedMisplacedLetters = usedMisplacedLetters.concat(used);
                }
            }

            const currentCell = getCell(currentRow, currentSquare); // get current cell to fill
            setText(currentCell.firstElementChild, event.key); // change text content to the corresponding event key

            currentCell.classList.add("popped");
            currentCell.classList.add("filled"); // change the border color to white (filled cell)
            currentCell.classList.remove("out");

            currentKey = document.querySelector<HTMLElement>(
                `.keycode-${event.key.toLowerCase()}`
            );
            // update the tracker variables
            currentSquare++;
        } else if (event.key === "Backspace") {
            currentKey = document.querySelector<HTMLElement>(`.delete`);

            if (currentSquare !== 0) {
                const currentCell = getCell(currentRow, currentSquare - 1);

                if (getSettings().mode === "hard") {
                    if (
                        usedMisplacedLetters.includes(
                            currentCell.firstElementChild.textContent.toLowerCase()
                        )
                    ) {
                        usedMisplacedLetters.splice(
                            usedMisplacedLetters.indexOf(
                                currentCell.firstElementChild.textContent.toLowerCase()
                            ),
                            1
                        );
                        addMisplacedLetter(
                            currentCell.firstElementChild.textContent.toLowerCase()
                        );
                    }
                }

                currentCell.firstElementChild.textContent = "";
                currentCell.classList.add("out");
                currentCell.classList.remove("filled");
                currentCell.classList.remove("popped");

                currentSquare--;
            }
        } else if (event.key === "Enter") {
            currentKey = document.querySelector<HTMLElement>(`.enter`);

            if (currentSquare === WORD_LENGTH) {
                const word = getWord(currentRow);

                if (isValid(word)) {
                    if (currentRow === 0) {
                        hardModeSwitchContainer.classList.add("disabled");
                    }

                    if (getSettings().mode === "hard") {
                        if (revealedHints.misplaced.length > 0) {
                            displayNote(
                                "All revealed hints must be used.",
                                0,
                                1000,
                                "error"
                            );
                            return;
                        } else {
                            usedMisplacedLetters = [];
                        }
                    }

                    const evalScore = evaluate(
                        word,
                        getGameState().wordToGuess
                    ); // get evaluation of the current word

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
                    } else if (currentRow < TRIES - 1) {
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

                    wrongRow.classList.add("shake");
                    setTimeout(() => {
                        wrongRow.classList.remove("shake");
                    }, 100);
                }
            }
        } else {
            return;
        }

        // make keypad press
        currentKey.classList.add("pressed");
        setTimeout(() => {
            currentKey.classList.remove("pressed");
        }, 50);
    }
});

// Starts the game
start();
loadGameState(getGameState());