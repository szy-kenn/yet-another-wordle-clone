function createKeyPad(keyContainer) {
    const keypad = [['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
        ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
        ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫']];
    let tempCounter = 0;
    for (let row of keypad) {
        let keyRow = document.createElement('div');
        for (let letter of row) {
            let key = document.createElement('div');
            key.classList.add(letter);
            key.classList.add('key');
            key.textContent = letter;
            keyRow.appendChild(key);
            tempCounter++;
            key.addEventListener('click', () => {
                key.classList.add('clicked');
                setTimeout(() => {
                    key.classList.remove('clicked');
                }, 100);
                let keyCode = key.textContent;
                if (key.textContent === 'ENTER') {
                    keyCode = 'Enter';
                }
                else if (key.textContent === '⌫') {
                    keyCode = 'Backspace';
                }
                const keyEvent = new KeyboardEvent('keydown', { key: `${keyCode}` });
                document.dispatchEvent(keyEvent);
            });
        }
        keyContainer.appendChild(keyRow);
    }
}
const keyContainer = document.querySelector(".key-container");
createKeyPad(keyContainer);
document.addEventListener("keydown", (event) => {
    console.log(event.key);
});
