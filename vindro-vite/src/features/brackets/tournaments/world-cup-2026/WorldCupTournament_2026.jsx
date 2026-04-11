import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateNewPlayModal from '../../components/CreateNewPlayModal';
import JoinPoolModal from '../../components/JoinPoolModal';
import EventDescription from './components/EventDescription';
import ShowcaseSection from '../../../../components/ui/ShowcaseSection';
import AuthModal from '../../../../components/ui/AuthModal';
import { useAuth } from '../../../../contexts/AuthContext';

const WorldCupTournament_2026 = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [showCreatePlayModal, setShowCreatePlayModal] = useState(false);
    const [showPoolModal, setShowPoolModal] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authModalMode, setAuthModalMode] = useState('login');

    const tournamentId = "world-cup-2026";

    // CORE HANDLERS
    const handleNewPlay = () => {
        if (!user) {
            handleLoginClick();
            return;
        }
        setShowCreatePlayModal(true);
    };

    const handleCreatePlayConfirm = (playName) => {
        // Mocking the API response for now
        console.log('API POST -> /api/plays/ with name:', playName);
        
        const mockPlayId = "new-play-123"; // This will come from your future endpoint
        setShowCreatePlayModal(false);

        // Redirecting to the play-specific page
        navigate(`/brackets/${tournamentId}/${user.id}/${mockPlayId}`);
    };

    const handleJoinPool = () => {
        if (!user) {
            handleLoginClick();
            return;
        }
        setShowPoolModal(true);
    };

    // Auth Handlers
    const handleLoginClick = () => {
        setAuthModalMode('login');
        setIsAuthModalOpen(true);
    };

    const handleSignUpClick = () => {
        setAuthModalMode('signup');
        setIsAuthModalOpen(true);
    };

    const handleScrollToAbout = () => {
        const element = document.getElementById('about-tournament');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <main id="world-cup-2026" className="bracket-tournament-page">
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

            <section className="user-picks" style={{ position: 'relative' }}>
                <div className="user-picks-container">
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
                        >
                            New Play
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
                                        <th>Position</th>
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
                            onClick={handleJoinPool}
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
                                <button className="btn btn-tan" onClick={handleLoginClick}>Log In</button>
                                <p>or</p>
                                <button className="btn btn-tan" onClick={handleSignUpClick}>Sign Up</button>
                            </div>
                        </div>
                    </div>
                )}
            </section>

            <EventDescription />

            <CreateNewPlayModal
                isOpen={showCreatePlayModal}
                onConfirm={handleCreatePlayConfirm}
                onCancel={() => setShowCreatePlayModal(false)}
            />

            <JoinPoolModal
                isOpen={showPoolModal}
                tournamentId={tournamentId}
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