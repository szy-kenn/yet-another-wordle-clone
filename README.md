# Yet Another Wordle Clone (temp. name)

Using vanilla **Typescript**, **Sass**, and **Firebase** for hosting, this project aims to recreate the popular online word game, Wordle, in its much _sweeter_ version.

# Updates

This project reached its completion with some modifications and improvements to be done.

**[Try the game here!](https://yet-another-wordle-clone.web.app/)**

# Change Log

## 2024-09-13

### Fixed

- Fixed background and text color of pop-up notes.

## 2024-09-12

### Changed

- **Word of the Day** is now the same for all players.

## 2023-09-29

### Added

- Added error message when disabling hard mode while in the middle of the game.

## 2023-09-27

### Added

- Added error animation when a letter that has already been marked as incorrect is clicked.

## 2023-09-08

### Fixed

- Fixed applying the error animation to the correct current row

## 2023-09-02

### Added

- Hard Mode has been implemented in the game

### Changed

- The game will now check the word's validity in a bigger wordlist
- The wordlist for valid inputs and random daily words has been separated

### Fixed

- In case of repeating letters, the game's evaluation process will now prioritize checking if the letter is in the correct position before assessing any misplaced letters.

## 2023-09-01

### Added

- Added toggle switches in settings
- New key-value pair to store settings (mode, theme) in local storage
- Light and Dark Mode toggle

### Changed

- Reduced the size of the wordlist (removing extremely hard words)

### Fixed

- Initializes the size of the guess distribution graph to only fit the content
- Repeating letter evaluation will now only be evaluated once if there is only a single letter existing in the word, the remaining letters will be evaluated as incorrect
