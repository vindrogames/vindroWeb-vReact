import React, { useState, useEffect } from 'react'; // Added useEffect
import { FaEdit } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import CreateNewPlayModal from '../../components/CreateNewPlayModal';
import JoinPoolModal from '../../components/JoinPoolModal';
import EventDescription from './components/EventDescription';
import ShowcaseSection from '../../../../components/ui/ShowcaseSection';
import AuthModal from '../../../../components/ui/AuthModal';

import { useTournament } from '../../hooks/useTournament';
import tournamentServices from '../../services/tournamentService';
import { useAuth } from '../../../../contexts/auth/AuthContext';
import { usePlayActions } from '../../hooks/usePlayActions';
import playServices from '../../services/playService'; // Added for direct fetch

const WorldCupTournament_2026 = () => {

    const { user } = useAuth();
    const navigate = useNavigate(); // Added navigate

    // --- UI State ---
    const [showCreatePlayModal, setShowCreatePlayModal] = useState(false);
    const [showPoolModal, setShowPoolModal] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authModalMode, setAuthModalMode] = useState('login');

    // --- Data State ---
    const [tournamentData, setTournamentData] = useState([]);
    const [isLoadingTournamentData, setIsLoadingtournamentData] = useState(false);

    const [userPlays, setUserPlays] = useState(null); // CHANGE: Added to store fetched plays
    const [isLoadingPlays, setIsLoadingPlays] = useState([]); // CHANGE: Loading state for table

    // Logic Hook - handles API, slugifying, and navigation
    const { handleCreatePlay, isSubmitting, error: apiError } = usePlayActions();

    const tournamentSlug = "world-cup-2026";

    useEffect(() => {

        const fetchTournamentData = async () => {

            setIsLoadingtournamentData(true);

            try {
                const response = await tournamentServices.getTournamentBySlug(tournamentSlug);

                console.log("tournament Data Fetch:", response);

                setTournamentData(response);
            } catch (err) {
                console.error("Failed to fetch Tournament Data:", err);
                setTournamentData(null);
            } finally {
                setIsLoadingtournamentData(false);
            }
        }

        fetchTournamentData()
    }, [tournamentSlug]);

    useEffect(() => {

        const fetchDashboardData = async () => {

            if (!user) {
                setUserPlays([]);
                return;
            }

            setIsLoadingPlays(true);

            try {
                // This now contains the array: [{"id": "...", "name": "firstPlay", ...}]
                const plays = await playServices.getUserPlays(tournamentData.id);

                // Log it once to be 100% sure what's arriving
                console.log("Dashboard plays received:", plays);

                if (Array.isArray(plays)) {
                    setUserPlays(plays);
                } else {
                    setUserPlays([]);
                }
            } catch (err) {
                console.error("Failed to load dashboard plays:", err);
                setUserPlays([]);
            } finally {
                setIsLoadingPlays(false);
            }
        };

        fetchDashboardData();
    }, [user, tournamentSlug, tournamentData.id]);

    // --- CORE HANDLERS ---
    const handleNewPlay = () => {

        if (!user) {
            handleLoginClick();
            return;
        }
        setShowCreatePlayModal(true);
    };

    const handleCreatePlayConfirm = async (playName) => {

        await handleCreatePlay(tournamentSlug, tournamentData.id, playName, user);
        setShowCreatePlayModal(false);
    };

    // CHANGE: Added navigation handler for existing plays
    const handleNavigateToPlay = (play) => {
        // Convert "My Play Name" to "my-play-name"
        const playSlug = play.name.trim().toLowerCase().replace(/\s+/g, '-');
        // Routing: /brackets/:tournament/:userId/:playName
        navigate(`/brackets/${tournamentSlug}/${user.id}/${playSlug}`, {
            state: { playId: play.id } // Pass UUID in state for immediate lookup
        });
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

    const getUpdateStatus = (play) => {

        const created = new Date(play.created_at);
        const updated = new Date(play.updated_at);

        // Calculate difference in seconds
        const diffInSeconds = Math.abs(updated - created) / 1000;

        // If updated within 5 seconds of creation, it's a "fresh" play
        if (diffInSeconds < 5) {
            return "Never";
        }

        // Otherwise, return a nice readable date
        return updated.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
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
                                        <th>Updated</th>
                                        <th>Groups Pts.</th>
                                        <th>Bracket Pts.</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* CHANGE: Dynamic rendering of plays */}
                                    {isLoadingPlays ? (
                                        <tr><td colSpan="4">Loading plays...</td></tr>
                                    ) : userPlays.length > 0 ? (
                                        userPlays.map((play) => (
                                            <tr
                                                key={play.id}
                                                onClick={() => handleNavigateToPlay(play)}
                                                className="clickable-row"
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <td>{play.name} <FaEdit /></td>
                                                <td>{getUpdateStatus(play)}</td>
                                                <td>{play.group_points || 0}</td>
                                                <td>{play.bracket_points || 0}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr className="no-plays"><td colSpan="4">No plays found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div id="create-play-buttons-container" className="buttons-container">
                            <button className="btn btn-tan" onClick={handleNewPlay}>New Play</button>
                        </div>

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

                        <div id="pools-buttons-container" className="buttons-container">
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

            <ShowcaseSection id="user-picks-section" classes="hero-half bg-tan tournament-leaderboard">
                <div id="tournament-leaderboard" className="tournament-leaderboard-title">
                    <h3>Leaderboard</h3>
                </div>

                <div className="vindro-leaderboard-table">
                        <div className="table-container">
                            <table id="groups-points-table">
                                <thead>
                                    <tr>
                                        <th>Position</th>
                                        <th>User</th>
                                        <th>Play</th>
                                        <th>Group Pts</th>
                                        <th>Bracket Points</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* Map rows for each submitted play*/}

                                </tbody>
                            </table>
                        </div>
                    </div>
            </ShowcaseSection>

            <CreateNewPlayModal
                isOpen={showCreatePlayModal}
                onConfirm={handleCreatePlayConfirm}
                onCancel={() => setShowCreatePlayModal(false)}
                isLoading={isSubmitting}
                apiError={apiError}
            />

            <JoinPoolModal
                isOpen={showPoolModal}
                tournamentId={tournamentData.id}
                //userId={user?.id}
                onSuccess={() => setShowPoolModal(false)}
                onCancel={() => setShowPoolModal(false)}
                plays={userPlays}
            />

            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                defaultMode={authModalMode}
            />
        </main>
    );
};

export default WorldCupTournament_2026;