class AudioPlayer {
    constructor(audioElementId, snippetDuration = 20) {
        this.audioElement = document.getElementById(audioElementId);
        if (!this.audioElement) {
            throw new Error(`Audio element with ID '${audioElementId}' not found.`);
        }
        this.snippetDuration = snippetDuration; // in seconds
        this.currentSongPath = null;
        this.snippetTimeout = null; // To store the timeout ID for stopping the snippet

        // Ensure audio context is resumed on user interaction if necessary
        this._resumeAudioContext();
    }

    _resumeAudioContext() {
        if (this.audioElement.paused && this.audioElement.src) {
            // A common pattern to resume audio context on user gesture
            const playPromise = this.audioElement.play();
            if (playPromise !== undefined) {
                playPromise.then(_ => {
                    this.audioElement.pause(); // Pause immediately after resuming context
                }).catch(error => {
                    console.warn("Audio context couldn't be resumed automatically:", error);
                });
            }
        }
    }

    loadSong(filePath) {
        this.currentSongPath = filePath;
        this.audioElement.src = filePath;
        this.audioElement.load(); // Prepares the audio element
        console.log(`Song loaded: ${filePath}`);
    }

    playSnippet() {
        if (!this.currentSongPath) {
            console.warn('No song loaded to play snippet.');
            return;
        }

        // Clear any existing timeout for snippet playback
        if (this.snippetTimeout) {
            clearTimeout(this.snippetTimeout);
        }

        this.audioElement.currentTime = 0; // Start from the beginning of the song
        const playPromise = this.audioElement.play();

        if (playPromise !== undefined) {
            playPromise.then(_ => {
                console.log(`Playing snippet of ${this.currentSongPath} for ${this.snippetDuration} seconds.`);
                // Stop the song after snippetDuration
                this.snippetTimeout = setTimeout(() => {
                    this.pause();
                    console.log('Snippet finished.');
                }, this.snippetDuration * 1000);
            }).catch(error => {
                console.error('Error playing audio snippet:', error);
                // Attempt to play on next user interaction if it's an autoplay issue
                document.body.addEventListener('click', () => this.audioElement.play(), { once: true });
            });
        }
    }

    pause() {
        this.audioElement.pause();
        if (this.snippetTimeout) {
            clearTimeout(this.snippetTimeout); // Clear timeout if manually paused
        }
        console.log('Audio paused.');
    }

    stop() {
        this.audioElement.pause();
        this.audioElement.currentTime = 0; // Reset to the beginning
        if (this.snippetTimeout) {
            clearTimeout(this.snippetTimeout);
        }
        console.log('Audio stopped.');
    }

    isPlaying() {
        return !this.audioElement.paused;
    }
}

export default AudioPlayer;
