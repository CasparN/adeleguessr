# Project Plan: Adele Song Guessing Game

## 1. Project Title
Adele Song Guessing Game

## 2. Goal
Create an interactive web application where users can listen to snippets of Adele songs and guess the song title.

## 3. Core Features
*   Play random audio snippets from Adele's songs located in the `music/` directory.
*   Allow users to type in their guess for the song title.
*   Provide immediate feedback (correct/incorrect) to the user.
*   Keep track of the user's score.
*   Display the album cover (`cover.jpg`) associated with the song currently playing.
*   Option to skip a song or get a new song.
*   End game screen with final score and option to play again.

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
    *   Controls audio playback (loading, playing snippets, pausing, stopping).
*   **Properties:**
    *   `audioElement`: HTML5 `<audio>` element.
    *   `currentSongPath`: Path to the current song file.
    *   `snippetDuration`: Duration of the song snippet to play (e.g., 15-30 seconds).
*   **Methods:**
    *   `constructor(snippetDuration = 20)`
    *   `loadSong(filePath)`: Loads a new song into the audio element.
    *   `playSnippet()`: Plays a predefined duration of the loaded song. Might involve setting `currentTime` and using a `setTimeout` to stop.
    *   `pause()`
    *   `stop()`
    *   `isPlaying()`: Returns boolean.

### `Game.js`
*   **Responsibilities:**
    *   Manages the overall game state, logic, and flow.
    *   Interacts with `SongProvider`, `AudioPlayer`, and `UIManager`.
*   **Properties:**
    *   `songProvider`: Instance of `SongProvider`.
    *   `audioPlayer`: Instance of `AudioPlayer`.
    *   `uiManager`: Instance of `UIManager`.
    *   `currentSong`: The current song object being played/guessed.
    *   `score`: User's current score.
    *   `lives` or `attemptsLeft`: Number of incorrect guesses allowed per song or overall.
    *   `gameState`: (e.g., `loading`, `playing`, `guessing`, `feedback`, `gameOver`).
*   **Methods:**
    *   `constructor()`
    *   `startGame()`: Initializes the game, fetches the first song, updates UI.
    *   `nextRound()`: Loads and plays a new song snippet.
    *   `submitGuess(guess)`: Compares the user's guess with `currentSong.title`. Updates score and lives accordingly. Provides feedback via `UIManager`.
    *   `skipSong()`: Loads a new song without penalty or with a small penalty.
    *   `endGame()`: Displays final score and game over message.

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
    *   `playPauseButtonElement` (if manual snippet control is desired)
    *   `gameContainerElement`
    *   `gameOverScreenElement`
*   **Methods:**
    *   `constructor()`: Gets references to DOM elements.
    *   `setupEventListeners(gameInstance)`: Binds event listeners (e.g., guess submission, skip).
    *   `displaySongInfo(song)`: Updates album art.
    *   `showFeedback(isCorrect, correctAnswer = null)`: Displays "Correct!" or "Incorrect. The answer was: [Song Title]".
    *   `updateScore(newScore)`
    *   `updateLives(remainingLives)`
    *   `togglePlayButton(isPlaying)`
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
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Adele Song Guessing Game</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <header>
        <h1>Adele Song Guessing Game</h1>
    </header>

    <main id="game-container">
        <section id="album-art-section">
            <img id="album-cover" src="placeholder.jpg" alt="Album Cover">
        </section>

        <section id="player-controls">
            <!-- Audio element will be controlled by JS, might not be visible -->
            <audio id="audio-player"></audio>
            <!-- Optional: <button id="play-pause-btn">Play Snippet</button> -->
        </section>

        <section id="guessing-area">
            <p id="feedback-message"></p>
            <input type="text" id="guess-input" placeholder="Enter song title">
            <button id="submit-guess-btn">Submit Guess</button>
            <button id="skip-song-btn">Skip Song</button>
        </section>

        <section id="score-area">
            <p>Score: <span id="score-display">0</span></p>
            <!-- Optional: <p>Lives: <span id="lives-display">3</span></p> -->
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
    *   Basic audio loading and `playSnippet()` functionality.
    *   Handle potential issues with FLAC playback in browsers (consider if conversion to MP3/OGG is needed for wider compatibility or if modern browsers handle FLAC sufficiently via `<audio>`). For now, assume FLAC works.
5.  **Implement `UIManager.js` (Initial):**
    *   Get element references.
    *   Basic methods to update score and display album art.
6.  **Implement `Game.js` (Core Logic):**
    *   Integrate `SongProvider` and `AudioPlayer`.
    *   Implement `startGame()`, `nextRound()`, and `submitGuess()` (basic version).
7.  **Connect UI Events in `UIManager.js`:**
    *   Handle guess submission and skip song button clicks.
8.  **Refine `UIManager.js`:**
    *   Implement feedback messages, game over screen.
9.  **Refine `AudioPlayer.js`:**
    *   Ensure robust snippet playing (e.g., random start point within the song, or fixed preview duration).
10. **Styling and UX:** Improve CSS, add transitions, ensure responsiveness.
11. **Testing:** Thoroughly test across different scenarios.
12. **(Optional) Advanced Features:**
    *   Difficulty levels (e.g., shorter snippets, more obscure songs, multiple choice answers).
    *   Hints.
    *   Timer per guess.

## 11. Considerations & Challenges
*   **FLAC Support & File Size:** FLAC files are lossless but can be large. This might lead to longer loading times for song snippets. Test browser compatibility for FLAC. If issues arise, batch conversion to a more web-friendly format like MP3 or OGG might be necessary.
*   **Song Snippet Generation:** Decide on a strategy for snippets:
    *   Play the first X seconds.
    *   Play X seconds from a random point in the song.
    *   Manually define start/end times for snippets in `songs.json` (most control, but most effort).
*   **User Experience:** The game should be intuitive and fun. Clear feedback and smooth transitions are key.
*   **Scalability:** If the music library grows significantly, `songs.json` generation should be automated.
*   **Security (Client-Side):** All game logic and song information (including answers) will be client-side, making it possible for users to find answers by inspecting code. This is generally acceptable for a fun, casual game.

This plan provides a solid foundation for building the Adele Song Guessing Game.
