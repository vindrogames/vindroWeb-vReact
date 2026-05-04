import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FaEdit, FaEye, FaPlus, FaUsers } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';

// UI Components
import ShowcaseSection from '../../../../components/ui/ShowcaseSection';
import AuthModal from '../../../../components/ui/AuthModal';
import EventDescription from './components/EventDescription';
import Leaderboard from '../../../../components/ui/Leaderboard';
import PlayCreateNewModal from '../../components/modals/PlayCreateNewModal';

// Modals
import JoinPoolModal from '../../components/modals/PoolJoinModal';
import PoolCreateNewModal from '../../components/modals/PoolCreateNewModal';
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
                setShowJoinModal(true);
                return;
            }
            const slugPlayName = encodeURIComponent(
                newPlay.name.trim().replace(/\s+/g, '-').toLowerCase()
            );
            navigate(`/brackets/${tournamentSlug}/${user.id}/${slugPlayName}?pid=${newPlay.id}`, {
                state: { playId: newPlay.id }
            });
        }
    };

    const handleCreatePlayFromPool = () => {
        setShowJoinModal(false);
        setReturnToPool(true);
        setShowCreatePlayModal(true);
    };

    const handleNavigateToPlay = (play) => {
        if (!user) return;
        const playSlug = play.name.trim().toLowerCase().replace(/\s+/g, '-');
        navigate(`/brackets/${tournamentSlug}/${user.id}/${playSlug}?pid=${play.id}`, {
            state: { playId: play.id }
        });
    };

    const handleNavigateToPool = (pool) => {
        if (!user) return;
        const poolId = pool.pool_id || pool.id;
        const poolName = (pool.pool_name || pool.name || '').trim().toLowerCase().replace(/\s+/g, '-');
        if (pool.is_public) {
            handleScrollToSection('tournament-leaderboard');
        } else {
            navigate(`/brackets/${tournamentSlug}/pool/${poolName}?pool_id=${poolId}`, { state: { poolId } });
        }
    };

    const handleLeaderboardPlayClick = (item) => {
        const playSlug = item.play_name.trim().toLowerCase().replace(/\s+/g, '-');
        navigate(`/brackets/${tournamentSlug}/${item.user.id}/${playSlug}?pid=${item.play_id}`, {
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
        isLoading: isLoadingPools,
        isSubmitting: isPoolSubmitting
    } = usePools(tournamentData?.id, user);

    const [showJoinModal, setShowJoinModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
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
            setShowJoinModal(true);
        }
    }, [user]);

    const handleJoinPoolClick = () => {
        if (!user) { handleLoginClick(); return; }
        setPrefilledCode('');
        setShowJoinModal(true);
    };

    const handleCreatePoolClick = () => {
        if (!user) { handleLoginClick(); return; }
        setShowCreateModal(true);
    };

    // ---------------------------------------------------------
    // 4. LEADERBOARD FEATURE
    // ---------------------------------------------------------
    const {
        publicLeaderboard,
        isPublicLoading,
        refreshPublic
    } = useLeaderboards(tournamentData?.public_pool_id);

    const leaderboardCols = [
        {
            header: "Pos.",
            width: "7%",
            narrow: true,
            render: (_, idx) => <strong>{idx + 1}</strong>
        },
        {
            header: "Player",
            width: "10%",
            narrow: true,
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
            width: "42%",
            truncate: true,
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
        { header: "Groups Pts", width: "20.5%", render: (item) => (item.group_points ?? 0).toString() },
        { header: "Bracket Pts", width: "20.5%", render: (item) => (item.bracket_points ?? 0).toString() }
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
                    <div className="title-container predictions">
                        <h3>Your Plays</h3>
                        <div className="buttons-container">
                            <button className="btn btn-tan" onClick={handleNewPlay}>Create a Play</button>
                        </div>
                    </div>

                    <div className="user-stats-container">
                        <div className="table-container bg-black backdrop-gray">
                            <table>
                                <thead>
                                    <tr>
                                        <th className="centered-text">Play Name</th>
                                        <th className="centered-text">Updated</th>
                                        <th className="centered-text">Groups Pts.</th>
                                        <th className="centered-text">Bracket Pts.</th>
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
                                                <td className="centered-text">{play.group_points || 0}</td>
                                                <td className="centered-text">{play.bracket_points || 0}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr className="no-plays"><td colSpan="4">No plays found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="user-picks-container">
                    <div className="title-container plays-in-pools">
                        <h3>Your Plays in Pools</h3>
                        <div className="buttons-container">
                            <button className="btn btn-tan" onClick={handleJoinPoolClick}>Join a Pool</button>
                        </div>
                    </div>

                    <div className="user-stats-container">
                        <div className="table-container bg-black backdrop-gray">
                            <table>
                                <thead>
                                    <tr>
                                        <th className="centered-text">Play</th>
                                        <th className="centered-text">Pool</th>
                                        <th className="centered-text">Manager</th>
                                        <th className="centered-text">Pos.</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoadingPools ? (
                                        <tr><td colSpan="4">Loading pools...</td></tr>
                                    ) : userPools?.length > 0 ? (
                                        userPools.map(pool => (
                                            <tr key={pool.id} className="clickable-row" onClick={() => handleNavigateToPool(pool)}>
                                                <td>{pool.play_name}</td>
                                                <td className="table-link pool-link">{pool.pool_name}</td>
                                                <td>{pool.manager}</td>
                                                <td className="centered-text">{pool.rank || '-'}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="4">You haven't joined any pools yet.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="user-picks-container">                    
                    <div className="title-container your-pools">
                        <h3>Your Pools</h3>
                        <div className="buttons-container">
                            <button className="btn btn-tan" onClick={handleCreatePoolClick}>Create a Pool</button>
                        </div>
                    </div>

                    <div className="user-stats-container">
                        <div className="table-container bg-black backdrop-gray">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Pool</th>
                                        <th>Members</th>
                                        <th>Paid</th>
                                        <th>Prizes</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoadingPools ? (
                                        <tr><td colSpan="4">Loading pools...</td></tr>
                                    ) : myCreatedPools?.length > 0 ? (
                                        myCreatedPools.map(pool => (
                                            <tr key={pool.id} className="clickable-row" onClick={() => handleNavigateToPool(pool)}>
                                                <td className="table-link pool-link">{pool.name}</td>
                                                <td>{pool.current_member_count}</td>
                                                <td>{pool.paid_count ?? '—'}</td>
                                                <td>{pool.is_money_pool ? `€${pool.cost_per_play}` : '—'}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="4">You haven't created any pools yet.</td></tr>
                                    )}
                                </tbody>
                            </table>
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

            <section id="tournament-leaderboard" className="leaderboard-display-container bg-black hero-half">

                <div className="leaderboard-header">
                    <div className="title">
                        <h3 className="main-title">vindro<span className='inline-teal inline-bold'>Pool</span> Leaderboard</h3>
                    </div>
                </div>

                <Leaderboard
                    data={publicLeaderboard}
                    columns={leaderboardCols}
                    isLoading={isPublicLoading}
                    onRowClick={handleLeaderboardPlayClick}
                    emptyMessage="No entries found."
                    tableContainerClasses="table-container bg-gray backdrop-black"
                />
            </section>

            <PlayCreateNewModal
                isOpen={showCreatePlayModal}
                onConfirm={handleCreatePlayConfirm}
                onCancel={() => setShowCreatePlayModal(false)}
                isLoading={isPlaySubmitting}
                apiError={apiError}
            />

            <JoinPoolModal
                isOpen={showJoinModal}
                tournamentId={tournamentData?.id}
                onCancel={() => setShowJoinModal(false)}
                plays={userPlays}
                initialCode={prefilledCode}
                onCreatePlay={handleCreatePlayFromPool}
                onSuccess={() => {
                    refreshPools();
                    refreshPublic();
                    setShowJoinModal(false);
                }}
            />

            <PoolCreateNewModal
                isOpen={showCreateModal}
                tournamentId={tournamentData?.id}
                tournamentSlug={tournamentSlug}
                onCancel={() => setShowCreateModal(false)}
                onCreated={() => {
                    refreshPools();
                    setShowCreateModal(false);
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