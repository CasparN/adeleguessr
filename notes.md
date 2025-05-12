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

## May 11, 2025

### Feature Enhancements: Autoplay, Dynamic Scoring, Full Song Playback

-   **Modified `AudioPlayer.js`**:
    -   Removed fixed snippet duration logic.
    -   Implemented full song playback.
    -   Added timing mechanisms (`attemptStartTime`, `totalPausedDuration`, `getElapsedAttemptTime()`) to track net playback time for dynamic scoring.
    -   Added `setOnSongEnd(callback)` to allow `Game.js` to react when a song finishes playing naturally.
    -   Constructor now only takes the audio HTML element.
-   **Modified `Game.js`**:
    -   Implemented autoplay of songs when a new round starts in `nextRound()`.
    -   Added `calculatePoints(elapsedTime)` method for dynamic scoring: full points for a quick guess (e.g., within 5 seconds), with points halving for subsequent 5-second intervals.
    -   Added `handleSongEnd()` to manage scenarios where the song finishes before the user guesses or skips. This typically awards 0 or minimal points and reveals the song information.
    -   Updated `handleGuess()` and `skipSong()` to use the new dynamic scoring logic and to correctly transition UI states (e.g., revealing song info only after the round is over).
    -   Album art and song title are now revealed by `UIManager.displaySongInfo(..., true)` only after a guess, skip, or song end.
-   **Modified `UIManager.js`**:
    -   `displaySongInfo(song, showFullDetails)` method updated. `showFullDetails` (boolean) now controls whether to display the actual album art and title or a placeholder (e.g., hidden album art before a guess).
    -   `showFeedback(type, message, points = null)` updated to accommodate different feedback scenarios, including points awarded and messages for when a song ends.
    -   Play/pause button (`#play-pause-btn`) text and state management updated to reflect autoplay (e.g., initially shows "Pause").
    -   UI state methods (`showIdleState`, `showPlayingState`, `showRoundOverState`, `showGameOverState`) refined to support the new game flow and information display rules.
-   **Updated `index.html`**:
    -   Adjustments made to support the refined UI states and elements managed by `UIManager.js` for autoplay and dynamic scoring feedback. (Covered by previous `index.html` updates for new buttons and display areas).
-   **Updated `css/style.css`**:
    -   Added styling for `.feedback.ended` to provide distinct visual feedback when a song ends before a guess.
-   **Updated `js/main.js`**:
    -   `AudioPlayer` instantiation updated to reflect its new constructor (no snippet duration).
-   **Project Plan Update**: `project_plan.md` updated to reflect these changes in core features and JS module descriptions.
-   **Notes Update**: This `notes.md` file updated.

## 2023-10-28: Round Counter and Enhanced Game Over Screen

**Implemented:**
*   **Round Counter:**
    *   Added HTML elements (`round-counter`, `current-round-display`, `total-rounds-display`) to `index.html`.
    *   Added CSS for `#round-counter` in `style.css`.
    *   In `UIManager.js`:
        *   Added DOM references for new elements.
        *   Created `updateRoundCounter(currentRound, totalRounds)` method.
        *   Updated `showIdleState`, `showPlayingState`, `showGameOver` to manage visibility.
    *   In `Game.js`:
        *   Called `uiManager.updateRoundCounter` in `initializeGame`, `nextRound`.
*   **Enhanced Game Over Screen:**
    *   Added HTML elements (`played-songs-container`, `played-songs-list`) to `index.html`.
    *   Added CSS for the summary list, items, album covers, and result status (correct/incorrect) in `style.css`.
    *   In `UIManager.js`:
        *   Added DOM references for new elements.
        *   Created `displayPlayedSongsSummary(playedSongsHistory)` to build the list.
        *   Updated `showGameOver` to call `displayPlayedSongsSummary`.
        *   Updated `hideGameOver` to clear the list.
    *   In `Game.js`:
        *   Added `playedSongsHistory` array.
        *   Populated `playedSongsHistory` in `handleGuess`, `handleSongEnd`, and `skipSong` with song title, album cover path, guessed status, time to guess (if applicable), and outcome status.
        *   Passed `playedSongsHistory` to `uiManager.showGameOver` in `endGame`.

**Files Modified:**
*   `index.html`
*   `css/style.css`
*   `js/UIManager.js`
*   `js/Game.js`

Next Steps:
-   Thoroughly test the application for game flow, scoring accuracy, UI responsiveness, and error handling.
-   Verify the `placeholder.png` image path and consider a more robust fallback for `albumCoverPath` in `UIManager.js` if a song's specific cover path is invalid.
-   Consider improving error handling in the `AudioPlayer.js` constructor if the audio HTML element isn't found.

## May 12, 2025
- Implemented new training modes (Album-specific and Adaptive Training Mode) after user review of implementation plan.
- Added `StorageManager.js` for tracking user performance data.
- Updated `SongProvider.js` to support filtering songs by album and performance data.
- Modified `UIManager.js` to add game mode selection UI.
- Updated `Game.js` to integrate training modes and performance tracking.
- Updated project documentation with new features and development steps.
