import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import playService from '../services/playService';

/**
 * Hook to handle all Play-related actions (Create, Update, etc.)
 */
export const usePlayActions = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    /**
     * Handles the creation of a new play and redirects to the play page
     * @param {string} tournamentSlug - e.g., "world-cup-2026"
     * @param {string} playName - User-defined name for the bracket
     * @param {object} user - Current auth user object
     */
    const handleCreatePlay = async (tournamentSlug, playName, user) => {
        // 1. Safety Checks
        if (!user?.id) {
            setError("You must be logged in to save your play.");
            return;
        }

        if (!tournamentSlug) {
            setError("Tournament identifier is missing.");
            console.error("Hook Error: tournamentSlug is undefined");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            // 2. The API POST call to Django
            const newPlay = await playService.createPlay(tournamentSlug, playName);

            // 3. Slugify the play name for a clean URL
            // "My Picks 2026" -> "my-picks-2026"
            const slugPlayName = encodeURIComponent(
                playName.trim().replace(/\s+/g, '-').toLowerCase()
            );

            // 4. Redirect to the newly created play
            // Path structure: /brackets/:tournament/:userId/:playName
            navigate(`/brackets/${tournamentSlug}/${user.id}/${slugPlayName}`, {
                state: { playId: newPlay.id } // Pass the UUID in location state
            });

        } catch (err) {
            // Log the actual error for debugging
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