# Project Plan: Adele Song Guessing Game

## 1. Project Title
Adele Song Guessing Game

## 2. Goal
Create an interactive web application where users can listen to snippets of Adele songs and guess the song title.

## 3. Core Features
*   Songs autoplay when a round starts.
*   Users listen to the full song (or until they guess/skip).
*   Allow users to type in their guess for the song title.
*   Provide immediate feedback (correct/incorrect/song ended) to the user.
*   Keep track of the user's score, with dynamic scoring based on guess speed.
*   Display the album cover (`cover.jpg`) and song title *after* the song is correctly guessed, skipped, or the song ends.
*   Option to skip a song.
*   End game screen with final score and option to play again.
*   Play/Pause functionality for the current song.

## 4. Technology Stack
*   **Frontend:** HTML, CSS, JavaScript (ES6+)
*   **Audio Handling:** HTML5 `<audio>` element.
*   **(Optional Server-side for song list generation):** A simple script (e.g., Node.js or Python) could be used to generate a JSON list of available songs if manual creation becomes too cumbersome. For now, we can assume a manually curated list.

## 5. JavaScript Classes/Modules

### `SongProvider.js`
*   **Responsibilities:**
    *   Loading and managing the list of available songs. This list will need to include file paths, correct titles, and paths to album covers.
    *   Providing random songs for the game.
*   **Properties:**
    *   `songList`: An array of objects, where each object contains `title`, `filePath`, `albumCoverPath`.
*   **Methods:**
    *   `constructor(songDataUrlOrArray)`: Initializes with song data.
    *   `loadSongs()`: Fetches/processes the song list (e.g., from a JSON file or a hardcoded array).
    *   `getRandomSong()`: Returns a random song object from `songList` that hasn't been played recently (to avoid immediate repeats).
    *   `getSongCount()`: Returns the total number of songs.

### `AudioPlayer.js`
*   **Responsibilities:**
    *   Controls audio playback (loading, playing full songs, pausing, stopping).
    *   Tracks playback time for dynamic scoring.
    *   Notifies when a song ends naturally.
*   **Properties:**
    *   `audioElement`: HTML5 `<audio>` element.
    *   `currentSongPath`: Path to the current song file.
    *   `attemptStartTime`: Timestamp for when playback started for the current attempt.
    *   `totalPausedDuration`: Accumulates time the song was paused during an attempt.
    *   `onSongEndCallback`: Callback function for when the song finishes playing.
*   **Methods:**
    *   `constructor(audioElement)`
    *   `loadSong(filePath)`: Loads a new song into the audio element.
    *   `play()`: Plays the loaded song and records the start time.
    *   `pause()`: Pauses the song and records paused duration.
    *   `stop()`: Stops playback and resets timing variables.
    *   `isPlaying()`: Returns boolean.
    *   `getElapsedAttemptTime()`: Calculates the net playback time for the current attempt, accounting for pauses.
    *   `setOnSongEnd(callback)`: Sets a callback for when the song naturally concludes.

### `Game.js`
*   **Responsibilities:**
    *   Manages the overall game state, logic, and flow, including autoplay.
    *   Calculates dynamic scores.
    *   Interacts with `SongProvider`, `AudioPlayer`, and `UIManager`.
*   **Properties:**
    *   `songProvider`: Instance of `SongProvider`.
    *   `audioPlayer`: Instance of `AudioPlayer`.
    *   `uiManager`: Instance of `UIManager`.
    *   `currentSong`: The current song object being played/guessed.
    *   `score`: User's current score.
    *   `roundsPlayed`: Number of rounds played.
    *   `maxRounds`: Maximum number of rounds per game.
    *   `playedSongIds`: Set of IDs of songs already played in the current game.
    *   `gameState`: (e.g., `loading`, `idle`, `playing`, `roundOver`, `gameOver`).
*   **Methods:**
    *   `constructor(songProvider, audioPlayer, uiManager, maxRounds = 10)`
    *   `async initializeGame()`: Loads songs and sets up initial UI.
    *   `startGame()`: Resets game state and starts the first round (with autoplay).
    *   `nextRound()`: Fetches a random song, updates UI, and autoplays the song.
    *   `handleGuess(userGuess)`: Compares guess, calculates points dynamically, provides feedback, updates score, and reveals song info.
    *   `skipSong()`: Skips current song, reveals info, and moves to next round or ends game.
    *   `handleSongEnd()`: Called when song finishes naturally; reveals info, awards minimal points if not guessed, and moves to next round or ends game.
    *   `calculatePoints(elapsedTime)`: Calculates points based on how quickly the user guessed.
    *   `endGame()`: Displays final score.
    *   `normalizeString(str)`: Helper to clean strings.
    *   `togglePlayPause()`: Toggles audio playback.

### `UIManager.js`
*   **Responsibilities:**
    *   Handles all DOM manipulations and user interface updates.
    *   Responds to events from user interactions (e.g., button clicks, input submissions).
*   **Properties:** (DOM Element References)
    *   `albumCoverElement`
    *   `guessInputElement`
    *   `submitButtonElement`
    *   `skipButtonElement`
    *   `scoreDisplayElement`
    *   `feedbackMessageElement`
    *   `playPauseButtonElement`
    *   `nextSongButtonElement`
    *   `gameContainerElement`
    *   `gameOverScreenElement`
