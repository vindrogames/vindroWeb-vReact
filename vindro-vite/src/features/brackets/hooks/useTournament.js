// hooks/useTournament.js
import { useState, useEffect } from 'react';
import tournamentService from '../services/tournamentService';

export const useTournament = (slug) => {

    const [tournament, setTournament] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {

        console.log(slug);
        const fetchTournament = async () => {
            try {
                const data = await tournamentService.getTournamentBySlug(slug);
                setTournament(data);
            } catch (err) {
                setError(err.status === 404 ? 'Tournament not found' : 'Failed to load');
            } finally {
                setLoading(false);
            }
        };
        if (slug) fetchTournament();
    }, [slug]);

    return { tournament, loading, error };
};