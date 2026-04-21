import { useState, useEffect } from 'react';
import leaderboardServices from '../services/leaderboardService';

const useLeaderboards = (tournamentId) => {
    
    const [publicLeaderboard, setPublicLeaderboard] = useState([]);
    const [privateLeaderboard, setPrivateLeaderboard] = useState([]);
    
    // Split loading states for finer UI control
    const [isPublicLoading, setIsPublicLoading] = useState(false);
    const [isPrivateLoading, setIsPrivateLoading] = useState(false);
    
    const [error, setError] = useState(null);

    // 1. Logic for fetching the public standings
    const fetchPublicLeaderboard = async () => {
        if (!tournamentId) return;
        setIsPublicLoading(true); // Targeted loading
        setError(null);
        try {
            const result = await leaderboardServices.getPublicLeaderboard(tournamentId);
            setPublicLeaderboard(result.data || []);
        } catch (err) {
            console.error("Error fetching public leaderboard:", err);
            setError(err);
        } finally {
            setIsPublicLoading(false);
        }
    };

    // 2. Logic for fetching a specific private pool leaderboard
    const fetchPrivateLeaderboard = async (poolId) => {
        if (!tournamentId || !poolId) return;
        setIsPrivateLoading(true); // Targeted loading
        setError(null);
        try {
            const result = await leaderboardServices.getPrivatePoolLeaderboard(tournamentId, poolId);
            setPrivateLeaderboard(result.data || []);
            return result.data;
        } catch (err) {
            console.error("Error fetching private leaderboard:", err);
            setError(err);
        } finally {
            setIsPrivateLoading(false);
        }
    };

    // Auto-fetch the public one as soon as we have a tournamentId
    useEffect(() => {
        fetchPublicLeaderboard();
    }, [tournamentId]);

    return {
        publicLeaderboard,
        privateLeaderboard,
        isPublicLoading,   // Conditional UI control
        isPrivateLoading,  // Conditional UI control
        error,
        fetchPrivateLeaderboard,
        refreshPublic: fetchPublicLeaderboard
    };
};

export { useLeaderboards };