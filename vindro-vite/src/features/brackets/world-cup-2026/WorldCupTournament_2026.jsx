// /features/brackets/world-cup-2026/WorldCupTournament_2026.jsx
/**
 * WorldCupTournament_2026
 * 
 * Main component for the World Cup 2026 bracket feature.
 * Orchestrates the user flow: intro → name play → group predictions → bracket predictions → review → submit
 * 
 * NOTE: This route is currently UNPROTECTED for frontend styling work.
 * TODO: Add authentication guard once auth context is properly set up:
 *   if (!user || !isAuthenticated) return <Navigate to="/login" />;
 */

import React, { useState, useRef } from 'react';
import EventDescription from './components/EventDescription';
import PlayNameModal from './components/PlayNameModal';
import JoinPoolModal from './components/JoinPoolModal';
import TournamentGroupsModal from '../components/TournamentGroupsModal';
import { usePlaySession } from '../hooks/usePlaySession';
import { useGroupPredictions } from '../hooks/useGroupPredictions';
import { WORLD_CUP_2026_GROUPS, GROUP_KEYS } from '../data/worldCup2026Groups';
import ShowcaseSection from '../../../components/ui/ShowcaseSection';
import AuthModal from '../../../components/ui/AuthModal';
import { useAuth } from '../../../contexts/AuthContext';

const WorldCupTournament_2026 = () => {

    const { user } = useAuth();
    const [showPoolModal, setShowPoolModal] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authModalMode, setAuthModalMode] = useState('login'); // 'login' or 'signup'

    const { currentPhase, playName, startNewPlay, setPlayNameAndProceed, proceedToBracket, resetToIntro } =
        usePlaySession();

    const {
        predictions,
        lockedGroups,
        updateGroupPrediction,
        lockGroup,
        unlockGroup,
        isGroupLocked,
        allGroupsCompleted,
    } = useGroupPredictions();

    // Handlers
    const handleStartClick = () => {
        if (!user) return;
        startNewPlay();
    };

    const handlePoolJoinClick = () => {
        if (!user) return;
        setShowPoolModal(true);
    };

    const handlePoolModalClose = () => {
        setShowPoolModal(false);
    };

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

    const handlePlayNameConfirm = (name) => {
        setPlayNameAndProceed(name);
    };

    const handlePlayNameCancel = () => {
        // User cancelled, go back to intro
        resetToIntro();
    };

    const handleGroupsComplete = () => {
        proceedToBracket();
    };

    const handleCloseGroupsModal = () => {
        // Go back to intro for now
        // In future, could allow finishing groups later
    };

    const handleScrollToAbout = () => {
    const element = document.getElementById('about-tournament');
    if (element) {
        const offsetTop = element.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({
            top: offsetTop - 50, // 50px padding from top
            behavior: 'smooth'
        });
    }
};

    // Render different phases
    return (
        <main id="world-cup-2026" className="brackets-page">
            {/* Phase: Intro */}
            {/*currentPhase === 'intro' && <WorldCupIntro onStartClick={handleStartClick} />*/}
            <ShowcaseSection
                classes="hero-half bg-black"
                showButton={true}
                buttonText="About the Tournament"
                buttonClasses={'btn btn-tan'}
                buttonOnClick={() => {
                    const element = document.getElementById('about-tournament');
                    if (element) {
                        const offsetTop = element.getBoundingClientRect().top + window.scrollY;
                        window.scrollTo({
                            top: offsetTop - 90,
                            behavior: 'smooth'
                        });
                    }
                }}
            >
                <h1>world<span className="inline-bold inline-teal">Cup</span>2026</h1>
                <h2>Make your picks. Submit to a pool. See how you do!</h2>
            </ShowcaseSection>

            <section className="user-picks">

                <div className="user-picks-container">
                    <div className="title-container predictions">
                        <h3>Your Predictions</h3>
                    </div>
                    <div className="user-stats-container">
                        <div className="table-container">
                            <table id="predictions-table">
                                <thead>
                                    <tr>
                                        <th>Picks Play</th>
                                        <th>Status</th>
                                        <th>Groups Pts.</th>
                                        <th>Bracket Pts.</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>My World Cup 2026 Play</td>
                                        <td>Groups</td>
                                        <td>In Progress</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <button
                            id="make-play-btn"
                            className="btn btn-tan"
                            onClick={handleStartClick}
                            disabled={!user}
                            title={!user ? "Log in to create a play" : ""}
                        >
                            Make your Picks
                        </button>

                    </div>
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
                                        <th>Postion</th>
                                    </tr>
                                </thead>
                                <tbody>
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
                            onClick={handlePoolJoinClick}
                            disabled={!user}
                            title={!user ? "Log in to join a pool" : ""}
                        >
                            Join a Pool
                        </button>
                    </div>
                </div>

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

            <EventDescription />

            {/* Pool Join Modal */}
            {showPoolModal && (
                <JoinPoolModal
                    userId={user?.id}
                    onClose={handlePoolModalClose}
                />
            )}

            {/* Auth Modal with redirect to current page */}
            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={handleAuthModalClose}
                redirectTo={window.location.pathname}
                defaultMode={authModalMode}
            />

            {/* Phase: Name Play Modal */}
            {currentPhase === 'name' && (
                <div className="modal-backdrop">
                    <WorldCupIntro onStartClick={() => { }} />
                    <PlayNameModal
                        isOpen={currentPhase === 'name'}
                        onConfirm={handlePlayNameConfirm}
                        onCancel={handlePlayNameCancel}
                    />
                </div>
            )}

            {/* Phase: Groups Predictions */}
            {(currentPhase === 'groups' || currentPhase === 'bracket' || currentPhase === 'review') && (
                <div className="tournament-flow-container">
                    <header className="tournament-header">
                        <h1>World Cup 2026</h1>
                        <div className="play-info">
                            <span className="play-name">{playName}</span>
                            <span className="phase-indicator">{currentPhase.toUpperCase()}</span>
                        </div>
                    </header>

                    {currentPhase === 'groups' && (
                        <TournamentGroupsModal
                            groups={WORLD_CUP_2026_GROUPS}
                            groupKeys={GROUP_KEYS}
                            predictions={predictions}
                            onUpdatePrediction={updateGroupPrediction}
                            onLockGroup={lockGroup}
                            onUnlockGroup={unlockGroup}
                            isGroupLocked={isGroupLocked}
                            onClose={handleCloseGroupsModal}
                            onGroupsComplete={handleGroupsComplete}
                        />
                    )}

                    {currentPhase === 'bracket' && (
                        <section className="bracket-section">
                            <h2>Bracket Stage Predictions</h2>
                            <p className="placeholder-text">Bracket predictions component coming soon...</p>
                        </section>
                    )}

                    {currentPhase === 'review' && (
                        <section className="review-section">
                            <h2>Review Your Predictions</h2>
                            <p className="placeholder-text">Review component coming soon...</p>
                        </section>
                    )}
                </div>
            )}

            {/* Phase: Submitted */}
            {currentPhase === 'submitted' && (
                <section className="submitted-section">
                    <h2>Your play '{playName}' has been submitted!</h2>
                    <p className="placeholder-text">Success screen coming soon...</p>
                </section>
            )}
        </main>
    );
};

export default WorldCupTournament_2026;