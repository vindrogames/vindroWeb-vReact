import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FaEdit, FaEye, FaPlus, FaUsers } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';

// UI Components
import ShowcaseSection from '../../../../components/ui/ShowcaseSection';
import AuthModal from '../../../../components/ui/AuthModal';
import EventDescription from './components/EventDescription';
import LeaderboardDisplay from './components/LeaderboardDisplay';
import CreateNewPlayModal from '../../components/CreateNewPlayModal';

// Modals
import JoinPoolModal from '../../components/modals/PoolJoinModal';
import PoolDetailModal from '../../components/modals/PoolDetailModal';

// Custom Hooks
import { useAuth } from '../../../../contexts/auth/AuthContext';
import { useTournament } from '../../hooks/useTournament';
import { useLeaderboards } from '../../hooks/useLeaderboard';
import { usePlays } from '../../hooks/usePlays';
import { usePools } from '../../hooks/usePools';

const WorldCupTournament_2026 = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const tournamentSlug = "world-cup-2026";

    // ---------------------------------------------------------
    // 1. TOURNAMENT DATA
    // ---------------------------------------------------------
    const { tournamentData, isLoading: tourneyLoading } = useTournament(tournamentSlug);

    // ---------------------------------------------------------
    // 2. PLAYS FEATURE
    // ---------------------------------------------------------
    const {
        userPlays,
        isLoading: isLoadingPlays,
        isSubmitting: isPlaySubmitting,
        error: apiError,
        handleCreatePlay,
        refreshPlays
    } = usePlays(tournamentData?.id, user, tournamentSlug);

    const [showCreatePlayModal, setShowCreatePlayModal] = useState(false);

    const handleNewPlay = () => {
        if (!user) { handleLoginClick(); return; }
        setShowCreatePlayModal(true);
    };

    const [returnToPool, setReturnToPool] = useState(false);

    const handleCreatePlayConfirm = async (playName) => {
        const newPlay = await handleCreatePlay(playName);
        if (newPlay && newPlay.id) {
            setShowCreatePlayModal(false);
            if (returnToPool) {
                setReturnToPool(false);
                await refreshPlays();
                setPoolModalMode('join');
                setShowPoolModal(true);
                return;
            }
            const slugPlayName = encodeURIComponent(
                newPlay.name.trim().replace(/\s+/g, '-').toLowerCase()
            );
            navigate(`/brackets/${tournamentSlug}/${user.id}/${slugPlayName}`, {
                state: { playId: newPlay.id }
            });
        }
    };

    const handleCreatePlayFromPool = () => {
        setShowPoolModal(false);
        setReturnToPool(true);
        setShowCreatePlayModal(true);
    };

    const handleNavigateToPlay = (play) => {
        if (!user) return;
        const playSlug = play.name.trim().toLowerCase().replace(/\s+/g, '-');
        navigate(`/brackets/${tournamentSlug}/${user.id}/${playSlug}`, {
            state: { playId: play.id }
        });
    };

    const handleLeaderboardPlayClick = (item) => {
        const playSlug = item.play_name.trim().toLowerCase().replace(/\s+/g, '-');
        navigate(`/brackets/${tournamentSlug}/${item.user.id}/${playSlug}`, {
            state: { playId: item.play_id }
        });
    };

    const getUpdateStatus = (play) => {
        const updated = new Date(play.updated_at);
        const created = new Date(play.created_at);
        if (Math.abs(updated - created) / 1000 < 5) return "Never";
        return updated.toLocaleDateString('en-GB', {
            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
        });
    };

    // ---------------------------------------------------------
    // 3. POOLS FEATURE
    // ---------------------------------------------------------
    const {
        userPools,
        myCreatedPools,
        refreshPools,
        handleJoinPool,
        handleCreatePool,
        isLoading: isLoadingPools,
        isSubmitting: isPoolSubmitting
    } = usePools(tournamentData?.id, user);

    const [showPoolModal, setShowPoolModal] = useState(false);
    const [poolModalMode, setPoolModalMode] = useState('join');
    const [selectedPool, setSelectedPool] = useState(null);
    const [prefilledCode, setPrefilledCode] = useState('');
    const [searchParams, setSearchParams] = useSearchParams();

    // On mount: capture ?pool= param and store it so it survives OAuth redirects
    useEffect(() => {
        const code = searchParams.get('pool');
        if (code) {
            sessionStorage.setItem('pendingPoolCode', code);
            setSearchParams({}, { replace: true });
        }
    }, []);

    // Once user is authenticated, consume any pending pool code
    useEffect(() => {
        if (!user) return;
        const code = sessionStorage.getItem('pendingPoolCode');
        if (code) {
            sessionStorage.removeItem('pendingPoolCode');
            setPrefilledCode(code);
            setPoolModalMode('join');
            setShowPoolModal(true);
        }
    }, [user]);

    const handleJoinPoolClick = () => {
        if (!user) { handleLoginClick(); return; }
        setPrefilledCode('');
        setPoolModalMode('join');
        setShowPoolModal(true);
    };

    const handleCreatePoolClick = () => {
        if (!user) { handleLoginClick(); return; }
        setPoolModalMode('create');
        setShowPoolModal(true);
    };

    const onJoinPoolConfirm = async (poolData) => {
        // poolData usually contains { inviteCode, playId }
        await handleJoinPool(poolData);
        setShowPoolModal(false);
    };

    const onCreatePoolConfirm = async (poolData) => {
        // poolData usually contains { name, description, etc }
        await handleCreatePool(poolData);
        setShowPoolModal(false);
    };

    // ---------------------------------------------------------
    // 4. LEADERBOARD FEATURE
    // ---------------------------------------------------------
    const {
        publicLeaderboard,
        isPublicLoading,
        refreshPublic
    } = useLeaderboards(tournamentData?.id);

    const leaderboardCols = [
        {
            header: "Pos.",
            render: (_, idx) => <strong>{idx + 1}</strong>
        },
        {
            header: "Player",
            render: (item) => {
                const avatarUrl = item.user?.avatar || '';
                // List of base colors to check for in the URL
                const colors = ['teal', 'green', 'gray', 'yellow', 'red', 'orange', 'pink', 'purple'];
                const colorMatch = colors.find(c => avatarUrl.includes(c)) || 'gray';

                // Handle the "neon" or "real" naming convention mismatch
                let colorClass = `inline-${colorMatch}`;
                if (['orange', 'pink', 'purple'].includes(colorMatch)) colorClass = `inline-neon-${colorMatch}`;
                if (['yellow', 'red'].includes(colorMatch)) colorClass = `inline-real-${colorMatch}`;

                return (
                    <div className={`avatar-wrapper ${colorClass}`} data-tooltip={item.user?.username || 'Anonymous'}>
                        <img
                            src={avatarUrl || '/img/profile_icons/gray-simple.webp'}
                            className="player-avatar"
                            alt="avatar"
                        />
                    </div>
                );
            }
        },
        {
            header: "Play",
            className: "table-link",
            render: (item) => {
                const avatarUrl = item.user?.avatar || '';
                const colors = ['teal', 'green', 'gray', 'yellow', 'red', 'orange', 'pink', 'purple', 'white'];
                const colorMatch = colors.find(c => avatarUrl.includes(c)) || 'gray';

                // Map the found color to your specific SCSS classes
                let colorClass = `inline-${colorMatch}`;
                if (['orange', 'pink', 'purple', 'green', 'white', 'teal'].includes(colorMatch)) colorClass = `inline-neon-${colorMatch}`;
                if (['yellow', 'red'].includes(colorMatch)) colorClass = `inline-real-${colorMatch}`;

                return <span className={`${colorClass} inline-bold table-link`}>{item.play_name}</span>;
            },
        },
        { header: "Groups Pts", render: (item) => (item.group_points ?? 0).toString() },
        { header: "Bracket Pts", render: (item) => (item.bracket_points ?? 0).toString() }
    ];

    // ---------------------------------------------------------
    // 5. UI & AUTH HELPERS
    // ---------------------------------------------------------
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authModalMode, setAuthModalMode] = useState('login');

    // If a pending pool code exists but the user isn't logged in, prompt login
    useEffect(() => {
        if (user) return;
        const code = sessionStorage.getItem('pendingPoolCode');
        if (code) {
            setAuthModalMode('login');
            setIsAuthModalOpen(true);
        }
    }, [user]);

    const handleLoginClick = () => {
        setAuthModalMode('login');
        setIsAuthModalOpen(true);
    };

    const handleSignUpClick = () => {
        setAuthModalMode('signup');
        setIsAuthModalOpen(true);
    };

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
                        <div className="table-container bg-black backdrop-gray">
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
                                    {isLoadingPlays ? (
                                        <tr><td colSpan="4">Loading plays...</td></tr>
                                    ) : userPlays?.length > 0 ? (
                                        userPlays.map((play) => (
                                            <tr key={play.id} onClick={() => handleNavigateToPlay(play)} className="clickable-row">
                                                <td className="table-link play-link">{play.name}</td>
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
                        <div className="buttons-container">
                            <button className="btn btn-tan" onClick={handleNewPlay}>New Play</button>
                        </div>
                    </div>

                    <div className="title-container plays-in-pools"><h3>Your Plays in Pools</h3></div>
                    <div className="user-stats-container">
                        <div className="table-container bg-black backdrop-gray">
                            <table>
                                <thead>
                                    <tr><th>Pool</th><th>Play</th><th>Manager</th><th>Pos.</th></tr>
                                </thead>
                                <tbody>
                                    {isLoadingPools ? (
                                        <tr><td colSpan="4">Loading pools...</td></tr>
                                    ) : userPools?.length > 0 ? (
                                        userPools.map(pool => (
                                            <tr key={pool.id} className="clickable-row">
                                                <td>{pool.pool_name}</td>
                                                <td>{pool.play_name}</td>
                                                <td>{pool.manager}</td>
                                                <td>{pool.rank || '-'}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="4">You haven't joined any pools yet.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="buttons-container">
                            <button className="btn btn-tan" onClick={handleJoinPoolClick}>Join a Pool</button>
                        </div>
                    </div>

                    <div className="title-container your-pools"><h3>Your Pools</h3></div>
                    <div className="user-stats-container">
                        <div className="table-container bg-black backdrop-gray">
                            <table>
                                <thead>
                                    <tr><th>Pool</th><th>Members</th></tr>
                                </thead>
                                <tbody>
                                    {isLoadingPools ? (
                                        <tr><td colSpan="2">Loading pools...</td></tr>
                                    ) : myCreatedPools?.length > 0 ? (
                                        myCreatedPools.map(pool => (
                                            <tr key={pool.id} className="clickable-row" onClick={() => setSelectedPool(pool)}>
                                                <td>{pool.name}</td>
                                                <td>{pool.current_member_count}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="2">You haven't created any pools yet.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="buttons-container">
                            <button className="btn btn-tan" onClick={handleCreatePoolClick}>Create a Pool</button>
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

            <div id="tournament-leaderboard">
                <LeaderboardDisplay
                    title={<>vindro<span className='inline-green inline-bold'>Pool</span> Leaderboard</>}
                    data={publicLeaderboard}
                    columns={leaderboardCols}
                    isLoading={isPublicLoading}
                    showBack={false}
                    onRowClick={handleLeaderboardPlayClick}
                    emptyMessage="No entries found."
                    classes="bg-tan hero-half"
                    tableContainerClasses="table-container bg-gray backdrop-tan"
                />
            </div>

            <CreateNewPlayModal
                isOpen={showCreatePlayModal}
                onConfirm={handleCreatePlayConfirm}
                onCancel={() => setShowCreatePlayModal(false)}
                isLoading={isPlaySubmitting}
                apiError={apiError}
            />

            <JoinPoolModal
                isOpen={showPoolModal}
                mode={poolModalMode}
                tournamentId={tournamentData?.id}
                onConfirm={poolModalMode === 'join' ? onJoinPoolConfirm : onCreatePoolConfirm}
                onCancel={() => setShowPoolModal(false)}
                plays={userPlays}
                isLoading={isPoolSubmitting}
                initialCode={prefilledCode}
                onCreatePlay={handleCreatePlayFromPool}
                onSuccess={() => {
                    refreshPools();
                    refreshPublic();
                    setShowPoolModal(false);
                }}
            />

            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                defaultMode={authModalMode}
            />

            <PoolDetailModal
                pool={selectedPool}
                onClose={() => setSelectedPool(null)}
            />
        </main>
    );
};

export default WorldCupTournament_2026;