import { useState } from 'react';
import poolServices from '../services/poolServices';

export const useJoinPool = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const joinPool = async (tournamentId, playIds, poolType, poolCode = null) => {
        setIsLoading(true);
        try {
            // Forward the poolType correctly
            const response = await poolServices.joinPool(tournamentId, playIds, poolType, poolCode);
            return response;
        } catch (err) {
            setError(err.message || 'Failed to join pool');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };
    return { joinPool, isLoading, error };
};

export default useJoinPool;