import { useState, useEffect } from 'react';
import leaderboardServices from '../services/leaderboardService';

const useLeaderboards = (publicPoolId) => {

    const [publicLeaderboard, setPublicLeaderboard] = useState([]);
    const [privateLeaderboard, setPrivateLeaderboard] = useState([]);

    const [isPublicLoading, setIsPublicLoading] = useState(false);
    const [isPrivateLoading, setIsPrivateLoading] = useState(false);

    const [error, setError] = useState(null);

    const fetchPublicLeaderboard = async () => {
        if (!publicPoolId) return;
        setIsPublicLoading(true);
        setError(null);
        try {
            const result = await leaderboardServices.getPoolLeaderboard(publicPoolId);
            setPublicLeaderboard(result.data?.leaderboard || []);
        } catch (err) {
            console.error("Error fetching public leaderboard:", err);
            setError(err);
        } finally {
            setIsPublicLoading(false);
        }
    };

    const fetchPrivateLeaderboard = async (poolId) => {
        if (!poolId) return;
        setIsPrivateLoading(true);
        setError(null);
        try {
            const result = await leaderboardServices.getPoolLeaderboard(poolId);
            setPrivateLeaderboard(result.data?.leaderboard || []);
            return result.data?.leaderboard;
        } catch (err) {
            console.error("Error fetching private leaderboard:", err);
            setError(err);
        } finally {
            setIsPrivateLoading(false);
        }
    };

    useEffect(() => {
        fetchPublicLeaderboard();
    }, [publicPoolId]);

    return {
        publicLeaderboard,
        privateLeaderboard,
        isPublicLoading,
        isPrivateLoading,
        error,
        fetchPrivateLeaderboard,
        refreshPublic: fetchPublicLeaderboard,
    };
};

export { useLeaderboards };
