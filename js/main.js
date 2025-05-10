import Game from './Game.js';
import SongProvider from './SongProvider.js';
import AudioPlayer from './AudioPlayer.js';
import UIManager from './UIManager.js';

document.addEventListener('DOMContentLoaded', () => {
    const songProvider = new SongProvider('../songs.json');
    // Make sure your index.html has an <audio> element with id="audio-player"
    const audioPlayer = new AudioPlayer('audio-player', 10); // 10-second snippets
    const uiManager = new UIManager(); 

    const game = new Game(songProvider, audioPlayer, uiManager);

    // Initialize the game (loads songs, sets up UI for start)
    game.initializeGame().catch(error => {
        console.error("Failed to initialize game:", error);
        uiManager.showError("Failed to initialize the game. Please try refreshing the page.");
    });

    // The UIManager will set up event listeners that call game.startGame(), game.handleGuess(), etc.
    // For example, a start button in HTML would be handled by UIManager to call game.startGame()
});
