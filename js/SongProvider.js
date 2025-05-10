class SongProvider {
    constructor(songsUrl = '../songs.json') {
        this.songsUrl = songsUrl;
        this.songList = [];
        this.playedSongs = new Set(); // To keep track of recently played songs
    }

    async loadSongs() {
        try {
            const response = await fetch(this.songsUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.songList = await response.json();
            console.log('Songs loaded successfully:', this.songList);
            if (!Array.isArray(this.songList) || this.songList.length === 0) {
                console.error('Song list is empty or not an array. Check songs.json');
                this.songList = []; // Ensure songList is an array
            }
        } catch (error) {
            console.error('Failed to load songs:', error);
            this.songList = []; // Ensure songList is an array even on error
        }
    }

    getRandomSong() {
        if (this.songList.length === 0) {
            console.warn('No songs available to choose from.');
            return null;
        }

        let availableSongs = this.songList.filter(song => !this.playedSongs.has(song.id));

        // If all songs have been played, reset the playedSongs set
        if (availableSongs.length === 0) {
            this.playedSongs.clear();
            availableSongs = this.songList;
            console.log('All songs played, resetting played list.');
        }

        if (availableSongs.length === 0) { // Should not happen if songList is not empty
             console.warn('No available songs after attempting to reset.');
             return null;
        }

        const randomIndex = Math.floor(Math.random() * availableSongs.length);
        const randomSong = availableSongs[randomIndex];
        this.playedSongs.add(randomSong.id);

        return randomSong;
    }

    getSongCount() {
        return this.songList.length;
    }
}

export default SongProvider;
