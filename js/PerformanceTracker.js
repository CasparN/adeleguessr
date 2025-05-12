export default class PerformanceTracker {
    constructor(storageManager) {
        this.storageManager = storageManager;
    }

    // Internal helper to get song title
    _getSongTitleById(songId, allSongs) {
        // Ensure allSongs is an array before trying to use .find
        if (!Array.isArray(allSongs)) {
            return 'Unknown Song (Data Error)';
        }
        // Add String() conversion for robustness, in case of type mismatches between IDs.
        const song = allSongs.find(s => String(s.id) === String(songId));
        return song ? song.title : 'Unknown Song';
    }

    calculatePerformanceMetrics(allSongs) {
        const performanceData = this.storageManager.getPerformanceData();
        
        if (!Array.isArray(allSongs)) {
            console.error("PerformanceTracker: calculatePerformanceMetrics called with invalid allSongs.", allSongs);
            return {
                bestSongs: [],
                worstSongs: [],
                overallAccuracy: 0,
                totalPlays: 0,
                error: "Song data unavailable for metrics"
            };
        }

        if (Object.keys(performanceData).length === 0) {
            return {
                bestSongs: [],
                worstSongs: [],
                overallAccuracy: 0,
                totalPlays: 0
            };
        }

        const songStats = [];
        let totalPlays = 0;
        let totalCorrect = 0;

        for (const songId in performanceData) {
            const stats = performanceData[songId];
            totalPlays += stats.playCount || 0;
            totalCorrect += stats.correctCount || 0;

            let accuracy = 0;
            if (stats.playCount > 0) {
                const relevantPlays = stats.playCount - (stats.skipCount || 0) - (stats.endedCount || 0);
                if (relevantPlays > 0) {
                    accuracy = (stats.correctCount || 0) / relevantPlays;
                }
            }
            
            let score = accuracy * 100; 
            if (stats.playCount < 3) { 
                score *= (stats.playCount / 3); 
            }

            let avgCorrectTime = Infinity;
            if (stats.correctCount > 0 && stats.totalCorrectTime > 0) {
                avgCorrectTime = stats.totalCorrectTime / stats.correctCount;
            }

            songStats.push({
                songId: songId,
                title: this._getSongTitleById(songId, allSongs),
                accuracy: accuracy,
                playCount: stats.playCount || 0,
                correctCount: stats.correctCount || 0,
                skipCount: stats.skipCount || 0,
                endedCount: stats.endedCount || 0,
                avgCorrectTime: avgCorrectTime,
                lastPlayedTimestamp: stats.lastPlayedTimestamp,
                score: score 
            });
        }

        const sortedBest = [...songStats].sort((a, b) => {
            if (b.score === a.score) {
                return (b.lastPlayedTimestamp || 0) - (a.lastPlayedTimestamp || 0);
            }
            return b.score - a.score;
        });

        const sortedWorst = [...songStats]
            .filter(s => s.playCount > 0) 
            .sort((a, b) => {
                if (a.score === b.score) {
                    return (b.lastPlayedTimestamp || 0) - (a.lastPlayedTimestamp || 0);
                }
                return a.score - b.score;
            });

        const overallAccuracy = totalPlays > 0 ? (totalCorrect / totalPlays) * 100 : 0;

        return {
            bestSongs: sortedBest.slice(0, 5),
            worstSongs: sortedWorst.slice(0, 5),
            overallAccuracy: overallAccuracy.toFixed(1),
            totalPlays: totalPlays
        };
    }
}
