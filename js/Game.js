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
        this.playedSongsHistory = []; // To store details of each round

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
        this.uiManager.updateRoundCounter(0, this.maxRounds); // Initialize with 0 rounds played
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
        this.playedSongsHistory = []; // Reset history for a new game
        this.gameActive = true;
        this.songProvider.playedSongs.clear(); 
        this.uiManager.updateScore(this.score);
        this.uiManager.hideGameOver();
        this.uiManager.showPlayingState();
        this.nextRound();
    }

    nextRound() {
        if (!this.gameActive) return; 
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
        this.uiManager.updateRoundCounter(this.roundsPlayed, this.maxRounds);
        this.uiManager.displaySongInfo(this.currentSong, false); 
        this.audioPlayer.loadSong(this.currentSong.filePath);
        this.audioPlayer.play();
        this.uiManager.updatePlayButton(true); 
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

        if (!isCorrect && this.currentSong.alternativeTitles && Array.isArray(this.currentSong.alternativeTitles)) {
            for (const altTitle of this.currentSong.alternativeTitles) {
                if (normalizedUserGuess === this.normalizeString(altTitle)) {
                    isCorrect = true;
                    break; 
                }
            }
        }

        const elapsedTimeMs = this.audioPlayer.getElapsedAttemptTime();
        this.audioPlayer.stop();
        this.uiManager.updatePlayButton(false); 

        let pointsEarned = 0;
        const songRecord = {
            songTitle: this.currentSong.title,
            albumCoverPath: this.currentSong.albumCoverPath,
            guessedCorrectly: false,
            timeToGuess: null,
            status: ''
        };

        if (isCorrect) {
            pointsEarned = this.calculatePoints(elapsedTimeMs);
            this.score += pointsEarned;
            this.uiManager.showFeedback(true, correctAnswer, false, pointsEarned);
            songRecord.guessedCorrectly = true;
            songRecord.timeToGuess = elapsedTimeMs;
            songRecord.status = 'Correct';
        } else {
            this.uiManager.showFeedback(false, correctAnswer);
            songRecord.status = 'Incorrect';
        }
        this.playedSongsHistory.push(songRecord);
        this.uiManager.updateScore(this.score);
        this.uiManager.displaySongInfo(this.currentSong, true); 
        this.uiManager.showRoundOverState(); 
    }

    calculatePoints(elapsedTimeMs) {
        const fiveSeconds = 5000;
        let points = this.basePointsPerSong;
        let timeThreshold = fiveSeconds;

        if (elapsedTimeMs <= timeThreshold) return points;

        let intervals = Math.floor((elapsedTimeMs - 1) / fiveSeconds); 
        
        for (let i = 0; i < intervals; i++) {
            points /= 2;
        }
        
        return Math.max(10, Math.floor(points)); 
    }

    handleSongEnd() {
        if (!this.gameActive || !this.currentSong) {
            return;
        }
        this.uiManager.showFeedback(false, this.currentSong.title, false, 0, true); 
        this.uiManager.displaySongInfo(this.currentSong, true); 
        this.uiManager.updateScore(this.score); 
        this.uiManager.showRoundOverState();

        this.playedSongsHistory.push({
            songTitle: this.currentSong.title,
            albumCoverPath: this.currentSong.albumCoverPath,
            guessedCorrectly: false,
            timeToGuess: null,
            status: 'Ended'
        });
    }

    endGame() {
        this.gameActive = false;
        this.audioPlayer.stop();
        this.uiManager.showGameOver(this.score, this.maxRounds, this.playedSongsHistory);
    }

    normalizeString(str) {
        if (typeof str !== 'string') return '';
        return str.trim().toLowerCase().replace(/[^a-z0-9\s]/gi, '').replace(/\s+/g, ' ');
    }

    togglePlayPause() {
        if (!this.currentSong || !this.gameActive) return;
        if (this.audioPlayer.isPlaying()) {
            this.audioPlayer.pause();
            this.uiManager.updatePlayButton(false); 
        } else {
            this.audioPlayer.play();
            this.uiManager.updatePlayButton(true); 
        }
    }

    skipSong() {
        if (!this.gameActive || !this.currentSong) return;
        this.audioPlayer.stop();
        this.uiManager.updatePlayButton(false);
        this.uiManager.showFeedback(false, this.currentSong.title, true); 
        this.uiManager.displaySongInfo(this.currentSong, true); 
        this.uiManager.showRoundOverState();

        this.playedSongsHistory.push({
            songTitle: this.currentSong.title,
            albumCoverPath: this.currentSong.albumCoverPath,
            guessedCorrectly: false,
            timeToGuess: null,
            status: 'Skipped'
        });
    }
}

export default Game;
