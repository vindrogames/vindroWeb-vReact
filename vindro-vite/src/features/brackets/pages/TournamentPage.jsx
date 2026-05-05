import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import ShowcaseSection from '../../../components/ui/ShowcaseSection';
import AuthModal from '../../../components/ui/AuthModal';
import Leaderboard from '../../../components/ui/Leaderboard';
import PlayCreateNewModal from '../components/modals/PlayCreateNewModal';
import JoinPoolModal from '../components/modals/PoolJoinModal';
import PoolCreateNewModal from '../components/modals/PoolCreateNewModal';
import PoolDetailModal from '../components/modals/PoolDetailModal';
import { useAuth } from '../../../contexts/auth/AuthContext';
import { useTournament } from '../hooks/useTournament';
import { useLeaderboards } from '../hooks/useLeaderboard';
import { usePlays } from '../hooks/usePlays';
import { usePools } from '../hooks/usePools';
import { EVENT_MAP } from '../tournaments/eventMap';

const TournamentPage = () => {
    const { tournament: tournamentSlug } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const config = EVENT_MAP[tournamentSlug];

    // ── DATA HOOKS ────────────────────────────────────────────────────────────
    const { tournamentData } = useTournament(tournamentSlug);

    const {
        userPlays,
        isLoading: isLoadingPlays,
        isSubmitting: isPlaySubmitting,
        error: apiError,
        handleCreatePlay,
        refreshPlays,
    } = usePlays(tournamentData?.id, user, tournamentSlug);

    const {
        userPools,
        myCreatedPools,
        refreshPools,
        isLoading: isLoadingPools,
    } = usePools(tournamentData?.id, user);

    const { publicLeaderboard, isPublicLoading, refreshPublic } = useLeaderboards(tournamentData?.public_pool_id);

    // ── PLAY MODALS ───────────────────────────────────────────────────────────
    const [showCreatePlayModal, setShowCreatePlayModal] = useState(false);
    const [returnToPool, setReturnToPool] = useState(false);

    const handleNewPlay = () => {
        if (!user) { handleLoginClick(); return; }
        setShowCreatePlayModal(true);
    };

    const handleCreatePlayConfirm = async (playName) => {
        const newPlay = await handleCreatePlay(playName);
        if (newPlay?.id) {
            setShowCreatePlayModal(false);
            if (returnToPool) {
                setReturnToPool(false);
                await refreshPlays();
                setShowJoinModal(true);
                return;
            }
            const slugPlayName = encodeURIComponent(newPlay.name.trim().replace(/\s+/g, '-').toLowerCase());
            navigate(`/brackets/${tournamentSlug}/${user.id}/${slugPlayName}?pid=${newPlay.id}`, {
                state: { playId: newPlay.id },
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
            state: { playId: play.id },
        });
    };

    const getUpdateStatus = (play) => {
        const updated = new Date(play.updated_at);
        const created = new Date(play.created_at);
        if (Math.abs(updated - created) / 1000 < 5) return 'Never';
        return updated.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
    };

    // ── POOL MODALS ───────────────────────────────────────────────────────────
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedPool, setSelectedPool] = useState(null);
    const [prefilledCode, setPrefilledCode] = useState('');
    const [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
        const code = searchParams.get('pool');
        if (code) {
            sessionStorage.setItem('pendingPoolCode', code);
            setSearchParams({}, { replace: true });
        }
    }, []);

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

    // ── LEADERBOARD COLUMNS ───────────────────────────────────────────────────
    const AVATAR_COLORS = ['teal', 'green', 'gray', 'yellow', 'red', 'orange', 'pink', 'purple', 'white'];

    const avatarColorClass = (avatarUrl) => {
        const match = AVATAR_COLORS.find(c => avatarUrl.includes(c)) || 'gray';
        if (['orange', 'pink', 'purple', 'green', 'white', 'teal'].includes(match)) return `inline-neon-${match}`;
        if (['yellow', 'red'].includes(match)) return `inline-real-${match}`;
        return `inline-${match}`;
    };

    const handleLeaderboardPlayClick = (item) => {
        const playSlug = item.play_name.trim().toLowerCase().replace(/\s+/g, '-');
        navigate(`/brackets/${tournamentSlug}/${item.user.id}/${playSlug}?pid=${item.play_id}`, {
            state: { playId: item.play_id },
        });
    };

    const leaderboardCols = [
        { header: 'Pos.', width: '7%', narrow: true, render: (_, idx) => <strong>{idx + 1}</strong> },
        {
            header: 'Player',
            width: '10%',
            narrow: true,
            render: (item) => {
                const url = item.user?.avatar || '';
                return (
                    <div className={`avatar-wrapper ${avatarColorClass(url)}`} data-tooltip={item.user?.username || 'Anonymous'}>
                        <img src={url || '/img/profile_icons/gray-simple.webp'} className="player-avatar" alt="avatar" />
                    </div>
                );
            },
        },
        {
            header: 'Play',
            width: config?.hasGroupStage ? '42%' : '63%',
            truncate: true,
            className: 'table-link',
            render: (item) => {
                const url = item.user?.avatar || '';
                return <span className={`${avatarColorClass(url)} inline-bold table-link`}>{item.play_name}</span>;
            },
        },
        ...(config?.hasGroupStage
            ? [{ header: 'Groups Pts', width: '20.5%', render: (item) => (item.group_points ?? 0).toString() }]
            : []),
        { header: 'Bracket Pts', width: '20.5%', render: (item) => (item.bracket_points ?? 0).toString() },
    ];

    // ── AUTH HELPERS ──────────────────────────────────────────────────────────
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authModalMode, setAuthModalMode] = useState('login');

    useEffect(() => {
        if (user) return;
        const code = sessionStorage.getItem('pendingPoolCode');
        if (code) { setAuthModalMode('login'); setIsAuthModalOpen(true); }
    }, [user]);

    const handleLoginClick = () => { setAuthModalMode('login'); setIsAuthModalOpen(true); };
    const handleSignUpClick = () => { setAuthModalMode('signup'); setIsAuthModalOpen(true); };

    const handleScrollToSection = (id) => {
        const el = document.getElementById(id);
        if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 90, behavior: 'smooth' });
    };

    // ── UNKNOWN TOURNAMENT ────────────────────────────────────────────────────
    if (!config) {
        return (
            <main className="bracket-tournament-page">
                <div className="not-found-container">
                    <h2>tournament<span className="inline-teal inline-bold">NotFound</span></h2>
                    <button className="btn btn-tan" onClick={() => navigate('/brackets')}>Back to Brackets</button>
                </div>
            </main>
        );
    }

    const { title, subtitle, EventDescription, hasGroupStage, pageId } = config;

    // ── RENDER ────────────────────────────────────────────────────────────────
    return (
        <main id={pageId} className="bracket-tournament-page">

            <ShowcaseSection classes="hero-half bg-black brackets-hero">
                <h1>{title.before}<span className="inline-bold inline-teal">{title.highlight}</span>{title.after}</h1>
                <h2>{subtitle}</h2>
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
                                        {hasGroupStage && <th className="centered-text">Groups Pts.</th>}
                                        <th className="centered-text">Bracket Pts.</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoadingPlays ? (
                                        <tr><td colSpan={hasGroupStage ? 4 : 3}>Loading plays...</td></tr>
                                    ) : userPlays?.length > 0 ? (
                                        userPlays.map((play) => (
                                            <tr key={play.id} onClick={() => handleNavigateToPlay(play)} className="clickable-row">
                                                <td className="table-link play-link">{play.name}</td>
                                                <td>{getUpdateStatus(play)}</td>
                                                {hasGroupStage && <td className="centered-text">{play.group_points || 0}</td>}
                                                <td className="centered-text">{play.bracket_points || 0}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr className="no-plays"><td colSpan={hasGroupStage ? 4 : 3}>No plays found.</td></tr>
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
                        <h3 className="main-title">vindro<span className="inline-teal inline-bold">Pool</span> Leaderboard</h3>
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
                onSuccess={() => { refreshPools(); refreshPublic(); setShowJoinModal(false); }}
            />

            <PoolCreateNewModal
                isOpen={showCreateModal}
                tournamentId={tournamentData?.id}
                tournamentSlug={tournamentSlug}
                onCancel={() => setShowCreateModal(false)}
                onCreated={() => { refreshPools(); setShowCreateModal(false); }}
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

export default TournamentPage;
