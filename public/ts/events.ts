// objects
const cover = document.querySelector<HTMLElement>(".cover");
const statsIcon = document.querySelector<HTMLElement>(".stats-icon");

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

                    evaluate(word);
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