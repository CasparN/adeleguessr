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
        
        // Round Counter Elements
        this.roundCounterElement = document.getElementById('round-counter');
        this.currentRoundDisplayElement = document.getElementById('current-round-display');
        this.totalRoundsDisplayElement = document.getElementById('total-rounds-display');

        this.gameOverScreenElement = document.getElementById('game-over-screen');
        this.finalScoreElement = document.getElementById('final-score');
        this.maxRoundsPlayedElement = document.getElementById('max-rounds-played');
        this.playSameRoundButton = document.getElementById('play-same-round-btn');
        this.mainMenuButton = document.getElementById('main-menu-btn');
        this.gameModeSummaryElement = document.getElementById('game-mode-summary');

        // Performance Stats Elements
        this.performanceStatsSection = document.getElementById('performance-stats');
        this.bestSongsListElement = document.getElementById('best-songs-list');
        this.worstSongsListElement = document.getElementById('worst-songs-list');
        this.overallStatsElement = document.getElementById('overall-stats'); // For overall accuracy etc.

        // Game Over Summary Elements
        this.playedSongsContainerElement = document.getElementById('played-songs-container');
        this.playedSongsListElement = document.getElementById('played-songs-list');

        this.currentSongTitleElement = document.getElementById('current-song-title');

        // Game Mode Selection Elements
        this.modeStandardRadio = document.getElementById('mode-standard');
        this.modeAlbumTrainRadio = document.getElementById('mode-album-train');
        this.modeAdaptiveTrainRadio = document.getElementById('mode-adaptive-train');
        this.albumSelectionContainer = document.getElementById('album-selection-container');
        this.albumCheckboxesContainer = document.getElementById('album-checkboxes');
        this.adaptiveOptionsContainer = document.getElementById('adaptive-options-container');
        this.adaptiveTypeSelect = document.getElementById('adaptive-type-select');

        // Add audio loading indicator reference
        this.audioLoadingIndicator = document.createElement('div');
        this.audioLoadingIndicator.id = 'audio-loading';
        this.audioLoadingIndicator.className = 'audio-loading hidden';
        this.audioLoadingIndicator.textContent = 'Loading audio...';
        document.getElementById('player-controls')?.appendChild(this.audioLoadingIndicator);

        // Initial state
        if (this.gameContainer) this.gameContainer.classList.add('hidden');
        if (this.gameOverScreenElement) this.gameOverScreenElement.classList.add('hidden');
        if (this.nextSongButtonElement) this.nextSongButtonElement.classList.add('hidden');
        if (this.loadingIndicator) this.loadingIndicator.classList.add('hidden');
        if (this.startButton) this.startButton.classList.add('hidden');
        if (this.albumCoverElement) this.albumCoverElement.src = 'placeholder.png'; // Ensure placeholder at start
        if (this.currentSongTitleElement) this.currentSongTitleElement.classList.add('hidden');
        if (this.roundCounterElement) this.roundCounterElement.classList.add('hidden');
        if (this.playedSongsContainerElement) this.playedSongsContainerElement.classList.add('hidden');

        // Hide mode-specific containers initially
        if (this.albumSelectionContainer) this.albumSelectionContainer.classList.add('hidden');
        if (this.adaptiveOptionsContainer) this.adaptiveOptionsContainer.classList.add('hidden');
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
                    // If Next Song button is visible, Enter means go to next round
                    if (this.nextSongButtonElement && !this.nextSongButtonElement.classList.contains('hidden')) {
                        gameInstance.nextRound();
                    } else { // Otherwise, it's a guess submission
                        gameInstance.handleGuess(this.getGuess());
                    }
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

        if (this.playSameRoundButton) {
            this.playSameRoundButton.addEventListener('click', () => {
                // gameInstance will handle hiding game over screen and restarting
                gameInstance.restartSameGame();
            });
        }

        if (this.mainMenuButton) {
            this.mainMenuButton.addEventListener('click', () => {
                // gameInstance will handle hiding game over screen and resetting state
                gameInstance.returnToMainMenu();
            });
        }

        // Game Mode Radio Button Listeners
        if (this.modeStandardRadio) {
            this.modeStandardRadio.addEventListener('change', () => {
                if (this.albumSelectionContainer) this.albumSelectionContainer.classList.add('hidden');
                if (this.adaptiveOptionsContainer) this.adaptiveOptionsContainer.classList.add('hidden');
            });
        }
        if (this.modeAlbumTrainRadio) {
            this.modeAlbumTrainRadio.addEventListener('change', () => {
                if (this.albumSelectionContainer) this.albumSelectionContainer.classList.remove('hidden');
                if (this.adaptiveOptionsContainer) this.adaptiveOptionsContainer.classList.add('hidden');
            });
        }
        if (this.modeAdaptiveTrainRadio) {
            this.modeAdaptiveTrainRadio.addEventListener('change', () => {
                if (this.albumSelectionContainer) this.albumSelectionContainer.classList.add('hidden');
                if (this.adaptiveOptionsContainer) this.adaptiveOptionsContainer.classList.remove('hidden');
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
            message = `Song ended!`;
            this.feedbackMessageElement.classList.add('ended');
        } else if (isSkip) {
            message = `Skipped!`;
            this.feedbackMessageElement.classList.add('skipped');
        } else if (isCorrect) {
            message = `Correct! +${pointsEarned} points.`;
            this.feedbackMessageElement.classList.add('correct');
        } else {
            message = `Incorrect. No points.`;
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

    updateRoundCounter(currentRound, totalRounds) {
        if (this.currentRoundDisplayElement) {
            this.currentRoundDisplayElement.textContent = currentRound;
        }
        if (this.totalRoundsDisplayElement) {
            this.totalRoundsDisplayElement.textContent = totalRounds;
        }
        if (this.roundCounterElement) {
            if (currentRound > 0 && totalRounds > 0) {
                this.roundCounterElement.classList.remove('hidden');
            } else {
                this.roundCounterElement.classList.add('hidden');
            }
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

    // New methods for game mode UI
    getSelectedGameMode() {
        if (this.modeAlbumTrainRadio && this.modeAlbumTrainRadio.checked) {
            return 'album-train';
        }
        if (this.modeAdaptiveTrainRadio && this.modeAdaptiveTrainRadio.checked) {
            return 'adaptive-train';
        }
        return 'standard'; // Default
    }

    populateAlbumCheckboxes(albums) {
        if (!this.albumCheckboxesContainer) return;
        this.albumCheckboxesContainer.innerHTML = ''; // Clear existing
        if (!albums || albums.length === 0) {
            this.albumCheckboxesContainer.innerHTML = '<p>No albums found to select.</p>';
            return;
        }
        albums.forEach(albumName => {
            const div = document.createElement('div');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `album-${albumName.replace(/\s+/g, '-').toLowerCase()}`; // e.g. album-adele-19-(2008)
            checkbox.value = albumName;
            checkbox.name = 'album-selection';

            const label = document.createElement('label');
            label.htmlFor = checkbox.id;
            label.textContent = albumName;

            div.appendChild(checkbox);
            div.appendChild(label);
            this.albumCheckboxesContainer.appendChild(div);
        });
    }

    getSelectedAlbums() {
        if (!this.albumCheckboxesContainer) return [];
        const selectedAlbums = [];
        const checkboxes = this.albumCheckboxesContainer.querySelectorAll('input[name="album-selection"]:checked');
        checkboxes.forEach(checkbox => {
            selectedAlbums.push(checkbox.value);
        });
        return selectedAlbums;
    }

    getSelectedAdaptiveType() {
        return this.adaptiveTypeSelect ? this.adaptiveTypeSelect.value : 'weakest'; // Default
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
        if (this.roundCounterElement) this.roundCounterElement.classList.add('hidden'); // Hide round counter
        
        // Show game setup options
        const gameSetupOptions = document.getElementById('game-setup-options');
        if (gameSetupOptions) gameSetupOptions.classList.remove('hidden');

        this.clearFeedback();
        this.displaySongInfo(null, false); // Ensure album art is placeholder and title hidden

        // Potentially refresh and show performance stats here
        // This will be triggered by Game.js calling a method that then calls this
    }
    
    showPlayingState() {
        if (this.loadingIndicator) this.loadingIndicator.classList.add('hidden');
        if (this.startButton) this.startButton.classList.add('hidden');
        if (this.gameContainer) this.gameContainer.classList.remove('hidden');
        if (this.gameOverScreenElement) this.gameOverScreenElement.classList.add('hidden');
        if (this.roundCounterElement) this.roundCounterElement.classList.remove('hidden'); // Show round counter
        
        // Hide game setup options during play
        const gameSetupOptions = document.getElementById('game-setup-options');
        if (gameSetupOptions) gameSetupOptions.classList.add('hidden');

        if (this.submitButtonElement) this.submitButtonElement.classList.remove('hidden');
        if (this.skipButtonElement) this.skipButtonElement.classList.remove('hidden');
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
        this.disableGuessing(); // Disables input, and will disable submit/skip via their 'disabled' property

        // Explicitly hide submit and skip buttons
        if (this.submitButtonElement) this.submitButtonElement.classList.add('hidden');
        if (this.skipButtonElement) this.skipButtonElement.classList.add('hidden');
        // Round counter remains visible
        
        if (this.nextSongButtonElement) {
            this.nextSongButtonElement.classList.remove('hidden');
            this.nextSongButtonElement.focus(); // Set focus to allow Enter key press
        }
        
        this.updatePlayButton(false); // Show "Play Song"
        if (this.playPauseButton) {
            this.playPauseButton.disabled = true; 
        }
    }

    showGameOver(finalScore, maxRounds, playedSongsHistory, gameModeDetails) {
        if (this.finalScoreElement) this.finalScoreElement.textContent = finalScore;
        if (this.maxRoundsPlayedElement) this.maxRoundsPlayedElement.textContent = maxRounds;
        
        if (this.gameModeSummaryElement && gameModeDetails) {
            this.gameModeSummaryElement.textContent = gameModeDetails;
            this.gameModeSummaryElement.classList.remove('hidden');
        } else if (this.gameModeSummaryElement) {
            this.gameModeSummaryElement.textContent = ''; // Clear if no details
            this.gameModeSummaryElement.classList.add('hidden');
        }

        if (this.gameOverScreenElement) this.gameOverScreenElement.classList.remove('hidden');
        if (this.gameContainer) this.gameContainer.classList.add('hidden');
        if (this.loadingIndicator) this.loadingIndicator.classList.add('hidden');
        if (this.startButton) this.startButton.classList.add('hidden');
        if (this.roundCounterElement) this.roundCounterElement.classList.add('hidden'); // Hide round counter
        
        // Hide game setup options on game over
        const gameSetupOptions = document.getElementById('game-setup-options');
        if (gameSetupOptions) gameSetupOptions.classList.add('hidden');

        this.displayPlayedSongsSummary(playedSongsHistory);
    }

    hideGameOver() {
        if (this.gameOverScreenElement) this.gameOverScreenElement.classList.add('hidden');
        if (this.playedSongsListElement) this.playedSongsListElement.innerHTML = ''; // Clear summary
        if (this.playedSongsContainerElement) this.playedSongsContainerElement.classList.add('hidden');
        if (this.gameModeSummaryElement) {
            this.gameModeSummaryElement.textContent = '';
            this.gameModeSummaryElement.classList.add('hidden');
        }
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
    
    displayPlayedSongsSummary(playedSongsHistory) {
        if (!this.playedSongsListElement || !this.playedSongsContainerElement) return;

        this.playedSongsListElement.innerHTML = ''; // Clear previous summary

        if (!playedSongsHistory || playedSongsHistory.length === 0) {
            this.playedSongsContainerElement.classList.add('hidden');
            return;
        }

        playedSongsHistory.forEach(songRecord => {
            const listItem = document.createElement('li');
            listItem.classList.add('played-song-item');

            const coverImage = document.createElement('img');
            coverImage.src = songRecord.albumCoverPath || 'placeholder.png';
            coverImage.alt = 'Album Art';
            coverImage.classList.add('summary-album-cover');
            listItem.appendChild(coverImage);

            const songInfoSpan = document.createElement('span');
            songInfoSpan.textContent = songRecord.songTitle;
            listItem.appendChild(songInfoSpan);

            const resultSpan = document.createElement('span');
            resultSpan.classList.add('song-result-status');

            if (songRecord.guessedCorrectly) {
                resultSpan.textContent = ` (Guessed in ${(songRecord.timeToGuess / 1000).toFixed(2)}s)`;
                resultSpan.classList.add('guessed-correctly');
            } else {
                resultSpan.textContent = ` (Missed - ${songRecord.status || 'Not guessed'})`;
                resultSpan.classList.add('guessed-incorrectly');
            }
            listItem.appendChild(resultSpan);
            this.playedSongsListElement.appendChild(listItem);
        });
        this.playedSongsContainerElement.classList.remove('hidden');
    }
    
    displayPerformanceStats(stats) {
        if (!this.performanceStatsSection || !this.bestSongsListElement || !this.worstSongsListElement || !this.overallStatsElement) {
            console.warn("Performance stats UI elements not found.");
            return;
        }

        this.bestSongsListElement.innerHTML = '';
        this.worstSongsListElement.innerHTML = '';
        this.overallStatsElement.innerHTML = '';

        if (stats && stats.error) {
            this.overallStatsElement.innerHTML = `<p style="color: #ffc107;">${stats.error}</p>`;
            this.bestSongsListElement.innerHTML = '<li>N/A</li>';
            this.worstSongsListElement.innerHTML = '<li>N/A</li>';
            this.performanceStatsSection.classList.remove('hidden');
            return;
        }

        if (!stats || (stats.bestSongs.length === 0 && stats.worstSongs.length === 0 && stats.totalPlays === 0)) {
            // Default message if no specific error but no data
            this.overallStatsElement.innerHTML = '<p>Play some rounds to see your performance stats!</p>';
            this.bestSongsListElement.innerHTML = '<li>Play more to see your best songs!</li>';
            this.worstSongsListElement.innerHTML = '<li>No specific songs to practice yet. Keep playing!</li>';
            this.performanceStatsSection.classList.remove('hidden'); // Still show the section with these messages
            return;
        }

        this.performanceStatsSection.classList.remove('hidden');

        // Populate Best Songs
        if (stats.bestSongs && stats.bestSongs.length > 0) {
            stats.bestSongs.forEach(song => {
                const li = document.createElement('li');
                li.textContent = `${song.title} (Accuracy: ${(song.accuracy * 100).toFixed(0)}%, Plays: ${song.playCount})`;
                this.bestSongsListElement.appendChild(li);
            });
        } else {
            const li = document.createElement('li');
            li.textContent = 'Play more to see your best songs!';
            this.bestSongsListElement.appendChild(li);
        }

        // Populate Worst Songs (Songs to Practice)
        if (stats.worstSongs && stats.worstSongs.length > 0) {
            stats.worstSongs.forEach(song => {
                const li = document.createElement('li');
                // For worst songs, show accuracy and perhaps number of incorrect/skipped if relevant
                li.textContent = `${song.title} (Accuracy: ${(song.accuracy * 100).toFixed(0)}%, Plays: ${song.playCount})`;
                this.worstSongsListElement.appendChild(li);
            });
        } else {
            const li = document.createElement('li');
            li.textContent = 'No specific songs to practice yet. Keep playing!';
            this.worstSongsListElement.appendChild(li);
        }
        
        // Populate Overall Stats
        if (stats.totalPlays > 0) {
            const p = document.createElement('p');
            p.textContent = `Overall Accuracy: ${stats.overallAccuracy}% (Total Plays: ${stats.totalPlays})`;
            this.overallStatsElement.appendChild(p);
        } else {
             const p = document.createElement('p');
            // This case should be covered by the block above if totalPlays is 0
            p.textContent = `Play some rounds to see your overall stats.`;
            this.overallStatsElement.appendChild(p);
        }
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

    showAudioLoading() {
        if (this.audioLoadingIndicator) {
            this.audioLoadingIndicator.classList.remove('hidden');
            if (this.playPauseButton) {
                this.playPauseButton.disabled = true;
            }
        }
    }

    hideAudioLoading() {
        if (this.audioLoadingIndicator) {
            this.audioLoadingIndicator.classList.add('hidden');
            if (this.playPauseButton) {
                this.playPauseButton.disabled = false;
            }
        }
    }
}

export default UIManager;
