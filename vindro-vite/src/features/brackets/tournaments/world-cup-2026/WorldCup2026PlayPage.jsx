import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import playService from '../../services/playService'; // Our specific play service

const WorldCup2026PlayPage = () => {
    // 1. Get readable data from the URL
    const { tournament, userId, playName } = useParams();
    
    // 2. Get the "hidden" UUID from the navigation state
    const location = useLocation();
    const playId = location.state?.playId;

    const [playData, setPlayData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const fetchPlayDetails = async () => {
            if (!playId) {
                // If they refreshed or linked directly, we might need 
                // a service to fetch by slug/name instead of UUID
                console.warn("No playId in state - need fallback fetch");
                setLoading(false);
                return;
            }

            try {
                // We'll need to add getPlayById to our playService
                const data = await playService.getPlayById(playId);
                setPlayData(data);
            } catch (err) {
                console.error("Error fetching play:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchPlayDetails();
    }, [playId]);

    if (loading) return <div>Loading your bracket...</div>;

    return (
        <main className="play-page-container">
            <section className="play-header">
                <h1>{playName.replace(/-/g, ' ')}</h1>
                <p>Tournament: {tournament}</p>
                <p>User: {userId}</p>
            </section>

            {/* This is where the GroupPhase or BracketPhase components will go */}
            <section className="play-content">
                {playData ? (
                    <div>
                        <h3>Status: {playData.status}</h3>
                        <p>Phase: {playData.current_phase}</p>
                        {/* Placeholder for predictions logic */}
                    </div>
                ) : (
                    <p>Could not load play details.</p>
                )}
            </section>
        </main>
    );
};

export default WorldCup2026PlayPage;
