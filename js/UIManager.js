class UIManager {
    constructor() {
        this.gameContainer = document.getElementById('game-container');
        this.loadingIndicator = document.getElementById('loading-indicator');
        this.startButton = document.getElementById('start-game-btn');
        this.albumCoverElement = document.getElementById('album-cover');
        this.audioPlayerElement = document.getElementById('audio-player');

        this.playPauseButton = document.getElementById('play-pause-btn');
        this.feedbackMessageElement = document.getElementById('feedback-message');
        this.guessInputElement = document.getElementById('guess-input');
        this.submitButtonElement = document.getElementById('submit-guess-btn');
        this.skipButtonElement = document.getElementById('skip-song-btn');
        this.nextSongButtonElement = document.getElementById('next-song-btn');
        this.scoreDisplayElement = document.getElementById('score-display');
        
        this.gameOverScreenElement = document.getElementById('game-over-screen');
        this.finalScoreElement = document.getElementById('final-score');
        this.maxRoundsPlayedElement = document.getElementById('max-rounds-played');
        this.playAgainButtonElement = document.getElementById('play-again-btn');

        this.currentSongTitleElement = document.getElementById('current-song-title');

        // Initial state
        if (this.gameContainer) this.gameContainer.classList.add('hidden');
        if (this.gameOverScreenElement) this.gameOverScreenElement.classList.add('hidden');
        if (this.nextSongButtonElement) this.nextSongButtonElement.classList.add('hidden');
        if (this.loadingIndicator) this.loadingIndicator.classList.add('hidden');
        if (this.startButton) this.startButton.classList.add('hidden');
        if (this.albumCoverElement) this.albumCoverElement.src = 'placeholder.png'; // Ensure placeholder at start
        if (this.currentSongTitleElement) this.currentSongTitleElement.classList.add('hidden');
    }

    setupEventListeners(gameInstance) {
        if (this.startButton) {
            this.startButton.addEventListener('click', () => gameInstance.startGame());
        }
        if (this.submitButtonElement) {
            this.submitButtonElement.addEventListener('click', () => {
                gameInstance.handleGuess(this.getGuess());
            });
        }
        if (this.guessInputElement) {
            this.guessInputElement.addEventListener('keypress', (event) => {
                if (event.key === 'Enter') {
                    gameInstance.handleGuess(this.getGuess());
                }
            });
        }
        if (this.skipButtonElement) {
            this.skipButtonElement.addEventListener('click', () => gameInstance.skipSong());
        }
        if (this.playPauseButton) {
            this.playPauseButton.addEventListener('click', () => gameInstance.togglePlayPause());
        }
        if (this.nextSongButtonElement) {
            this.nextSongButtonElement.addEventListener('click', () => gameInstance.nextRound());
        }
        if (this.playAgainButtonElement) {
            this.playAgainButtonElement.addEventListener('click', () => {
                this.hideGameOver();
                // Reset UI for a new game start, Game.js->startGame will call showPlayingState
                this.displaySongInfo(null, false); 
                gameInstance.startGame();
            });
        }
    }

    displaySongInfo(song, showFullDetails = false) {
        if (this.albumCoverElement) {
            if (showFullDetails && song && song.albumCoverPath) {
                this.albumCoverElement.src = song.albumCoverPath;
                this.albumCoverElement.alt = song.album || 'Album Cover';
            } else {
                // Reset to placeholder if not already set or if hiding details
                if (this.albumCoverElement.src !== 'placeholder.png') {
                    this.albumCoverElement.src = 'placeholder.png';
                }
                this.albumCoverElement.alt = 'Guess the Album';
            }
        }

        if (this.currentSongTitleElement) {
            if (showFullDetails && song && song.title) {
                this.currentSongTitleElement.textContent = `Song: ${song.title}`;
                this.currentSongTitleElement.classList.remove('hidden');
            } else {
                this.currentSongTitleElement.textContent = '';
                this.currentSongTitleElement.classList.add('hidden');
            }
        }
    }

    showFeedback(isCorrect, correctAnswer = null, isSkip = false, pointsEarned = 0, isSongEnd = false) {
        if (!this.feedbackMessageElement) return;
        this.feedbackMessageElement.classList.remove('correct', 'incorrect', 'skipped', 'ended', 'hidden');
        let message = '';

        if (isSongEnd) {
            message = `Song ended! The song was: ${correctAnswer}.`;
            this.feedbackMessageElement.classList.add('ended');
        } else if (isSkip) {
            message = `Skipped! The song was: ${correctAnswer}.`;
            this.feedbackMessageElement.classList.add('skipped');
        } else if (isCorrect) {
            message = `Correct! +${pointsEarned} points. The song was: ${correctAnswer}.`;
            this.feedbackMessageElement.classList.add('correct');
        } else {
            message = `Incorrect. The song was: ${correctAnswer}.`;
            this.feedbackMessageElement.classList.add('incorrect');
        }
        this.feedbackMessageElement.textContent = message;
        this.feedbackMessageElement.classList.remove('hidden');
    }

    clearFeedback() {
        if (this.feedbackMessageElement) {
            this.feedbackMessageElement.textContent = '';
            this.feedbackMessageElement.classList.add('hidden');
        }
    }
    
    updateScore(newScore) {
        if (this.scoreDisplayElement) {
            this.scoreDisplayElement.textContent = newScore;
        }
    }

    updatePlayButton(isPlaying) {
        if (this.playPauseButton) {
            this.playPauseButton.textContent = isPlaying ? 'Pause Song' : 'Play Song';
        }
    }

    resetGuessInput() {
        if (this.guessInputElement) {
            this.guessInputElement.value = '';
        }
    }

    getGuess() {
        return this.guessInputElement ? this.guessInputElement.value.trim() : '';
    }

    showLoadingState() {
        if (this.loadingIndicator) this.loadingIndicator.classList.remove('hidden');
        if (this.startButton) this.startButton.classList.add('hidden');
        if (this.gameContainer) this.gameContainer.classList.add('hidden');
        if (this.gameOverScreenElement) this.gameOverScreenElement.classList.add('hidden');
    }

    showIdleState() { 
        if (this.loadingIndicator) this.loadingIndicator.classList.add('hidden');
        if (this.startButton) this.startButton.classList.remove('hidden');
        if (this.gameContainer) this.gameContainer.classList.add('hidden'); 
        if (this.gameOverScreenElement) this.gameOverScreenElement.classList.add('hidden');
        this.clearFeedback();
        this.displaySongInfo(null, false); // Ensure album art is placeholder and title hidden
    }
    
    showPlayingState() {
        if (this.loadingIndicator) this.loadingIndicator.classList.add('hidden');
        if (this.startButton) this.startButton.classList.add('hidden');
        if (this.gameContainer) this.gameContainer.classList.remove('hidden');
        if (this.gameOverScreenElement) this.gameOverScreenElement.classList.add('hidden');
        
        if (this.nextSongButtonElement) this.nextSongButtonElement.classList.add('hidden');
        this.enableGuessing();
        this.clearFeedback();
        // Album art and title are handled by Game.js calling displaySongInfo(song, false) in nextRound
        
        this.updatePlayButton(true); // Song is autoplaying, so show Pause
        if (this.playPauseButton) {
            this.playPauseButton.disabled = false; 
        }
    }

    showRoundOverState() { 
        this.disableGuessing();
        if (this.nextSongButtonElement) this.nextSongButtonElement.classList.remove('hidden');
        
        this.updatePlayButton(false); // Show "Play Song"
        if (this.playPauseButton) {
            this.playPauseButton.disabled = true; 
        }
    }

    showGameOver(finalScore, maxRounds) {
        if (this.finalScoreElement) this.finalScoreElement.textContent = finalScore;
        if (this.maxRoundsPlayedElement) this.maxRoundsPlayedElement.textContent = maxRounds;
        if (this.gameOverScreenElement) this.gameOverScreenElement.classList.remove('hidden');
        if (this.gameContainer) this.gameContainer.classList.add('hidden');
        if (this.loadingIndicator) this.loadingIndicator.classList.add('hidden');
        if (this.startButton) this.startButton.classList.add('hidden');
    }

    hideGameOver() {
        if (this.gameOverScreenElement) this.gameOverScreenElement.classList.add('hidden');
    }

    enableGuessing() {
        if (this.guessInputElement) this.guessInputElement.disabled = false;
        if (this.submitButtonElement) this.submitButtonElement.disabled = false;
        if (this.skipButtonElement) this.skipButtonElement.disabled = false;
        if (this.playPauseButton) this.playPauseButton.disabled = false;
        if (this.guessInputElement) this.guessInputElement.focus();
    }

    disableGuessing() {
        if (this.guessInputElement) this.guessInputElement.disabled = true;
        if (this.submitButtonElement) this.submitButtonElement.disabled = true;
        if (this.skipButtonElement) this.skipButtonElement.disabled = true; 
    }
    
    showError(message) {
        if (this.feedbackMessageElement) {
            this.feedbackMessageElement.textContent = message;
            this.feedbackMessageElement.className = 'feedback error'; 
            this.feedbackMessageElement.classList.remove('hidden');
        } else {
            alert(message); 
        }
        if (this.loadingIndicator) this.loadingIndicator.classList.add('hidden');
        if (this.startButton) this.startButton.classList.add('hidden');
        if (this.gameContainer) this.gameContainer.classList.add('hidden');
    }
}

export default UIManager;
