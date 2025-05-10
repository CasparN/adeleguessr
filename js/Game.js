class Game {
    constructor(songProvider, audioPlayer, uiManager) {
        this.songProvider = songProvider;
        this.audioPlayer = audioPlayer;
        this.uiManager = uiManager;

        this.currentSong = null;
        this.score = 0;
        this.roundsPlayed = 0;
        this.maxRounds = 10; // Or determine by number of songs
        this.gameActive = false;

        this.uiManager.setupEventListeners(this);
    }

    async initializeGame() {
        this.uiManager.showLoadingState();
        await this.songProvider.loadSongs();
        if (this.songProvider.getSongCount() === 0) {
            this.uiManager.showError("No songs loaded. Please check the song data.");
            return;
        }
        this.maxRounds = Math.min(this.maxRounds, this.songProvider.getSongCount());
        this.uiManager.showIdleState(); // Or a state to prompt user to start
        // For now, let's enable the start button if one exists, or prepare for auto-start
        // The UIManager should have a way to display a start button or message
    }

    startGame() {
        if (this.songProvider.getSongCount() === 0) {
            console.error("Cannot start game: No songs loaded.");
            this.uiManager.showError("Cannot start game: No songs available.");
            return;
        }
        this.score = 0;
        this.roundsPlayed = 0;
        this.gameActive = true;
        this.songProvider.playedSongs.clear(); // Reset played songs for a new game
        this.uiManager.updateScore(this.score);
        this.uiManager.hideGameOver();
        this.uiManager.showPlayingState();
        this.nextRound();
    }

    nextRound() {
        if (this.roundsPlayed >= this.maxRounds) {
            this.endGame();
            return;
        }

        this.currentSong = this.songProvider.getRandomSong();

        if (!this.currentSong) {
            console.error("Failed to get a new song.");
            this.uiManager.showError("Error: Could not load a new song.");
            this.endGame(); // End game if no song can be provided
            return;
        }

        this.roundsPlayed++;
        this.uiManager.displaySongInfo(this.currentSong, false); // false = don't show title yet
        this.audioPlayer.loadSong(this.currentSong.filePath);
        // The UIManager's play button event listener will call audioPlayer.playSnippet()
        // Or, if we want auto-play:
        // this.audioPlayer.playSnippet(); 
        this.uiManager.resetGuessInput();
        this.uiManager.enableGuessing();
    }

    handleGuess(userGuess) {
        if (!this.gameActive || !this.currentSong) {
            return;
        }

        const correctAnswer = this.currentSong.title;
        const isCorrect = this.normalizeString(userGuess) === this.normalizeString(correctAnswer);

        this.audioPlayer.stop(); // Stop audio on guess

        if (isCorrect) {
            this.score++;
            this.uiManager.showFeedback(true, correctAnswer);
        } else {
            this.uiManager.showFeedback(false, correctAnswer);
        }
        this.uiManager.updateScore(this.score);
        this.uiManager.displaySongInfo(this.currentSong, true); // true = show title
        this.uiManager.disableGuessing(); // Disable guessing until next round button is clicked

        // UIManager should provide a "Next Song" button, which then calls this.nextRound()
        // For now, let's assume there's a button that becomes visible.
        // If not, we'd auto-proceed:
        // setTimeout(() => this.nextRound(), 3000); // Auto-proceed after 3 seconds
    }

    endGame() {
        this.gameActive = false;
        this.audioPlayer.stop();
        this.uiManager.showGameOver(this.score, this.maxRounds);
    }

    normalizeString(str) {
        if (typeof str !== 'string') return '';
        return str.trim().toLowerCase().replace(/[^a-z0-9\s]/gi, '').replace(/\s+/g, ' ');
    }

    // Called by UIManager when play/pause is clicked
    togglePlayPause() {
        if (!this.currentSong || !this.gameActive) return;

        if (this.audioPlayer.isPlaying()) {
            this.audioPlayer.pause();
            this.uiManager.updatePlayButton(false); // Show play icon
        } else {
            // If song is loaded but not played yet (e.g. start of round) or paused
            this.audioPlayer.playSnippet();
            this.uiManager.updatePlayButton(true); // Show pause icon
        }
    }

    // Called by UIManager when skip song is clicked
    skipSong() {
        if (!this.gameActive || !this.currentSong) return;
        this.audioPlayer.stop();
        this.uiManager.showFeedback(false, this.currentSong.title, true); // true indicates a skip
        this.uiManager.displaySongInfo(this.currentSong, true); // Show title
        this.uiManager.disableGuessing();
        // UIManager should enable "Next Song" button or auto-proceed
        // For now, let's assume a "Next Song" button is handled by UIManager, which then calls nextRound.
    }
}

export default Game;
