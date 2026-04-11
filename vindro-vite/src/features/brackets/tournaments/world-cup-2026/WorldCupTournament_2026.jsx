// /features/brackets/world-cup-2026/WorldCupTournament_2026.jsx
/**
 * WorldCupTournament_2026
 * 
 * Tournament overview page for World Cup 2026.
 * Shows user's plays and pools, allows creating new plays and joining pools.
 * 
 * The actual tournament play experience has moved to:
 * - Route: /brackets/:tournamentId/:userId/:playId
 * - Component: TournamentPlayPage
 * 
 * This component now focuses on discovery and pool management.
 * 
 * TODO: Add authentication guard if not already in route protection:
 *   if (!user || !isAuthenticated) return <Navigate to="/login" />;
 * 
 * TODO: Wire up actual plays list from API
 * TODO: Wire up actual pools list from API
 */

import React, { useState } from 'react';
import { FaEdit } from 'react-icons/fa';
import EventDescription from './components/EventDescription';
import ShowcaseSection from '../../../../components/ui/ShowcaseSection';
import AuthModal from '../../../../components/ui/AuthModal';
import { useAuth } from '../../../../contexts/AuthContext';

const WorldCupTournament_2026 = () => {
    const { user } = useAuth();
    const [showPoolModal, setShowPoolModal] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authModalMode, setAuthModalMode] = useState('login');

    // CORE HANDLERS - New Play & Join Pool
    const handleNewPlay = () => {
        if (!user) return;
        // TODO: POST /api/plays/
        // Create new play, then navigate to TournamentPlayPage with new playId
        console.log('Create new play');
    };

    const handleJoinPool = () => {
        if (!user) return;
        setShowPoolModal(true);
    };

    // Auth Modal Handlers
    const handleLoginClick = () => {
        setAuthModalMode('login');
        setIsAuthModalOpen(true);
    };

    const handleSignUpClick = () => {
        setAuthModalMode('signup');
        setIsAuthModalOpen(true);
    };

    const handleAuthModalClose = () => {
        setIsAuthModalOpen(false);
    };

    const handlePoolModalClose = () => {
        setShowPoolModal(false);
    };

    // Smooth scroll to tournament info
    const handleScrollToAbout = () => {
        const element = document.getElementById('about-tournament');
        if (element) {
            const offsetTop = element.getBoundingClientRect().top + window.scrollY;
            window.scrollTo({
                top: offsetTop - 50,
                behavior: 'smooth'
            });
        }
    };

    // Render tournament overview page
    return (
        <main id="world-cup-2026" className="bracket-tournament-page">
            {/* HERO SECTION */}
            <ShowcaseSection
                classes="hero-half bg-black"
                showButton={true}
                buttonText="About the Tournament"
                buttonClasses={'btn btn-tan'}
                buttonOnClick={handleScrollToAbout}
            >
                <h1>world<span className="inline-bold inline-teal">Cup</span>2026</h1>
                <h2>Make your picks. Submit to a pool. See how you do!</h2>
            </ShowcaseSection>

            <section className="user-picks">
                <div className="user-picks-container">
                    {/* PLAYS SECTION */}
                    <div className="title-container predictions">
                        <h3>Your Plays</h3>
                    </div>
                    <div className="user-stats-container">
                        <div className="table-container">
                            <table id="predictions-table">
                                <thead>
                                    <tr>
                                        <th>Play Name</th>
                                        <th>Status</th>
                                        <th>Groups Pts.</th>
                                        <th>Bracket Pts.</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* TODO: Map over user's plays array from API */}
                                    <tr>
                                        <td>-</td>
                                        <td>-</td>
                                        <td>-</td>
                                        <td>-</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <button
                            id="new-play-btn"
                            className="btn btn-tan"
                            onClick={handleNewPlay}
                            disabled={!user}
                            title={!user ? "Log in to create a play" : ""}
                        >
                            New Play
                        </button>
                    </div>

                    {/* POOLS SECTION */}
                    <div className="title-container pools">
                        <h3>Your Pools</h3>
                    </div>
                    <div id="pools-stats" className="user-stats-container">
                        <div className="table-container">
                            <table id="pools-table">
                                <thead>
                                    <tr>
                                        <th>Pool</th>
                                        <th>Play</th>
                                        <th>Manager</th>
                                        <th>Position</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* TODO: Map over user's pools array from API */}
                                    <tr>
                                        <td>-</td>
                                        <td>-</td>
                                        <td>-</td>
                                        <td>-</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <button
                            id="join-pool-btn"
                            className="btn btn-tan"
                            onClick={handleJoinPool}
                            disabled={!user}
                            title={!user ? "Log in to join a pool" : ""}
                        >
                            Join a Pool
                        </button>
                    </div>
                </div>

                {/* AUTH PROMPT - Show when not logged in */}
                {!user && (
                    <div className="auth-prompt-overlay">
                        <div className="auth-prompt-message">
                            <h5>To participate you must be logged in.</h5>
                            <div className="prompt-links">
                                <button className="btn btn-tan" onClick={handleLoginClick}>
                                    Log In
                                </button>
                                <p>or</p>
                                <button className="btn btn-tan" onClick={handleSignUpClick}>
                                    Sign Up
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </section>

            {/* TOURNAMENT INFO */}
            <EventDescription />

            {/* MODALS */}

            {/* Pool Join Modal */}
            {showPoolModal && (
                <JoinPoolModal
                    userId={user?.id}
                    onClose={handlePoolModalClose}
                />
            )}

            {/* Auth Modal with redirect support */}
            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={handleAuthModalClose}
                redirectTo={window.location.pathname}
                defaultMode={authModalMode}
            />
        </main>
    );
};

export default WorldCupTournament_2026;