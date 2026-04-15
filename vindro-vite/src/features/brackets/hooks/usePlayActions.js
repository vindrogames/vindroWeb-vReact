// src/features/brackets/hooks/usePlayActions.js

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import playService from '../services/playService';

export const usePlayActions = () => {
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleCreatePlay = async (tournamentSlug, tournamentId, playName, user) => {
        if (!user?.id) {
            setError("You must be logged in to save your play.");
            return;
        }

        if (!playName || playName.trim() === "") {
            setError("Please provide a name for your play.");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            // 1. API Call
            const newPlay = await playService.createPlay(tournamentId, playName);

            // 2. Slugify name
            const slugPlayName = encodeURIComponent(
                playName.trim().replace(/\s+/g, '-').toLowerCase()
            );

            // 3. Navigation (FIXED SYNTAX HERE)
            navigate(`/brackets/${tournamentSlug}/${user.id}/${slugPlayName}`, {
                state: { playId: newPlay.id }
            });

        } catch (err) {
            console.error("Create Play Error:", err);
            setError(err.message || "Failed to create play.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return { 
        handleCreatePlay, 
        isSubmitting, 
        error 
    };
};