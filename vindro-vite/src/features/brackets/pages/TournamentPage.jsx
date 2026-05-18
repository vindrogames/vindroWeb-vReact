import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import ShowcaseSection from '../../../components/ui/ShowcaseSection';
import DescriptionDropdown from '../components/DescriptionDropdown';
import AuthModal from '../../../components/ui/AuthModal';
import Leaderboard from '../../../components/ui/Leaderboard';
import PlayCreateNewModal from '../components/modals/PlayCreateNewModal';
import JoinPoolModal from '../components/modals/PoolJoinModal';
import PoolCreateNewModal from '../components/modals/PoolCreateNewModal';
import { useAuth } from '../../../contexts/auth/AuthContext';
import { toUrlSlug } from '../../../utils/urlUtils';
import { useTournament } from '../hooks/useTournament';
import { useLeaderboards } from '../hooks/useLeaderboard';
import { usePlays } from '../hooks/usePlays';
import { usePools } from '../hooks/usePools';
import { EVENT_MAP } from '../tournaments/eventMap';
import TournamentHelmet from '../../../page-helmets/TournamentHelmet';
import NotFoundPage from '../../../pages/NotFoundPage';

const startCountdown = (targetDateString, setTime, closedLabel = 'Closed') => {
    const target = new Date(targetDateString);
    function tick() {
        const diff = target - new Date();
        if (diff <= 0) { setTime(closedLabel); return; }
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
    const { t } = useTranslation('tournament');

    const [playsDropdownOpen, setPlaysDropdownOpen] = useState(false);
    const [playsInPoolsDropdownOpen, setPlaysInPoolsDropdownOpen] = useState(false);
    const [userPoolsDropdownOpen, setUserPoolsDropdownOpen] = useState(false);

    const dropdownOpen = playsDropdownOpen || playsInPoolsDropdownOpen || userPoolsDropdownOpen;

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
        const interval = startCountdown(tournamentData.start_date, setHeroCountdown, t('hero.closed'));
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
            navigate(`/brackets/${tournamentSlug}/play/${user.id}/${toUrlSlug(newPlay.name)}`);
        }
    };

    const handleCreatePlayFromPool = () => {
        setShowJoinModal(false);
        setReturnToPool(true);
        setShowCreatePlayModal(true);
    };

    const handleNavigateToPlay = (play) => {
        if (!user) return;
        navigate(`/brackets/${tournamentSlug}/play/${user.id}/${toUrlSlug(play.name)}`);
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
            navigate(`/brackets/${tournamentSlug}/pool/${toUrlSlug(name)}`);
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
        navigate(`/brackets/${tournamentSlug}/play/${item.user.id}/${toUrlSlug(item.play_name)}`);
    };

    const leaderboardCols = [
        {
            header: t('leaderboard.colPos'),
            width: '7%',
            narrow: true,
            render: (_, idx) => <strong>{idx + 1}</strong>
        },
        {
            header: t('leaderboard.colPlayer'),
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
            header: t('leaderboard.colPlay'),
            width: config?.hasGroupStage ? '42%' : '63%',
            truncate: true,
            className: 'table-link',
            render: (item) => {
                const url = item.user?.avatar || '';
                return <span className={`${avatarColorClass(url)} inline-bold table-link`}>{item.play_name}</span>;
            },
        },
        ...(config?.hasGroupStage
            ? [{ header: t('leaderboard.colGroupsPts'), width: '20.5%', render: (item) => (item.group_points ?? 0).toString() }]
            : []),
        { header: t('leaderboard.colBracketPts'), width: '20.5%', render: (item) => (item.bracket_points ?? 0).toString() },
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

    if (!config) return <NotFoundPage />;

    const { title, EventDescription, hasGroupStage, pageId } = config;

    // ── RENDER ────────────────────────────────────────────────────────────────
    return (
        <main id={pageId} className={`bracket-tournament-page ${dropdownOpen ? ' dropdown-active' : ''}`}>

            <TournamentHelmet tournamentName={tournamentData?.name || title.highlight} tournamentSlug={tournamentSlug} />

            <ShowcaseSection id="tournament-intro" classes="hero-half bg-black brackets-hero">
                <h1>{title.before}<span className="inline-bold inline-teal">{title.highlight}</span>{title.after}</h1>
                <h2>{t('hero.tagline')}</h2>
                {tournamentStarted ? (
                    <p className="tournament-status-line">{t('hero.underwayPrefix')} <span className="inline-real-yellow inline-bold">{t('hero.underwayHighlight')}</span></p>
                ) : heroCountdown ? (
                    <p className="tournament-status-line">{t('hero.startsIn')} <span className="inline-real-yellow inline-bold">{heroCountdown}</span></p>
                ) : null}
                <div className="brackets-hero-buttons-wrapper">

                </div>
            </ShowcaseSection>

            <ShowcaseSection id="user-picks-section" classes="hero-half bg-gray user-picks">

                <div className="user-picks-sections-wrapper">

                <section id="plays-picks" className={`user-picks-container ${(playsInPoolsDropdownOpen || userPoolsDropdownOpen) ? ' peer-dropdown-active' : ''}`}>

                    <div className="user-picks-intro">
                        <div className="title-container-wrapper">
                            <h3>{t('plays.title')}</h3>
                        </div>

                        <div className="description-container">
                            <DescriptionDropdown summary={t('plays.dropdownSummary')} onOpenChange={setPlaysDropdownOpen}>
                                {t(`${tournamentSlug}.playsHint`, { defaultValue: '' }) && (
                                    <h4>
                                        <Trans
                                            i18nKey={`${tournamentSlug}.playsHint`}
                                            ns="tournament"
                                            components={{ bold: <span className="inline-bold" /> }}
                                        />
                                    </h4>
                                )}
                                <h4>{t('plays.playsPrivate')}</h4>
                            </DescriptionDropdown>
                            <div className="right-container">
                                {tournamentStarted ? (
                                    <span className="disabled-btn-wrapper">
                                        <button className="btn btn-tan" disabled>{t('buttons.createPlay')}</button>
                                        <span className="disabled-tooltip">{t('plays.disabledTooltip')}</span>
                                    </span>
                                ) : (
                                    <button className="btn btn-tan" onClick={handleNewPlay}>{t('buttons.createPlay')}</button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="user-stats-container">
                        <div className="table-container bg-black backdrop-gray">
                            <table>
                                <thead>
                                    <tr>
                                        <th className="centered-text">{t('plays.colName')}</th>
                                        <th className="centered-text">{t('plays.colUpdated')}</th>
                                        {hasGroupStage && <th className="centered-text">{t('plays.colGroupsPts')}</th>}
                                        <th className="centered-text">{t('plays.colBracketPts')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoadingPlays ? (
                                        <tr><td colSpan={hasGroupStage ? 4 : 3}>{t('plays.loading')}</td></tr>
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
                                        <tr className="no-plays"><td colSpan={hasGroupStage ? 4 : 3}>{t('plays.empty')}</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

                <section id="in-pools-picks" className={`user-picks-container ${(playsDropdownOpen || userPoolsDropdownOpen) ? ' peer-dropdown-active' : ''}`}>

                    <div className="user-picks-intro">
                        <div className="title-container-wrapper">
                            <h3>{t('inPools.title')}</h3>
                        </div>

                        <div className="description-container">
                            <DescriptionDropdown summary={t('inPools.dropdownSummary')} onOpenChange={setPlaysInPoolsDropdownOpen}>
                                <h4><Trans i18nKey="inPools.hint1" ns="tournament" components={{ vindro: <span className="inline-teal inline-bold" /> }} /></h4>
                                <h4>{t('inPools.hint2')}</h4>
                                <h4>{t('inPools.hint3')}</h4>
                                <h4>{t('inPools.hint4')}</h4>
                            </DescriptionDropdown>
                            <div className="right-container">
                                <button className="btn btn-tan" onClick={handleJoinPoolClick}>{t('buttons.submitPlay')}</button>
                            </div>
                        </div>
                    </div>

                    <div className="user-stats-container">
                        <div className="table-container bg-black backdrop-gray">
                            <table>
                                <thead>
                                    <tr>
                                        <th className="centered-text">{t('inPools.colPlay')}</th>
                                        <th className="centered-text">{t('inPools.colPool')}</th>
                                        <th className="centered-text">{t('inPools.colManager')}</th>
                                        <th className="centered-text">{t('inPools.colPos')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoadingPools ? (
                                        <tr><td colSpan="4">{t('inPools.loading')}</td></tr>
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
                                        <tr><td colSpan="4">{t('inPools.empty')}</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

                <section id="your-pools-picks" className={`user-picks-container ${(playsDropdownOpen || playsInPoolsDropdownOpen) ? ' peer-dropdown-active' : ''}`}>

                    <div className="user-picks-intro">
                        <div className="title-container-wrapper">
                            <h3>{t('yourPools.title')}</h3>
                        </div>

                        <div className="description-container">
                            <DescriptionDropdown summary={t('yourPools.dropdownSummary')} onOpenChange={setUserPoolsDropdownOpen}>
                                <h4>{t('yourPools.hint1')}</h4>
                                <h4><Trans i18nKey="yourPools.hint2" ns="tournament" components={{ money: <span className="inline-teal inline-bold" /> }} /></h4>
                                <h4>{t('yourPools.hint3')}</h4>
                                <h4>{t('yourPools.hint4')}</h4>
                            </DescriptionDropdown>
                            <div className="right-container">
                                <button className="btn btn-tan" onClick={handleCreatePoolClick}>{t('buttons.createPool')}</button>
                            </div>
                        </div>
                    </div>

                    <div className="user-stats-container">
                        <div className="table-container bg-black backdrop-gray">
                            <table>
                                <thead>
                                    <tr>
                                        <th>{t('yourPools.colPool')}</th>
                                        <th>{t('yourPools.colMembers')}</th>
                                        <th>{t('yourPools.colPaid')}</th>
                                        <th>{t('yourPools.colPrizes')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoadingPools ? (
                                        <tr><td colSpan="4">{t('yourPools.loading')}</td></tr>
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
                                        <tr><td colSpan="4">{t('yourPools.empty')}</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

                </div>{/* end user-picks-sections-wrapper */}

                {!user && (
                    <div className="auth-prompt-overlay">
                        <div className="auth-prompt-message">

                            <div className="top-half auth-prompt-half">
                                <h5>{t('auth.mustLogin')}</h5>
                                <div className="prompt-links">
                                    <button className="btn btn-tan" onClick={handleLoginClick}>Log In</button>
                                </div>
                                <p>{t('auth.noAccountHint')}</p>
                            </div>

                            <div className="section-seperator sep-pink"></div>

                            <div className="bottom-half auth-prompt-half">
                                <h5>{t('auth.checkItOut')}</h5>

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
                        <h3 className="main-title">vindro<span className="inline-teal inline-bold">Pool</span> {t('leaderboard.title')}</h3>
                    </div>
                </div>

                <Leaderboard
                    data={publicLeaderboard}
                    columns={leaderboardCols}
                    isLoading={isPublicLoading}
                    onRowClick={handleLeaderboardPlayClick}
                    emptyMessage={t('leaderboard.empty')}
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
                        navigate(`/brackets/${tournamentSlug}/pool/${toUrlSlug(pool.name)}`);
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
