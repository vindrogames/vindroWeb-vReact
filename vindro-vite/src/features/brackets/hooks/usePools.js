import { useState, useEffect, useCallback } from 'react';
import poolServices from '../services/poolServices';

export const usePools = (tournamentId, user) => {

    const [userPools, setUserPools] = useState([]);
    const [myCreatedPools, setMyCreatedPools] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const fetchUserPools = useCallback(async () => {
        if (!tournamentId || !user) return;
        setIsLoading(true);
        try {
            const [submissionsResult, createdResult] = await Promise.all([
                poolServices.getUserPools(tournamentId),
                poolServices.getMyCreatedPools(tournamentId),
            ]);
            if (submissionsResult.success) setUserPools(submissionsResult.data);
            if (createdResult.success) setMyCreatedPools(createdResult.data.my_pools || []);
        } catch (err) {
            setError(err.message || 'Failed to fetch pools');
        } finally {
            setIsLoading(false);
        }
    }, [tournamentId, user?.id]);

    useEffect(() => {
        fetchUserPools();
    }, [user, fetchUserPools]);

    const handleJoinPool = async (playIds, poolType, poolCode = null) => {

        if (!tournamentId) return;

        setIsSubmitting(true);

        try {
            const result = await poolServices.joinPool(tournamentId, playIds, poolType, poolCode);
            if (result.success) await fetchUserPools();
            return result;
        } catch (err) {
            setError(err.message || 'Failed to join pool');
            throw err;
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCreatePool = async (poolData) => {

        if (!tournamentId) return;

        setIsSubmitting(true);

        try {
            const result = await poolServices.createPool(tournamentId, poolData);
            if (result.success) await fetchUserPools();
            return result;
        } catch (err) {
            setError(err.message || 'Failed to create pool');
            throw err;
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        userPools,
        myCreatedPools,
        handleJoinPool,
        handleCreatePool,
        refreshPools: fetchUserPools,
        isLoading,
        isSubmitting,
        error
    };
};

export default usePools;