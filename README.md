# Yet Another Wordle Clone (temp. name)

Using vanilla **Typescript**, **Sass**, and **Firebase** as a BaaS, this project aims to recreate the popular online word game, Wordle, in its much _sweeter_ version.

# Updates

This project is still under development, but you can try the current test version **[here.](https://yet-another-wordle-clone.web.app)** Please be mindful that your statistics may frequently reset or be cleared whenever changes are made that affect them.

# Change Log

### [x.x.x] 2023-09-02

#### Added

- Added toggle switches in settings
- New key-value pair to store settings (mode, theme) in local storage
- Light and Dark Mode toggle

#### Changed

- Reduced the size of the wordlist (removing extremely hard words)

#### Fixed

- Initializes the size of the guess distribution graph to only fit the content
- Repeating letter evaluation will now only be evaluated once if there is only a single letter existing in the word, the remaining letters will be evaluated as incorrect



