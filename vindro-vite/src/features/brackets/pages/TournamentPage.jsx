import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ShowcaseSection from '../../../components/ui/ShowcaseSection';
import DescriptionDropdown from '../../../components/ui/DescriptionDropdown';
import AuthModal from '../../../components/ui/AuthModal';
import Leaderboard from '../../../components/ui/Leaderboard';
import PlayCreateNewModal from '../components/modals/PlayCreateNewModal';
import JoinPoolModal from '../components/modals/PoolJoinModal';
import PoolCreateNewModal from '../components/modals/PoolCreateNewModal';
import { useAuth } from '../../../contexts/auth/AuthContext';
import { useTournament } from '../hooks/useTournament';
import { useLeaderboards } from '../hooks/useLeaderboard';
import { usePlays } from '../hooks/usePlays';
import { usePools } from '../hooks/usePools';
import { EVENT_MAP } from '../tournaments/eventMap';
import TournamentHelmet from '../../../page-helmets/TournamentHelmet';

const startCountdown = (targetDateString, setTime) => {
    const target = new Date(targetDateString);
    function tick() {
        const diff = target - new Date();
        if (diff <= 0) { setTime('Closed'); return; }
        const s = Math.floor(diff / 1000);
        const d = Math.floor(s / 86400);
        const h = Math.floor((s % 86400) / 3600);
        const m = Math.floor((s % 3600) / 60);
        const sec = s % 60;
        setTime(`${d}d ${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`);
    }
    tick();
    return setInterval(tick, 1000);
};

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

    // ── TOURNAMENT START GATE ─────────────────────────────────────────────────
    const tournamentStarted = !!(tournamentData?.start_date && new Date() > new Date(tournamentData.start_date));
    const [heroCountdown, setHeroCountdown] = useState('');

    useEffect(() => {
        if (!tournamentData?.start_date || tournamentStarted) return;
        const interval = startCountdown(tournamentData.start_date, setHeroCountdown);
        return () => clearInterval(interval);
    }, [tournamentData?.start_date, tournamentStarted]);

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
            navigate(`/brackets/${tournamentSlug}/play/${user.id}/${encodeURIComponent(newPlay.name)}`);
        }
    };

    const handleCreatePlayFromPool = () => {
        setShowJoinModal(false);
        setReturnToPool(true);
        setShowCreatePlayModal(true);
    };

    const handleNavigateToPlay = (play) => {
        if (!user) return;
        navigate(`/brackets/${tournamentSlug}/play/${user.id}/${encodeURIComponent(play.name)}`);
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
        const name = pool.pool_name || pool.name || '';
        if (pool.is_public) {
            handleScrollToSection('tournament-leaderboard');
        } else {
            navigate(`/brackets/${tournamentSlug}/pool/${encodeURIComponent(name)}`);
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
        navigate(`/brackets/${tournamentSlug}/play/${item.user.id}/${encodeURIComponent(item.play_name)}`);
    };

    const leaderboardCols = [
        {
            header: 'Pos.',
            width: '7%',
            narrow: true,
            render: (_, idx) => <strong>{idx + 1}</strong>
        },
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

            <TournamentHelmet tournamentName={tournamentData?.name || title.highlight} />

            <ShowcaseSection classes="hero-half bg-black brackets-hero">
                <h1>{title.before}<span className="inline-bold inline-teal">{title.highlight}</span>{title.after}</h1>
                <h2>Create a Play. Make your picks. Submit to a Pool</h2>
                {tournamentStarted ? (
                    <p className="hero-countdown under-way">Under <span className="tournament-countdown">Way!</span></p>
                ) : heroCountdown ? (
                    <p className="hero-countdown">Starts in <span className="tournament-countdown">{heroCountdown}</span></p>
                ) : null}
                <div className="brackets-hero-buttons-wrapper">

                </div>
            </ShowcaseSection>

            <ShowcaseSection id="user-picks-section" classes="hero-half bg-gray user-picks">

                <div className="user-picks-container">

                    <div className="title-container-wrapper">
                        <h3>Your Plays</h3>
                    </div>

                    <div className="user-picks-description-wrapper">
                        <DescriptionDropdown summary='A "Play" includes your predictions for a Tournament.'>
                            <h4>This World Cup 2026 Tournament has 2 stages: <span className='inline-bold'>Groups</span> & the <span className='inline-bold'>Bracket</span></h4>
                            <h4>Your plays are private until you submit them to a pool.</h4>
                        </DescriptionDropdown>
                        <div className="buttons-container">
                            {tournamentStarted ? (
                                <span className="disabled-btn-wrapper">
                                    <button className="btn btn-tan" disabled>Create a Play</button>
                                    <span className="disabled-tooltip">Tournament has started</span>
                                </span>
                            ) : (
                                <button className="btn btn-tan" onClick={handleNewPlay}>Create a Play</button>
                            )}
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

                    <div className="title-container-wrapper">
                        <h3>Plays in Pools</h3>
                    </div>

                    <div className="user-picks-description-wrapper">
                        <DescriptionDropdown summary='To "compete", you submit your plays to Pools.'>
                            <h4>We have a public vindro<span className='inline-bold'>Public</span> Pool for everybody to see.</h4>
                            <h4>You can submit as many plays as you like to our public pool.</h4>
                            <h4>Users can create "Private" Pools that require a code.</h4>
                            <h4>Depending on the config, private pools can limit to 1 play per user and/or define money prizes.</h4>
                        </DescriptionDropdown>
                        <div className="buttons-container">
                            <button className="btn btn-tan" onClick={handleJoinPoolClick}>Submit a Play</button>
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

                    <div className="title-container-wrapper">
                        <h3>Your Pools</h3>
                    </div>

                    <div className="user-picks-description-wrapper">
                        <DescriptionDropdown summary="Create a Private Pool for you and your people!">
                            <h4>You can decide to allow multiple plays per user or limit to 1.</h4>
                            <h4>You can configure the Pool as a "Money Pool" setting a cost per play.</h4>
                            <h4>You can also set the prize payouts by standing.</h4>
                            <h4>You will be able to eliminate any play from your Pool.</h4>
                        </DescriptionDropdown>
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
                                                <td>{pool.is_money_pool ? `${pool.currency || '€'}${pool.cost_per_play}` : '—'}</td>
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

                            <div className="top-half auth-prompt-half">
                                <h5>To participate you must be logged in.</h5>
                                <div className="prompt-links">
                                    <button className="btn btn-tan" onClick={handleLoginClick}>Log In</button>
                                </div>
                            </div>

                            <div className="section-seperator"></div>

                            <div className="bottom-half auth-prompt-half">
                                <h5>Or Check it out before getting started.</h5>

                                <div className="prompt-links">
                                    <button className="btn btn-tan" onClick={() => handleScrollToSection('about-tournament')}>About</button>
                                    <button className="btn btn-tan" onClick={() => handleScrollToSection('tournament-leaderboard')}>Leaderboard</button>
                                </div>
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
                onCreatePlay={handleCreatePlayFromPool}
                onSuccess={(pool) => {
                    refreshPools();
                    refreshPublic();
                    setShowJoinModal(false);
                    if (pool?.is_public) {
                        handleScrollToSection('tournament-leaderboard');
                    } else if (pool?.name) {
                        navigate(`/brackets/${tournamentSlug}/pool/${encodeURIComponent(pool.name)}`);
                    }
                }}
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

        </main>
    );
};

export default TournamentPage;
