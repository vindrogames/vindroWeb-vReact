/**
 * WorldCup2026PlayPage.jsx
 * 
 * Tournament-specific play/prediction page for World Cup 2026
 * Route: /brackets/world-cup-2026/:userId/:playId
 * 
 * This component handles the full play experience for World Cup 2026
 * including groups stage and bracket predictions.
 * 
 * TODO: API Integration
 * Replace mockPlay with actual data fetch:
 * const { playId, userId } = useParams();
 * const { data: play, isLoading } = useFetch(`/api/plays/${playId}/`);
 */

import React from 'react';
import GroupStagePredictions from '../../components/GroupStagePredictions';
import BracketStagePredictions from '../../components/BracketStagePredictions';
import { useParams } from 'react-router-dom';
// TODO: Import tournament-specific components and generic play components
// import GenericTournamentPlayPage from './components/TournamentPlayPage';
import { mockPlay } from './data/mockPlay';

const WorldCup2026PlayPage = () => {
    const { playId, userId } = useParams();

    // TODO: Replace with actual API call
    // const { data: play, isLoading } = useFetch(`/api/plays/${playId}/`);
    const play = mockPlay;
    const isLoading = false;

    return (
        <div className="world-cup-2026-play-page">
            {isLoading ? (
                <div className="loading">Loading...</div>
            ) : (
                <div className="play-content">
                    {/* Play page content will go here */}
                    <h1>{play.name}</h1>
                    <p>Tournament Play Page for World Cup 2026</p>
                    {/* TODO: Render stage cards, modals, and predictions UI */}
                </div>
            )}
        </div>
    );
};

export default WorldCup2026PlayPage;
