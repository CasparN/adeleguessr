class UIManager {
    constructor() {
        this.gameContainer = document.getElementById('game-container');
        this.loadingIndicator = document.getElementById('loading-indicator');
        this.startButton = document.getElementById('start-game-btn');
        this.albumCoverElement = document.getElementById('album-cover');
        this.audioPlayerElement = document.getElementById('audio-player'); // Though managed by AudioPlayer.js, UIManager might interact with its state via Game.js

        this.playPauseButton = document.getElementById('play-pause-btn'); // Assuming a dedicated play/pause button
        this.feedbackMessageElement = document.getElementById('feedback-message');
        this.guessInputElement = document.getElementById('guess-input');
        this.submitButtonElement = document.getElementById('submit-guess-btn');
        this.skipButtonElement = document.getElementById('skip-song-btn');
        this.nextSongButtonElement = document.getElementById('next-song-btn');
        this.scoreDisplayElement = document.getElementById('score-display');
        
        this.gameOverScreenElement = document.getElementById('game-over-screen');
        this.finalScoreElement = document.getElementById('final-score');
        this.maxRoundsPlayedElement = document.getElementById('max-rounds-played'); // For "x out of y rounds"
        this.playAgainButtonElement = document.getElementById('play-again-btn');

        this.currentSongTitleElement = document.getElementById('current-song-title'); // To display song title after guess/skip

        // Initial state: hide elements that shouldn't be visible at start
        if (this.gameContainer) this.gameContainer.classList.add('hidden');
        if (this.gameOverScreenElement) this.gameOverScreenElement.classList.add('hidden');
        if (this.nextSongButtonElement) this.nextSongButtonElement.classList.add('hidden');
        if (this.loadingIndicator) this.loadingIndicator.classList.add('hidden');
        if (this.startButton) this.startButton.classList.add('hidden');
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
                gameInstance.startGame();
            });
        }
    }

    displaySongInfo(song, showTitle = false) {
        if (this.albumCoverElement && song && song.albumCoverPath) {
            this.albumCoverElement.src = song.albumCoverPath;
            this.albumCoverElement.alt = song.album || 'Album Cover';
        } else if (this.albumCoverElement) {
            this.albumCoverElement.src = 'placeholder.jpg'; // Default placeholder
            this.albumCoverElement.alt = 'Album Cover';
        }

        if (this.currentSongTitleElement) {
            if (showTitle && song && song.title) {
                this.currentSongTitleElement.textContent = `Song: ${song.title}`;
                this.currentSongTitleElement.classList.remove('hidden');
            } else {
                this.currentSongTitleElement.textContent = '';
                this.currentSongTitleElement.classList.add('hidden');
            }
        }
    }

    showFeedback(isCorrect, correctAnswer = null, isSkip = false) {
        if (!this.feedbackMessageElement) return;
        this.feedbackMessageElement.classList.remove('correct', 'incorrect', 'skipped');
        if (isSkip) {
            this.feedbackMessageElement.textContent = `Skipped! The song was: ${correctAnswer}`;
            this.feedbackMessageElement.classList.add('skipped');
        } else if (isCorrect) {
            this.feedbackMessageElement.textContent = 'Correct!';
            this.feedbackMessageElement.classList.add('correct');
        } else {
            this.feedbackMessageElement.textContent = `Incorrect. The song was: ${correctAnswer}`;
            this.feedbackMessageElement.classList.add('incorrect');
        }
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
            this.playPauseButton.textContent = isPlaying ? 'Pause Snippet' : 'Play Snippet';
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

    showIdleState() { // After loading, ready to start
        if (this.loadingIndicator) this.loadingIndicator.classList.add('hidden');
        if (this.startButton) this.startButton.classList.remove('hidden');
        if (this.gameContainer) this.gameContainer.classList.add('hidden'); // Game UI still hidden
        if (this.gameOverScreenElement) this.gameOverScreenElement.classList.add('hidden');
        this.clearFeedback();
        if(this.currentSongTitleElement) this.currentSongTitleElement.classList.add('hidden');
    }
    
    showPlayingState() {
        if (this.loadingIndicator) this.loadingIndicator.classList.add('hidden');
        if (this.startButton) this.startButton.classList.add('hidden');
        if (this.gameContainer) this.gameContainer.classList.remove('hidden');
        if (this.gameOverScreenElement) this.gameOverScreenElement.classList.add('hidden');
        if (this.nextSongButtonElement) this.nextSongButtonElement.classList.add('hidden');
        this.enableGuessing();
        this.clearFeedback();
        this.updatePlayButton(false); // Reset to "Play Snippet"
    }

    showRoundOverState() { // After guess/skip, before next round
        this.disableGuessing();
        if (this.nextSongButtonElement) this.nextSongButtonElement.classList.remove('hidden');
        if (this.playPauseButton) this.playPauseButton.disabled = true;
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
        // Keep skip active or disable? Let's disable it after a guess.
        if (this.skipButtonElement) this.skipButtonElement.disabled = true; 
    }
    
    showError(message) {
        // Could use feedbackMessageElement or a dedicated error div
        if (this.feedbackMessageElement) {
            this.feedbackMessageElement.textContent = message;
            this.feedbackMessageElement.className = 'feedback error'; // Add a general error class
            this.feedbackMessageElement.classList.remove('hidden');
        } else {
            alert(message); // Fallback
        }
        if (this.loadingIndicator) this.loadingIndicator.classList.add('hidden');
        if (this.startButton) this.startButton.classList.add('hidden');
        if (this.gameContainer) this.gameContainer.classList.add('hidden');
    }
}

export default UIManager;