*   **Methods:**
    *   `constructor()`: Gets references to DOM elements.
    *   `setupEventListeners(gameInstance)`: Binds event listeners (e.g., guess submission, skip).
    *   `displaySongInfo(song, showFullDetails)`: Updates album art and song title. `showFullDetails` controls whether to show actual info or placeholder.
    *   `showFeedback(type, message, points = null)`: Displays feedback (e.g., correct, incorrect, skipped, ended).
    *   `updateScore(newScore)`
    *   `updateLives(remainingLives)`
    *   `togglePlayPauseButton(isPlaying)`
    *   `resetGuessInput()`
    *   `showLoadingState()`
    *   `showPlayingState()`
    *   `showGameOver(finalScore)`
    *   `hideGameOver()`

## 6. HTML Structure (Conceptual - `index.html`)
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" width="device-width, initial-scale=1.0">
    <title>Adele Song Guessing Game</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <header>
        <h1>Adele Song Guessing Game</h1>
    </header>

    <main id="game-container">
        <section id="album-art-section">
            <img id="album-cover" src="placeholder.png" alt="Album Cover">
        </section>

        <section id="player-controls">
            <audio id="audio-player"></audio>
            <button id="play-pause-btn">Play/Pause</button>
        </section>

        <section id="guessing-area">
            <p id="feedback-message"></p>
            <input type="text" id="guess-input" placeholder="Enter song title">
            <button id="submit-guess-btn">Submit Guess</button>
            <button id="skip-song-btn">Skip Song</button>
        </section>

        <section id="score-area">
            <p>Score: <span id="score-display">0</span></p>
        </section>
    </main>

    <section id="game-over-screen" class="hidden">
        <h2>Game Over!</h2>
        <p>Your final score: <span id="final-score">0</span></p>
        <button id="play-again-btn">Play Again</button>
    </section>

    <script type="module" src="js/main.js"></script>
</body>
</html>
```

## 7. CSS (`css/style.css`)
*   Basic styling for layout, typography, and a pleasant visual appearance.
*   Classes for showing/hiding elements (e.g., `.hidden` for the game over screen).
*   Styling for feedback messages (e.g., green for correct, red for incorrect).

## 8. JavaScript Entry Point (`js/main.js`)
```javascript
import Game from './Game.js';

document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    game.startGame();
});
```

## 9. Project File Structure (Proposed)
```
Adele/
├── css/
│   └── style.css
├── docs/
├── js/
│   ├── main.js         // Entry point, initializes game
│   ├── Game.js         // Core game logic and state
│   ├── SongProvider.js // Manages song data and selection
│   ├── AudioPlayer.js  // Handles audio playback
│   └── UIManager.js    // Manages DOM updates and UI interactions
├── music/              // Existing music files
│   ├── Adele - 19 (2008)/
│   │   ├── ... (song files)
│   │   └── cover.jpg
│   ├── ... (other albums)
├── index.html          // Main HTML file
├── project_plan.md     // This file
└── notes.md            // Tracking development notes
└── songs.json          // (Recommended) List of songs, titles, paths, cover art paths
```

## 10. Development Steps
1.  **Setup Basic HTML & CSS:** Create `index.html` with the basic structure and `style.css` with initial styles.
2.  **Create `songs.json`:** Manually (or with a script) list all songs from the `music/` directory. Each entry should include:
    *   `id` (unique identifier)
    *   `title` (correct title for guessing)
    *   `filePath` (relative path to the .flac file)
    *   `album` (e.g., "19", "21", "25", "30")
    *   `albumCoverPath` (relative path to the `cover.jpg` for that album)
3.  **Implement `SongProvider.js`:**
    *   Load and parse `songs.json`.
    *   Implement `getRandomSong()`.
4.  **Implement `AudioPlayer.js`:**
    *   Basic audio loading and `play()` functionality.
    *   Handle potential issues with FLAC playback in browsers (consider if conversion to MP3/OGG is needed for wider compatibility or if modern browsers handle FLAC sufficiently via `<audio>`). For now, assume FLAC works.
5.  **Implement `UIManager.js` (Initial):**
    *   Get element references.
    *   Basic methods to update score and display album art.
6.  **Implement `Game.js` (Core Logic):**
    *   Integrate `SongProvider` and `AudioPlayer`.
    *   Implement `startGame()`, `nextRound()`, and `handleGuess()` (basic version).
7.  **Connect UI Events in `UIManager.js`:**
    *   Handle guess submission and skip song button clicks.
8.  **Refine `UIManager.js`:**
    *   Implement feedback messages, game over screen.
9.  **Refine `AudioPlayer.js`:**
    *   Ensure robust playback (e.g., full song playback, dynamic scoring).
10. **Styling and UX:** Improve CSS, add transitions, ensure responsiveness.
11. **Testing:** Thoroughly test across different scenarios.
12. **(Optional) Advanced Features:**
    *   Difficulty levels (e.g., shorter snippets, more obscure songs, multiple choice answers).
    *   Hints.
    *   Timer per guess.

## 11. Considerations & Challenges
*   **FLAC Support & File Size:** FLAC files are lossless but can be large. This might lead to longer loading times for song snippets. Test browser compatibility for FLAC. If issues arise, batch conversion to a more web-friendly format like MP3 or OGG might be necessary.
*   **Song Playback:** Full song playback replaces snippets. Dynamic scoring incentivizes quick guesses.
*   **User Experience:** The game should be intuitive and fun. Clear feedback, smooth transitions, and autoplay are key.
*   **Scalability:** If the music library grows significantly, `songs.json` generation should be automated.
*   **Security (Client-Side):** All game logic and song information (including answers) will be client-side, making it possible for users to find answers by inspecting code. This is generally acceptable for a fun, casual game.

This plan provides a solid foundation for building the Adele Song Guessing Game.
