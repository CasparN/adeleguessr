class AudioPlayer {
    constructor(audioElementId) {
        this.audioElement = document.getElementById(audioElementId);
        if (!this.audioElement) {
            console.error(`Audio element with ID '${audioElementId}' not found.`);
            // Potentially throw an error or handle this more gracefully
            return;
        }
        this.currentSongPath = null;
        this.isPlayingState = false; // Renamed from isPlaying to avoid conflict with method
        this.attemptStartTime = 0;
        this.pauseStartTime = 0;
        this.totalPausedDuration = 0;
        this.isCurrentlyPaused = false;
        this.onSongEndCallback = null;

        this.audioElement.addEventListener('ended', () => {
            this.isPlayingState = false;
            this.isCurrentlyPaused = false;
            if (this.onSongEndCallback) {
                this.onSongEndCallback();
            }
        });
    }

    loadSong(filePath) {
        this.currentSongPath = filePath;
        this.audioElement.src = filePath;
        this.audioElement.load(); // Prepares the audio element
        this.attemptStartTime = 0; // Reset for the new song
        this.totalPausedDuration = 0;
        this.isCurrentlyPaused = false;
        this.isPlayingState = false;
    }

    play() {
        if (!this.audioElement || !this.audioElement.src) {
            console.error("Audio source not set or audio element not found.");
            return;
        }
        if (this.isPlayingState && !this.isCurrentlyPaused) return; // Already playing

        this.audioElement.play().then(() => {
            this.isPlayingState = true;
            if (this.isCurrentlyPaused) { // Resuming from pause
                this.totalPausedDuration += (performance.now() - this.pauseStartTime);
            } else { // Starting fresh or after stop
                this.attemptStartTime = performance.now();
                this.totalPausedDuration = 0;
            }
            this.isCurrentlyPaused = false;
        }).catch(error => {
            console.error("Error playing audio:", error);
            // Handle browsers that block autoplay, though user interaction should allow it
            this.isPlayingState = false;
        });
    }

    pause() {
        if (!this.isPlayingState || this.isCurrentlyPaused) return;
        this.audioElement.pause();
        this.pauseStartTime = performance.now();
        this.isCurrentlyPaused = true;
        this.isPlayingState = false; // Reflects that it's not actively playing
    }

    stop() {
        if (!this.audioElement.src) return;
        this.audioElement.pause();
        this.audioElement.currentTime = 0;
        this.isPlayingState = false;
        this.isCurrentlyPaused = false;
        this.attemptStartTime = 0; // Reset timer
        this.totalPausedDuration = 0;
    }

    isPlaying() {
        // More robust check considering the element's state
        return this.audioElement && !this.audioElement.paused && !this.audioElement.ended && this.audioElement.readyState > 2;
    }

    getElapsedAttemptTime() {
        if (!this.attemptStartTime) {
            return 0;
        }
        let elapsed = performance.now() - this.attemptStartTime - this.totalPausedDuration;
        if (this.isCurrentlyPaused) {
            // If currently paused, the duration of this pause shouldn't count yet until resumed.
            // Or, if we want time up to the point of pause:
            // elapsed -= (performance.now() - this.pauseStartTime); // This would be incorrect if pauseStartTime is old
            // The current logic is: time played = (now - start) - total_paused_intervals
            // If it *is* paused, then the time is effectively frozen until resumed.
            // So, the last `performance.now()` in the calculation effectively captures the moment of pause.
        }
        return Math.max(0, elapsed); // Ensure non-negative
    }

    setOnSongEnd(callback) {
        this.onSongEndCallback = callback;
    }
}

export default AudioPlayer;
