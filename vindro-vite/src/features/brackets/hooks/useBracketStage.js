import { useState } from 'react';
import playService from '../services/playService';

export const useBracketStage = (initialData, playId) => {
    const [bracket, setBracket] = useState(initialData || {});

    const updateMatchWinner = async (matchId, winnerId) => {
        const updatedBracket = { ...bracket, [matchId]: winnerId };
        setBracket(updatedBracket);

        try {
            await playService.updateBracketPredictions(playId, updatedBracket);
        } catch (err) {
            console.error("Bracket sync failed");
        }
    };

    return { bracket, updateMatchWinner };
};