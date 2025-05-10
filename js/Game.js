class Game {
    constructor(songProvider, audioPlayer, uiManager) {
        this.songProvider = songProvider;
        this.audioPlayer = audioPlayer;
        this.uiManager = uiManager;

        this.currentSong = null;
        this.score = 0;
        this.roundsPlayed = 0;
        this.maxRounds = 10; 
        this.gameActive = false;

        this.basePointsPerSong = 100;

        this.uiManager.setupEventListeners(this);
        this.audioPlayer.setOnSongEnd(() => this.handleSongEnd());
    }

    async initializeGame() {
        this.uiManager.showLoadingState();
        await this.songProvider.loadSongs();
        if (this.songProvider.getSongCount() === 0) {
            this.uiManager.showError("No songs loaded. Please check the song data.");
            return;
        }
        this.maxRounds = Math.min(this.maxRounds, this.songProvider.getSongCount());
        this.uiManager.showIdleState();
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
        this.songProvider.playedSongs.clear(); 
        this.uiManager.updateScore(this.score);
        this.uiManager.hideGameOver();
        this.uiManager.showPlayingState();
        this.nextRound();
    }

    nextRound() {
        if (!this.gameActive) return; // Ensure game is active before proceeding
        if (this.roundsPlayed >= this.maxRounds) {
            this.endGame();
            return;
        }

        this.currentSong = this.songProvider.getRandomSong();

        if (!this.currentSong) {
            console.error("Failed to get a new song.");
            this.uiManager.showError("Error: Could not load a new song.");
            this.endGame();
            return;
        }

        this.roundsPlayed++;
        this.uiManager.displaySongInfo(this.currentSong, false); // false = don't show title/art yet
        this.audioPlayer.loadSong(this.currentSong.filePath);
        this.audioPlayer.play();
        this.uiManager.updatePlayButton(true); // Show pause icon
        this.uiManager.resetGuessInput();
        this.uiManager.enableGuessing();
        this.uiManager.clearFeedback();
        if(this.uiManager.currentSongTitleElement) this.uiManager.currentSongTitleElement.classList.add('hidden');
        if(this.uiManager.nextSongButtonElement) this.uiManager.nextSongButtonElement.classList.add('hidden');
    }

    handleGuess(userGuess) {
        if (!this.gameActive || !this.currentSong) {
            return;
        }

        const correctAnswer = this.currentSong.title;
        const normalizedUserGuess = this.normalizeString(userGuess);
        let isCorrect = normalizedUserGuess === this.normalizeString(correctAnswer);

        // Check alternative titles if the main title didn't match
        if (!isCorrect && this.currentSong.alternativeTitles && Array.isArray(this.currentSong.alternativeTitles)) {
            for (const altTitle of this.currentSong.alternativeTitles) {
                if (normalizedUserGuess === this.normalizeString(altTitle)) {
                    isCorrect = true;
                    break; // Found a match in alternatives
                }
            }
        }

        const elapsedTimeMs = this.audioPlayer.getElapsedAttemptTime();

        this.audioPlayer.stop();
        this.uiManager.updatePlayButton(false); // Show play icon, though it will be disabled

        let pointsEarned = 0;
        if (isCorrect) {
            pointsEarned = this.calculatePoints(elapsedTimeMs);
            this.score += pointsEarned;
            this.uiManager.showFeedback(true, correctAnswer, false, pointsEarned);
        } else {
            this.uiManager.showFeedback(false, correctAnswer);
        }
        this.uiManager.updateScore(this.score);
        this.uiManager.displaySongInfo(this.currentSong, true); // true = show title and art
        this.uiManager.showRoundOverState(); 
    }

    calculatePoints(elapsedTimeMs) {
        const fiveSeconds = 5000;
        let points = this.basePointsPerSong;
        let timeThreshold = fiveSeconds;

        if (elapsedTimeMs <= timeThreshold) return points;

        // Halve points for each 5-second interval exceeded
        // elapsedTimeMs: 0-5000 -> 100pts
        // elapsedTimeMs: 5001-10000 -> 50pts
        // elapsedTimeMs: 10001-15000 -> 25pts
        // elapsedTimeMs: 15001-20000 -> 12.5 -> 12 or 13 pts
        // ... up to a minimum
        let intervals = Math.floor((elapsedTimeMs - 1) / fiveSeconds); // Number of 5s intervals *after the first one*
        
        for (let i = 0; i < intervals; i++) {
            points /= 2;
        }
        
        return Math.max(10, Math.floor(points)); // Minimum 10 points if correct
    }

    handleSongEnd() {
        if (!this.gameActive || !this.currentSong) {
            return;
        }
        // Treat as an incorrect guess if the song ends before user action
        this.uiManager.showFeedback(false, this.currentSong.title, false, 0, true); // isSongEnd = true
        this.uiManager.displaySongInfo(this.currentSong, true); // Show title and art
        this.uiManager.updateScore(this.score); // Score doesn't change
        this.uiManager.showRoundOverState();
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

    togglePlayPause() {
        if (!this.currentSong || !this.gameActive) return;
        // Check using the new isPlaying() which reflects the actual audio element state
        if (this.audioPlayer.isPlaying()) {
            this.audioPlayer.pause();
            this.uiManager.updatePlayButton(false); // Show play icon
        } else {
            this.audioPlayer.play();
            this.uiManager.updatePlayButton(true); // Show pause icon
        }
    }

    skipSong() {
        if (!this.gameActive || !this.currentSong) return;
        this.audioPlayer.stop();
        this.uiManager.updatePlayButton(false);
        this.uiManager.showFeedback(false, this.currentSong.title, true); // true indicates a skip
        this.uiManager.displaySongInfo(this.currentSong, true); // Show title and art
        this.uiManager.showRoundOverState();
    }
}

export default Game;
