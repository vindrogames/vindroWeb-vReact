import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateNewPlayModal from '../../components/CreateNewPlayModal';
import JoinPoolModal from '../../components/JoinPoolModal';
import EventDescription from './components/EventDescription';
import ShowcaseSection from '../../../../components/ui/ShowcaseSection';
import AuthModal from '../../../../components/ui/AuthModal';
import { useAuth } from '../../../../contexts/AuthContext';
import { usePlayActions } from '../../hooks/usePlayActions';

const WorldCupTournament_2026 = () => {
    const { user } = useAuth();
    
    // UI State
    const [showCreatePlayModal, setShowCreatePlayModal] = useState(false);
    const [showPoolModal, setShowPoolModal] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authModalMode, setAuthModalMode] = useState('login');

    // Logic Hook - handles API, slugifying, and navigation
    const { handleCreatePlay, isSubmitting, error: apiError } = usePlayActions();
    const tournamentSlug = "world-cup-2026";

    // CORE HANDLERS
    const handleNewPlay = () => {
        if (!user) {
            handleLoginClick();
            return;
        }
        setShowCreatePlayModal(true);
    };

    const handleCreatePlayConfirm = async (playName) => {
        // The hook handles the API call and the redirect internally
        await handleCreatePlay(tournamentSlug, playName, user);
        
        // Modal closure: The hook redirects on success, but we close 
        // this to be safe if the redirect takes a moment.
        setShowCreatePlayModal(false);
    };

    const handleJoinPool = () => {
        if (!user) {
            handleLoginClick();
            return;
        }
        setShowPoolModal(true);
    };

    const handleCreatePool = () => {
        console.log("Create Pool feature coming soon");
    }

    // Auth & Scroll Handlers
    const handleLoginClick = () => { setAuthModalMode('login'); setIsAuthModalOpen(true); };
    const handleSignUpClick = () => { setAuthModalMode('signup'); setIsAuthModalOpen(true); };

    const handleScrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            const offset = element.getBoundingClientRect().top + window.scrollY - 90;
            window.scrollTo({ top: offset, behavior: 'smooth' });
        }
    };

    return (
        <main id="world-cup-2026" className="bracket-tournament-page">
            <ShowcaseSection classes="hero-half bg-black brackets-hero">
                <h1>world<span className="inline-bold inline-teal">Cup</span>2026</h1>
                <h2>Make your picks. Submit to a pool. See how you do!</h2>
                <div className="brackets-hero-buttons-wrapper">
                    <button className="btn btn-tan" onClick={() => handleScrollToSection('about-tournament')}>About</button>
                    <button className="btn btn-tan" onClick={() => handleScrollToSection('tournament-leaderboard')}>Leaderboard</button>
                </div>
            </ShowcaseSection>

            <ShowcaseSection id="user-picks-section" classes="hero-half bg-gray user-picks">
                <div className="user-picks-container">
                    <div className="title-container predictions"><h3>Your Plays</h3></div>
                    <div className="user-stats-container">
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Play Name</th>
                                        <th>Status</th>
                                        <th>Groups Pts.</th>
                                        <th>Bracket Pts.</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr><td>-</td><td>-</td><td>-</td><td>-</td></tr>
                                </tbody>
                            </table>
                        </div>
                        <button className="btn btn-tan" onClick={handleNewPlay}>New Play</button>
                    </div>

                    <div className="title-container pools"><h3>Your Pools</h3></div>
                    <div className="user-stats-container">
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr><th>Pool</th><th>Play</th><th>Manager</th><th>Position</th></tr>
                                </thead>
                                <tbody><tr><td>-</td><td>-</td><td>-</td><td>-</td></tr></tbody>
                            </table>
                        </div>
                        <div className="pools-buttons-container">
                            <button className="btn btn-tan" onClick={handleJoinPool}>Join a Pool</button>
                            <button className="btn btn-tan" onClick={handleCreatePool}>Create a Pool</button>
                        </div>
                    </div>
                </div>

                {!user && (
                    <div className="auth-prompt-overlay">
                        <div className="auth-prompt-message">
                            <h5>To participate you must be logged in.</h5>
                            <div className="prompt-links">
                                <button className="btn btn-tan" onClick={handleLoginClick}>Log In</button>
                                <p>or</p>
                                <button className="btn btn-tan" onClick={handleSignUpClick}>Sign Up</button>
                            </div>
                        </div>
                    </div>
                )}
            </ShowcaseSection>

            <EventDescription />

            <CreateNewPlayModal
                isOpen={showCreatePlayModal}
                onConfirm={handleCreatePlayConfirm}
                onCancel={() => setShowCreatePlayModal(false)}
                isLoading={isSubmitting}
                apiError={apiError}
            />

            <JoinPoolModal
                isOpen={showPoolModal}
                tournamentSlug={tournamentSlug}
                userId={user?.id}
                onSuccess={() => setShowPoolModal(false)}
                onCancel={() => setShowPoolModal(false)}
            />

            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                redirectTo={window.location.pathname}
                defaultMode={authModalMode}
            />
        </main>
    );
};

export default WorldCupTournament_2026;