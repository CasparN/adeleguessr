export default class StorageManager {
    constructor() {
        this.STORAGE_KEY = 'adeleGameUserPerformance';
        this.isStorageAvailable = this.checkStorageAvailability();
    }

    checkStorageAvailability() {
        try {
            const testKey = '__test__';
            localStorage.setItem(testKey, testKey);
            localStorage.removeItem(testKey);
            return true;
        } catch (e) {
            console.warn('localStorage is not available. Performance data will not be saved.');
            return false;
        }
    }

    getPerformanceData() {
        if (!this.isStorageAvailable) return {};
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : {};
        } catch (error) {
            console.error("Error reading performance data from localStorage:", error);
            return {};
        }
    }

    savePerformanceData(data) {
        if (!this.isStorageAvailable) return;
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
        } catch (error) {
            console.error("Error saving performance data to localStorage:", error);
        }
    }

    updateSongStats(songId, outcome, timeToGuess = null) {
        if (!songId) {
            console.error("Cannot update song stats: songId is undefined");
            return;
        }

        // Even if storage isn't available, we'll still update the in-memory data
        // for the current session
        const allData = this.getPerformanceData();
        
        if (!allData[songId]) {
            allData[songId] = {
                playCount: 0,
                correctCount: 0,
                skipCount: 0,
                endedCount: 0,
                totalCorrectTime: 0,
                lastAttemptCorrect: null,
                lastPlayedTimestamp: Date.now()
            };
        }

        const stats = allData[songId];
        stats.playCount = (stats.playCount || 0) + 1;
        stats.lastPlayedTimestamp = Date.now();

        switch (outcome) {
            case 'correct':
                stats.correctCount = (stats.correctCount || 0) + 1;
                if (timeToGuess !== null) {
                    stats.totalCorrectTime = (stats.totalCorrectTime || 0) + timeToGuess;
                }
                stats.lastAttemptCorrect = true;
                break;
            case 'skipped':
                stats.skipCount = (stats.skipCount || 0) + 1;
                stats.lastAttemptCorrect = false;
                break;
            case 'ended':
                stats.endedCount = (stats.endedCount || 0) + 1;
                stats.lastAttemptCorrect = false;
                break;
            default:
                console.warn(`Unknown outcome: ${outcome} for song ${songId}`);
        }
        
        this.savePerformanceData(allData);
    }

    getSongStats(songId) {
        const allData = this.getPerformanceData();
        return allData[songId] || null;
    }

    cleanupMissingItems(existingSongIds) {
        if (!this.isStorageAvailable) return;
        const allData = this.getPerformanceData();
        const updatedData = {};
        
        // Only keep data for songs that still exist
        for (const songId of existingSongIds) {
            if (allData[songId]) {
                updatedData[songId] = allData[songId];
            }
        }
        
        this.savePerformanceData(updatedData);
    }
}
