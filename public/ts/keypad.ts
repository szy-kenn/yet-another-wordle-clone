// keypad
const keys = document.querySelectorAll<HTMLElement>(".key");
keys.forEach(key => {

    ['mousedown', 'touchstart'].forEach(event => {
        key.addEventListener(event, () => {
            key.classList.add('pressed');
        })
    });

    ['mouseup', 'touchend'].forEach(event => {
        key.addEventListener(event, () => {
            key.classList.remove('pressed');
        })
    });

    ['mouseleave', 'touchcancel'].forEach(event => {
        key.addEventListener(event, () => {
            if (key.classList.contains('pressed')) {
                key.classList.remove('pressed');
            }
        })
    })

    key.addEventListener('click', () => {
        key.classList.add('popped');
        console.log("here")
        setTimeout(() => {
            key.classList.remove('popped');
        }, 100);

        // fire an event that simulates a keydown event
        let keyCode = key.textContent;

        if (key.textContent === 'Delete') {
            keyCode = 'Backspace';
        }

        const keyEvent = new KeyboardEvent('keydown', {key: keyCode})
        document.dispatchEvent(keyEvent);

    })
})