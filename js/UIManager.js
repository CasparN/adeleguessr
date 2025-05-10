class UIManager {
    constructor() {
        this.albumCoverElement = document.getElementById('album-cover');
        this.guessInputElement = document.getElementById('guess-input');
        this.submitButtonElement = document.getElementById('submit-guess-btn');
        this.skipButtonElement = document.getElementById('skip-song-btn');
        this.scoreDisplayElement = document.getElementById('score-display');
        this.feedbackMessageElement = document.getElementById('feedback-message');
        this.gameContainerElement = document.getElementById('game-container');
        this.gameOverScreenElement = document.getElementById('game-over-screen');
        this.finalScoreElement = document.getElementById('final-score');
        this.playAgainButtonElement = document.getElementById('play-again-btn');

        if (!this.albumCoverElement || !this.guessInputElement || !this.submitButtonElement || 
            !this.skipButtonElement || !this.scoreDisplayElement || !this.feedbackMessageElement || 
            !this.gameContainerElement || !this.gameOverScreenElement || !this.finalScoreElement || 
            !this.playAgainButtonElement) {
            console.error('One or more UI elements not found. Check your HTML IDs.');
            // Potentially throw an error or handle this more gracefully
        }
    }

    setupEventListeners(gameInstance) {
        if (!gameInstance) {
            console.error('Game instance not provided to UIManager for event setup.');
            return;
        }

        this.submitButtonElement.addEventListener('click', () => {
            gameInstance.submitGuess(this.getGuess());
        });

        this.skipButtonElement.addEventListener('click', () => {
            gameInstance.skipSong();
        });

        this.playAgainButtonElement.addEventListener('click', () => {
            gameInstance.startGame(); 
        });
        
        // Allow submitting guess with Enter key
        this.guessInputElement.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                gameInstance.submitGuess(this.getGuess());
            }
        });
    }

    displaySongInfo(song) {
        if (song && song.albumCoverPath) {
            this.albumCoverElement.src = song.albumCoverPath;
            this.albumCoverElement.alt = `Album cover for ${song.album}`;
        } else {
            this.albumCoverElement.src = 'placeholder.jpg'; // Default placeholder
            this.albumCoverElement.alt = 'Album Cover';
            console.warn('Song info or albumCoverPath missing for displaySongInfo', song);
        }
    }

    showFeedback(isCorrect, correctAnswer = null) {
        if (isCorrect) {
            this.feedbackMessageElement.textContent = 'Correct!';
            this.feedbackMessageElement.className = 'correct';
        } else {
            let message = 'Incorrect.';
            if (correctAnswer) {
                message += ` The answer was: ${correctAnswer}`;
            }
            this.feedbackMessageElement.textContent = message;
            this.feedbackMessageElement.className = 'incorrect';
        }
        // Clear feedback after a few seconds
        setTimeout(() => {
            this.feedbackMessageElement.textContent = '';
            this.feedbackMessageElement.className = '';
        }, 3000);
    }

    updateScore(newScore) {
        this.scoreDisplayElement.textContent = newScore;
    }

    resetGuessInput() {
        this.guessInputElement.value = '';
    }

    getGuess() {
        return this.guessInputElement.value.trim();
    }

    showLoadingState() {
        this.feedbackMessageElement.textContent = 'Loading next song...';
        this.feedbackMessageElement.className = '';
        this.submitButtonElement.disabled = true;
        this.skipButtonElement.disabled = true;
        this.guessInputElement.disabled = true;
    }

    showPlayingState() {
        this.feedbackMessageElement.textContent = ''; // Clear loading message
        this.submitButtonElement.disabled = false;
        this.skipButtonElement.disabled = false;
        this.guessInputElement.disabled = false;
        this.guessInputElement.focus(); 
    }

    showGameOver(finalScore) {
        this.finalScoreElement.textContent = finalScore;
        this.gameContainerElement.classList.add('hidden');
        this.gameOverScreenElement.classList.remove('hidden');
    }

    hideGameOver() {
        this.gameOverScreenElement.classList.add('hidden');
        this.gameContainerElement.classList.remove('hidden');
    }
}

export default UIManager;
