# Project Notes: Adele Song Guessing Game

## May 10, 2025

-   User requested a project plan for an Adele song guessing game as a web app.
-   Acknowledged existing music files in the `music/` directory.
-   Task: Create a project plan detailing JS classes, UI display, and overall structure.
-   Task: Create this `notes.md` file to track actions.
-   Action: Created `notes.md`.
-   Action: Created `project_plan.md`.
-   User requested to create `songs.json`.
-   Action: Listed contents of `music/` subdirectories to gather song information.
-   Action: Created `songs.json` with song details (id, title, filePath, album, albumCoverPath).
-   Action: Corrected escape characters in `songs.json`.
-   User confirmed `songs.json` is correct.
-   Action: Created `index.html` with basic structure.
-   Action: Created `css/style.css` with initial styles.
-   User initialized a git repository.
-   Next Action: Create `js/SongProvider.js`.

### Action: Implemented `js/Game.js` and `js/main.js`
- **`js/Game.js`**: Created the `Game` class with core game logic:
    - `constructor(songProvider, audioPlayer, uiManager)`: Initializes dependencies.
    - `async initializeGame()`: Loads songs via `SongProvider` and prepares UI via `UIManager`.
    - `startGame()`: Resets game state (score, rounds), clears previously played songs, and starts the first round.
    - `nextRound()`: Fetches a random song, updates UI for the new round, and loads the song into `AudioPlayer`.
    - `handleGuess(userGuess)`: Compares the normalized user guess with the current song's title, provides feedback, updates the score, and reveals song info.
    - `endGame()`: Called when max rounds are reached; displays the final score via `UIManager`.
    - `normalizeString(str)`: Helper to clean and standardize strings for comparison.
    - `togglePlayPause()`: Manages audio playback state, called by `UIManager`.
    - `skipSong()`: Handles skipping the current song, called by `UIManager`.
- **`js/main.js`**: Created the main entry point for the application:
    - Imports `Game`, `SongProvider`, `AudioPlayer`, and `UIManager`.
    - Instantiates these classes on `DOMContentLoaded`.
    - Calls `game.initializeGame()` to load song data and set up the initial UI state.
    - Includes basic error handling for game initialization.

### Action: Updated `index.html` and `css/style.css` for refined `UIManager`
- **`index.html`**: 
    - Added a `div` with `id="loading-indicator"`.
    - Added a `button` with `id="start-game-btn"`.
    - Added `button` with `id="play-pause-btn"` within `#player-controls`.
    - Added `p` with `id="current-song-title"` to display the song title after a guess/skip.
    - Added `button` with `id="next-song-btn"` for proceeding to the next round.
    - Updated the game over screen to include `<span id="max-rounds-played"></span>`.
    - Ensured all new interactive elements are initially hidden via the `hidden` class as appropriate.
- **`css/style.css`**:
    - Added styles for `#loading-indicator`, `#start-game-btn`, `#play-pause-btn`, `#next-song-btn`.
    - Added styles for `#current-song-title`.
    - Added distinct feedback styles for `.correct`, `.incorrect`, `.skipped`, and a general `.error` class.
    - Improved general layout, button styling, and added a `max-width` to the `main#game-container` for better appearance on wider screens.
    - Ensured the `.hidden` class uses `display: none !important;` for reliable hiding of elements.
