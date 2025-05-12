class SongProvider {
    constructor(songsUrl = '../songs.json') {
        this.songsUrl = songsUrl;
        this.allSongs = []; // Stores all songs from songs.json
        this.currentSongList = []; // Songs available for the current game/mode
        this.playedInCurrentSelection = new Set(); // Tracks played songs within the currentSongList
    }

    async loadSongs() {
        try {
            const response = await fetch(this.songsUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.allSongs = await response.json();
            console.log('Songs loaded successfully:', this.allSongs);
            if (!Array.isArray(this.allSongs) || this.allSongs.length === 0) {
                console.error('Song list is empty or not an array. Check songs.json');
                this.allSongs = [];
            }
        } catch (error) {
            console.error('Failed to load songs:', error);
            this.allSongs = [];
        }
        // Initially, current song list is all songs
        this.currentSongList = [...this.allSongs];
        this.resetPlayedSongsInCurrentSelection();
    }

    resetFilters() {
        if (this.allSongs.length > 0) {
            this.currentSongList = [...this.allSongs];
        } else {
            // This case should ideally not happen if loadSongs was successful
            this.currentSongList = [];
        }
        // console.log("SongProvider filters reset. Current song count:", this.currentSongList.length);
    }

    getAvailableAlbums() {
        if (!this.allSongs || this.allSongs.length === 0) return [];
        const albumNames = this.allSongs.map(song => song.album).filter(album => album);
        return [...new Set(albumNames)]; // Return unique album names
    }

    applyAlbumFilter(selectedAlbums) {
        this.resetPlayedSongsInCurrentSelection();
        if (selectedAlbums && selectedAlbums.length > 0) {
            this.currentSongList = this.allSongs.filter(song => selectedAlbums.includes(song.album));
        } else {
            // No albums selected or empty array means use all songs
            this.currentSongList = [...this.allSongs];
        }
        if (this.currentSongList.length === 0) {
            console.warn('No songs match the selected album filter. Defaulting to all songs.');
            this.currentSongList = [...this.allSongs];
        }
    }

    applyAdaptiveFilter(allSongsPerformance, adaptiveType) {
        this.resetPlayedSongsInCurrentSelection();
        if (!allSongsPerformance || Object.keys(allSongsPerformance).length === 0) {
            console.warn('No performance data available for adaptive filter. Defaulting to all songs.');
            this.currentSongList = [...this.allSongs];
            return;
        }

        let filtered = [];
        const songsWithStats = this.allSongs.map(song => ({
            ...song,
            stats: allSongsPerformance[song.id] || { playCount: 0, correctCount: 0, lastAttemptCorrect: null, totalCorrectTime: 0 }
        }));

        switch (adaptiveType) {
            case 'weakest':
                filtered = songsWithStats.filter(song => song.stats.playCount > 0 && 
                                                      (song.stats.correctCount / song.stats.playCount < 0.6 || song.stats.lastAttemptCorrect === false));
                filtered.sort((a, b) => {
                    const ratioA = a.stats.playCount > 0 ? a.stats.correctCount / a.stats.playCount : 1;
                    const ratioB = b.stats.playCount > 0 ? b.stats.correctCount / b.stats.playCount : 1;
                    if (ratioA !== ratioB) return ratioA - ratioB; // Sort by lowest correct ratio
                    if (a.stats.lastAttemptCorrect === false && b.stats.lastAttemptCorrect !== false) return -1;
                    if (b.stats.lastAttemptCorrect === false && a.stats.lastAttemptCorrect !== false) return 1;
                    return 0;
                });
                break;
            case 'easiest':
                filtered = songsWithStats.filter(song => song.stats.playCount > 0 && (song.stats.correctCount / song.stats.playCount >= 0.8));
                filtered.sort((a, b) => {
                    const ratioA = a.stats.playCount > 0 ? a.stats.correctCount / a.stats.playCount : 0;
                    const ratioB = b.stats.playCount > 0 ? b.stats.correctCount / b.stats.playCount : 0;
                    return ratioB - ratioA; // Sort by highest correct ratio
                });
                break;
            case 'recently-incorrect':
                filtered = songsWithStats.filter(song => song.stats.lastAttemptCorrect === false);
                // Add sorting by lastPlayedTimestamp if available and desired
                break;
            default:
                filtered = [...this.allSongs];
        }

        if (filtered.length === 0) {
            console.warn(`Adaptive filter '${adaptiveType}' yielded no songs. Defaulting to a random selection or all songs.`);
            // Fallback: could be all songs, or a random subset of all songs not recently played if too many
            this.currentSongList = [...this.allSongs]; 
        } else {
            this.currentSongList = filtered.map(({ stats, ...song }) => song); // Remove stats before setting currentSongList
        }
    }

    resetPlayedSongsInCurrentSelection() {
        this.playedInCurrentSelection.clear();
    }

    getAllSongIds() {
        return this.allSongs.map(song => song.id);
    }

    getRandomSong() {
        if (this.currentSongList.length === 0) {
            console.warn('Current song list is empty. Attempting to use all songs.');
            // Fallback if currentSongList is empty for some reason (e.g. filter yielded nothing and fallback wasn't robust)
            this.currentSongList = [...this.allSongs]; 
            this.resetPlayedSongsInCurrentSelection();
            if (this.currentSongList.length === 0) {
                 console.error('No songs available at all.');
                 return null;
            }
        }

        let availableSongs = this.currentSongList.filter(song => !this.playedInCurrentSelection.has(song.id));

        if (availableSongs.length === 0 && this.currentSongList.length > 0) {
            this.resetPlayedSongsInCurrentSelection();
            availableSongs = this.currentSongList;
            console.log('All songs in current selection played, resetting played list for this selection.');
        }

        if (availableSongs.length === 0) {
             console.warn('No available songs in current selection, even after reset attempt.');
             return null;
        }

        const randomIndex = Math.floor(Math.random() * availableSongs.length);
        const randomSong = availableSongs[randomIndex];
        this.playedInCurrentSelection.add(randomSong.id);

        return randomSong;
    }

    getSongCount() {
        return this.currentSongList.length; // Reflects the count in the currently active list
    }
}

export default SongProvider;
