import { useState, useEffect } from 'react'; // <--- THIS WAS MISSING
import tournamentServices from '../services/tournamentServices';

const useTournament = (slug, doGetResults = false) => {
    const [tournamentData, setTournamentData] = useState(null);
    const [results, setResults] = useState(null); // Real match results (Group/Bracket scores)
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch Tournament Metadata
    useEffect(() => {
        const loadTournament = async () => {
            if (!slug) return;
            setIsLoading(true);
            try {
                const result = await tournamentServices.getTournamentBySlug(slug);
                setTournamentData(result.data);
            } catch (err) {
                setError(err);
                console.error("Error loading tournament data:", err);
            } finally {
                setIsLoading(false);
            }
        };

        loadTournament();
    }, [slug]);

    // Tournament Results Placeholder - Dormant unless doGetResults is true
    useEffect(() => {
        const loadResults = async () => {
            // Strictly guard against undefined IDs and the manual toggle
            if (!tournamentData?.id || !doGetResults) return;

            try {
                const res = await tournamentServices.getTournamentResults(tournamentData.id);
                if (res && res.success) {
                    setResults(res.data);
                }
            } catch (err) {
                console.warn("Tournament results fetch failed or endpoint missing:", err.message);
            }
        };

        loadResults();
    }, [tournamentData?.id, doGetResults]);

    return {
        tournamentData,
        results,
        isLoading,
        error
    };
};

export { useTournament };