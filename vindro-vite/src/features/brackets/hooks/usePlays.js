import { useState, useEffect, useCallback } from 'react';
import playServices from '../services/playServices';
import { useLoading } from '../../../contexts/LoadingContext';

const usePlays = (tournamentId, user, tournamentSlug) => {

    const { showLoader, hideLoader } = useLoading();

    // --- State ---
    const [userPlays, setUserPlays] = useState([]);
    const [userPools, setUserPools] = useState([]); // Future pool logic
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // Fetch existing plays
    const fetchUserPlays = useCallback(async () => {

        if (!tournamentId || !user?.id) {

            setUserPlays([]);
            return;
        }
        setIsLoading(true);
        try {
            const data = await playServices.getUserPlays(tournamentId);
            setUserPlays(data?.data || []);
        } catch (err) {
            console.error("Fetch Plays Error:", err);
            setError("Failed to load your plays.");
        } finally {
            setIsLoading(false);
        }
    }, [tournamentId, user?.id]);


    const handleCreatePlay = async (playName) => {
        const trimmedName = playName?.trim();

        // 1. FRONTEND VALIDATIONS
        if (!user?.id) {
            setError("You must be logged in to save your play.");
            return null;
        }
        if (!trimmedName) {
            setError("Please provide a name for your play.");
            return null;
        }
        if (trimmedName.length > 28) {
            setError("Play name cannot exceed 28 characters.");
            return null;
        }

        setIsSubmitting(true);
        setError(null);
        showLoader();

        try {
            const response = await playServices.createPlay(tournamentId, trimmedName);

            if (response.success) {
                return response.data;
            } else {
                setError(response.error || "Failed to create play.");
                return null;
            }
        } catch (err) {
            console.error("Create Play Error:", err);
            setError(err.message || "Failed to create play.");
            return null;
        } finally {
            setIsSubmitting(false);
            hideLoader();
        }
    };

    // --- Lifecycle ---
    useEffect(() => {

        fetchUserPlays();

    }, [fetchUserPlays]);


    return {
        userPlays,
        userPools,
        isLoading,
        isSubmitting,
        error,
        handleCreatePlay,
        refreshPlays: fetchUserPlays
    };
};

export { usePlays };