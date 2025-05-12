import StorageManager from './StorageManager.js';
class Game {
    constructor(songProvider, audioPlayer, uiManager) {
        this.songProvider = songProvider;
        this.audioPlayer = audioPlayer;
        this.uiManager = uiManager;
        this.storageManager = new StorageManager(); // Add StorageManager

        this.currentSong = null;
        this.score = 0;
        this.roundsPlayed = 0;
        this.maxRounds = 10; 
        this.gameActive = false;
        this.loadingAudio = false; // Add loadingAudio state
        this.playedSongsHistory = [];
        this.gameMode = 'standard'; // Add game mode tracking
        this.selectedAlbums = []; // Add selectedAlbums state
        this.adaptiveType = null; // For adaptive training mode

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

        // Clean up performance data for non-existent songs
        const existingSongIds = this.songProvider.getAllSongIds();
        this.storageManager.cleanupMissingItems(existingSongIds);
        
        // Populate album choices for album-specific training
        const albums = this.songProvider.getAvailableAlbums();
        this.uiManager.populateAlbumCheckboxes(albums);
        
        this.maxRounds = Math.min(this.maxRounds, this.songProvider.getSongCount());
        this.uiManager.updateRoundCounter(0, this.maxRounds);
        this.uiManager.showIdleState();

        // Disable game mode changes during gameplay
        const setupOptions = document.getElementById('game-setup-options');
        if (setupOptions) {
            setupOptions.addEventListener('change', (e) => {
                if (this.gameActive) {
                    e.preventDefault();
                    alert('Please finish or restart the current game before changing game mode.');
                    // Reset the radio button to current mode
                    const currentMode = document.getElementById(`mode-${this.gameMode}`);
                    if (currentMode) currentMode.checked = true;
                    return false;
                }
            });
        }
    }

    async startGame() {
        if (this.songProvider.getSongCount() === 0) {
            console.error("Cannot start game: No songs loaded.");
            this.uiManager.showError("Cannot start game: No songs available.");
            return;
        }

        // Get game mode and apply appropriate filters
        this.gameMode = this.uiManager.getSelectedGameMode();
        
        switch (this.gameMode) {
            case 'album-train':
                this.selectedAlbums = this.uiManager.getSelectedAlbums();
                if (this.selectedAlbums.length === 0) {
                    this.uiManager.showError("Please select at least one album for training.");
                    return;
                }
                this.songProvider.applyAlbumFilter(this.selectedAlbums);
                break;
                
            case 'adaptive-train':
                this.adaptiveType = this.uiManager.getSelectedAdaptiveType();
                const performanceData = this.storageManager.getPerformanceData();
                this.songProvider.applyAdaptiveFilter(performanceData, this.adaptiveType);
                break;
                
            default: // 'standard'
                this.songProvider.applyAlbumFilter([]); // Reset to all songs
                break;
        }

        // Check if we have songs after applying filters
        if (this.songProvider.getSongCount() === 0) {
            this.uiManager.showError("No songs available for the selected mode. Please try different options.");
            return;
        }

        this.score = 0;
        this.roundsPlayed = 0;
        this.playedSongsHistory = [];
        this.gameActive = true;
        this.uiManager.updateScore(this.score);
        this.uiManager.hideGameOver();
        this.uiManager.showPlayingState();
        await this.nextRound();
    }

    async nextRound() {
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

        // Add audio loading indicator
        this.loadingAudio = true;
        this.uiManager.showAudioLoading();
        
        try {
            await this.audioPlayer.loadSong(this.currentSong.filePath);
            this.loadingAudio = false;
            this.uiManager.hideAudioLoading();
            this.audioPlayer.play();
            this.uiManager.updatePlayButton(true); 
            this.uiManager.resetGuessInput();
            this.uiManager.enableGuessing();
            this.uiManager.clearFeedback();
        } catch (error) {
            console.error("Error loading audio:", error);
            this.loadingAudio = false;
            this.uiManager.hideAudioLoading();
            this.uiManager.showError("Failed to load audio. Skipping to next song...");
            setTimeout(() => this.nextRound(), 2000);
        }
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

        // Update performance data in StorageManager
        this.storageManager.updateSongStats(
            this.currentSong.id,
            isCorrect ? 'correct' : 'incorrect',
            isCorrect ? elapsedTimeMs : null
        );

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
        if (!this.gameActive || !this.currentSong) return;

        // Update performance data in StorageManager
        this.storageManager.updateSongStats(this.currentSong.id, 'ended');
        
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

        // Update performance data in StorageManager
        this.storageManager.updateSongStats(this.currentSong.id, 'skipped');

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
