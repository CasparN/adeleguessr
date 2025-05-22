import Game from './Game.js';
import SongProvider from './SongProvider.js';
import AudioPlayer from './AudioPlayer.js';
import UIManager from './UIManager.js';


document.addEventListener('DOMContentLoaded', () => {
    // Theme Switching Logic
    const themeToggleButton = document.getElementById('dark-mode-toggle-btn');
    const bodyElement = document.body;

    const applyThemePreference = () => {
        const savedTheme = localStorage.getItem('themePreference');
        if (savedTheme === 'dark') {
            bodyElement.classList.add('dark-mode');
            if (themeToggleButton) themeToggleButton.textContent = 'Switch to Light Mode';
        } else {
            bodyElement.classList.remove('dark-mode');
            if (themeToggleButton) themeToggleButton.textContent = 'Switch to Dark Mode';
        }
    };

    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', () => {
            bodyElement.classList.toggle('dark-mode');
            if (bodyElement.classList.contains('dark-mode')) {
                localStorage.setItem('themePreference', 'dark');
                themeToggleButton.textContent = 'Switch to Light Mode';
            } else {
                localStorage.setItem('themePreference', 'light');
                themeToggleButton.textContent = 'Switch to Dark Mode';
            }
        });
    }

    // Apply theme on initial load
    applyThemePreference();

    // Original Game Initialization
    const songProvider = new SongProvider('../songs.json');
    const audioPlayer = new AudioPlayer('audio-player');
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
