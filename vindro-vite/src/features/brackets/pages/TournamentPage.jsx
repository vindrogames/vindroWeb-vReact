import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import ShowcaseSection from '../../../components/ui/ShowcaseSection';
import DescriptionDropdown from '../components/DescriptionDropdown';
import AuthModal from '../../../components/ui/AuthModal';
import Leaderboard from '../../../components/ui/Leaderboard';
import PlayCreateNewModal from '../components/modals/PlayCreateNewModal';
import JoinPoolModal from '../components/modals/PoolJoinModal';
import PoolCreateNewModal from '../components/modals/PoolCreateNewModal';
import TournamentLoginPromptBanner from '../components/TournamentLoginPromptBanner';
import InviteSuccessModal from '../components/modals/InviteSuccessModal';
import ExistingUserInviteModal from '../components/modals/ExistingUserInviteModal';
import PlayNotInPoolsModal from '../components/modals/PlayNotInPoolsModal';
import { useAuth } from '../../../contexts/auth/AuthContext';
import playServices from '../services/playServices';
import poolServices from '../services/poolServices';
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
    const { user, showWelcomeModal, dismissWelcomeModal } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation('tournament');
    const { t: tPlay } = useTranslation('play');

    const [activeTab, setActiveTab] = useState('play');

    const [playsDropdownOpen, setPlaysDropdownOpen] = useState(false);
    const [playsInPoolsDropdownOpen, setPlaysInPoolsDropdownOpen] = useState(false);
    const [userPoolsDropdownOpen, setUserPoolsDropdownOpen] = useState(false);
    const [guestGroupDropdownOpen, setGuestGroupDropdownOpen] = useState(false);
    const [guestBracketDropdownOpen, setGuestBracketDropdownOpen] = useState(false);

    const dropdownOpen = playsDropdownOpen || playsInPoolsDropdownOpen || userPoolsDropdownOpen || guestGroupDropdownOpen || guestBracketDropdownOpen;

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

    // ── PLAY MODALS ───────────────────────────────────────────────────────────
    const [showCreatePlayModal, setShowCreatePlayModal] = useState(false);
    const [returnToPool, setReturnToPool] = useState(false);
    const [invitePoolCode, setInvitePoolCode] = useState(null);
    const [showInviteSuccessModal, setShowInviteSuccessModal] = useState(false);
    const [inviteSuccessData, setInviteSuccessData] = useState(null);
    const [showExistingUserInviteModal, setShowExistingUserInviteModal] = useState(false);
    const [isExistingUserInviteLoading, setIsExistingUserInviteLoading] = useState(false);
    const [showPoolPromptModal, setShowPoolPromptModal] = useState(false);
    const [poolPromptPlay, setPoolPromptPlay] = useState(null);

    const handleNewPlay = () => {
        if (!user) { handleLoginClick(); return; }
        setShowCreatePlayModal(true);
    };

    const handleCreatePlayConfirm = async (playName) => {
        const newPlay = await handleCreatePlay(playName);
        if (!newPlay?.id) return;
        setShowCreatePlayModal(false);

        if (isNewUser && guestGroupPredictions) {
            try { await playServices.updateGroupPredictions(newPlay.id, guestGroupPredictions); } catch {}
        }

        // Auto-join invited pool
        if (invitePoolCode) {
            // New user with no guest picks — route to PlayPage to make picks first, then auto-join from there
            if (isNewUser && !guestGroupPredictions) {
                navigate(
                    `/brackets/${tournamentSlug}/play/${user.id}/${toUrlSlug(newPlay.name)}`,
                    { state: { invitePoolCode } }
                );
                setInvitePoolCode(null);
                setIsNewUser(false);
                return;
            }
            try {
                const result = await poolServices.joinPool(tournamentData?.id, [newPlay.id], 'private', invitePoolCode);
                setInviteSuccessData({ playName: newPlay.name, poolName: result?.pool_name || 'the pool' });
                setShowInviteSuccessModal(true);
            } catch {
                navigate(`/brackets/${tournamentSlug}/play/${user.id}/${toUrlSlug(newPlay.name)}`);
            }
            setInvitePoolCode(null);
            setIsNewUser(false);
            return;
        }

        if (returnToPool) {
            setReturnToPool(false);
            setIsNewUser(false);
            await refreshPlays();
            setShowJoinModal(true);
            return;
        }

        setPoolPromptPlay(newPlay);
        setShowPoolPromptModal(true);
    };

    const handleCreatePlayFromPool = () => {
        setShowJoinModal(false);
        setReturnToPool(true);
        setShowCreatePlayModal(true);
    };

    const handleExistingUserInviteSubmit = async (type, value) => {
        setIsExistingUserInviteLoading(true);
        try {
            let playId, playName;
            if (type === 'new') {
                const newPlay = await handleCreatePlay(value);
                if (!newPlay?.id) return;
                playId = newPlay.id;
                playName = newPlay.name;
                if (guestGroupPredictions) {
                    try { await playServices.updateGroupPredictions(playId, guestGroupPredictions); } catch {}
                }
            } else {
                playId = value;
                playName = userPlays.find(p => p.id === value)?.name || 'Your play';
            }

            setShowExistingUserInviteModal(false);

            if (invitePoolCode) {
                const result = await poolServices.joinPool(tournamentData?.id, [playId], 'private', invitePoolCode);
                setInviteSuccessData({ playName, poolName: result?.pool_name || 'the pool' });
                setShowInviteSuccessModal(true);
                setInvitePoolCode(null);
            } else {
                setPoolPromptPlay({ id: playId, name: playName });
                setShowPoolPromptModal(true);
            }
        } catch { /* silently fail */ } finally {
            setIsExistingUserInviteLoading(false);
        }
    };

    const handleInviteSuccessAction = (goToPool) => {
        const { poolName } = inviteSuccessData || {};
        setShowInviteSuccessModal(false);
        if (goToPool && poolName) {
            navigate(`/brackets/${tournamentSlug}/pool/${toUrlSlug(poolName)}`);
        }
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
            setActiveTab('leaderboard');
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
        const inviteFlow = sessionStorage.getItem('pendingInviteFlow');
        if (code && !inviteFlow) { setAuthModalMode('login'); setIsAuthModalOpen(true); }
    }, [user]);

    const handleLoginClick = () => { setAuthModalMode('login'); setIsAuthModalOpen(true); };

    // ── GUEST INTERACTIVE PLAY ────────────────────────────────────────────────
    const { GroupStage, BracketStage } = config || {};
    const [guestGroupPredictions, setGuestGroupPredictions] = useState(null);
    const [guestBracketPredictions, setGuestBracketPredictions] = useState(null);
    const [activeEditId, setActiveEditId] = useState(null);
    const [showGroupLoginBanner, setShowGroupLoginBanner] = useState(false);
    const groupCancelEditRef = useRef(null);
    const [showBracketLoginBanner, setShowBracketLoginBanner] = useState(false);
    const bracketCancelEditRef = useRef(null);
    const [isNewUser, setIsNewUser] = useState(false);

    // Detect new user returning from OAuth — restore predictions, capture invite code.
    // If they came from guest editing, show the save modal. Otherwise show create modal.
    useEffect(() => {
        if (!showWelcomeModal || !user) return;
        dismissWelcomeModal();
        setIsNewUser(true);
        const saved = sessionStorage.getItem('pendingGroupPredictions');
        const hadGuestEdits = !!saved;
        if (saved) {
            try { setGuestGroupPredictions(JSON.parse(saved)); } catch {}
            sessionStorage.removeItem('pendingGroupPredictions');
        }
        const poolCode = sessionStorage.getItem('pendingPoolCode');
        if (poolCode) {
            setInvitePoolCode(poolCode);
            sessionStorage.removeItem('pendingPoolCode');
        }
        sessionStorage.removeItem('pendingInviteFlow');
        if (hadGuestEdits) {
            setShowExistingUserInviteModal(true);
        } else {
            setShowCreatePlayModal(true);
        }
    }, [showWelcomeModal, user]);

    // Detect EXISTING user returning from OAuth with a pending invite — show the invite modal.
    useEffect(() => {
        if (!user || showWelcomeModal) return;
        const pendingInvite = sessionStorage.getItem('pendingInviteFlow');
        if (!pendingInvite) return;
        sessionStorage.removeItem('pendingInviteFlow');
        const poolCode = sessionStorage.getItem('pendingPoolCode');
        const savedGroup = sessionStorage.getItem('pendingGroupPredictions');
        if (poolCode) { setInvitePoolCode(poolCode); sessionStorage.removeItem('pendingPoolCode'); }
        if (savedGroup) {
            try { setGuestGroupPredictions(JSON.parse(savedGroup)); } catch {}
            sessionStorage.removeItem('pendingGroupPredictions');
        }
        setShowExistingUserInviteModal(true);
    }, [user, showWelcomeModal]);

    const [guestGroupCountdown, setGuestGroupCountdown] = useState('');
    const [guestBracketOpenCountdown, setGuestBracketOpenCountdown] = useState('');
    const [guestBracketCloseCountdown, setGuestBracketCloseCountdown] = useState('');

    const guestBracketOpenDate = tournamentData?.groups_end_date;
    const guestBracketCloseDate = tournamentData?.bracket_start_date;
    const guestIsBracketNotYet = !!guestBracketOpenDate && new Date() < new Date(guestBracketOpenDate);
    const guestIsBracketOpen = !!guestBracketOpenDate && !guestIsBracketNotYet && !!guestBracketCloseDate && new Date() < new Date(guestBracketCloseDate);
    const guestIsBracketClosed = !!guestBracketCloseDate && !guestIsBracketNotYet && !guestIsBracketOpen;

    useEffect(() => {
        if (!user && tournamentData?.format) {
            setGuestGroupPredictions(tournamentData.format.groups);
            setGuestBracketPredictions(guestIsBracketNotYet && bracketSeed ? bracketSeed : tournamentData.format.bracket);
        }
    }, [tournamentData?.format, user, guestIsBracketNotYet]);

    useEffect(() => {
        if (tournamentStarted || !tournamentData?.start_date) return;
        const interval = startCountdown(tournamentData.start_date, setGuestGroupCountdown, 'Closed');
        return () => clearInterval(interval);
    }, [tournamentData?.start_date, tournamentStarted]);

    useEffect(() => {
        if (!guestIsBracketNotYet || !guestBracketOpenDate) return;
        const interval = startCountdown(guestBracketOpenDate, setGuestBracketOpenCountdown, 'Closed');
        return () => clearInterval(interval);
    }, [guestIsBracketNotYet, guestBracketOpenDate]);

    useEffect(() => {
        if (!guestIsBracketOpen || !guestBracketCloseDate) return;
        const interval = startCountdown(guestBracketCloseDate, setGuestBracketCloseCountdown, 'Closed');
        return () => clearInterval(interval);
    }, [guestIsBracketOpen, guestBracketCloseDate]);

    const isBracketEditing = activeEditId?.startsWith('bk-');
    const isGroupEditing = !!activeEditId && !isBracketEditing;

    const handleGuestUpdateGroupOrder = (groupName, newTeams) => {
        setGuestGroupPredictions(prev => ({ ...prev, [groupName]: newTeams }));
    };

    if (!config) return <NotFoundPage />;

    const { title, EventDescription, hasGroupStage, pageId, bracketSeed } = config;

    // ── RENDER ────────────────────────────────────────────────────────────────
    return (
        <main id={pageId} className={`bracket-tournament-page ${dropdownOpen ? ' dropdown-active' : ''}`}>

            <TournamentHelmet tournamentName={tournamentData?.name || title.highlight} tournamentSlug={tournamentSlug} />

            {/* ── HERO ── */}
            <ShowcaseSection id="tournament-intro" classes="hero-half bg-black brackets-hero">
                <h1>{title.before}<span className="inline-bold inline-teal">{title.highlight}</span>{title.after}</h1>
                <h2>{t('hero.tagline')}</h2>
                {tournamentStarted && (
                    <p className="tournament-status-line">{t('hero.underwayPrefix')} <span className="inline-real-yellow inline-bold">{t('hero.underwayHighlight')}</span></p>
                )}

                {!user && (
                    <p className="tournament-status-line hero-login-nudge">
                        {t('guest.alreadyRegistered')}{' '}
                        <button className="btn-link" onClick={handleLoginClick}>{t('guest.loginLink')}</button>
                        {' '}{t('guest.toSeeYourPlays')}
                    </p>
                )}

                <nav className="play-tab-nav">
                    <div className="buttons-container">
                        <button
                            className={`tab-play${activeTab === 'play' ? ' active' : ''}`}
                            onClick={() => setActiveTab('play')}
                        >
                            {t('tabs.play')}
                        </button>
                        <button
                            className={`tab-about${activeTab === 'howItWorks' ? ' active' : ''}`}
                            onClick={() => setActiveTab('howItWorks')}
                        >
                            {t('tabs.howItWorks')}
                        </button>
                        <button
                            className={`tab-leaderboard${activeTab === 'leaderboard' ? ' active' : ''}`}
                            onClick={() => setActiveTab('leaderboard')}
                        >
                            {t('tabs.leaderboard')}
                        </button>
                    </div>
                </nav>
            </ShowcaseSection>

            {/* ── PLAY TAB ── */}
            {activeTab === 'play' && (
                user ? (
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

                        </div>
                    </ShowcaseSection>
                ) : (
                    <div id="guest-play-section" className={`play-stages-wrapper play-pool-toggle-wrapper${activeEditId ? ' has-active-focus' : ''}`}>

                        {GroupStage && guestGroupPredictions && (
                            <section id="guest-groups" className={`play-prediction-container${isBracketEditing ? ' is-dimmed' : ''}${guestBracketDropdownOpen ? ' peer-dropdown-active' : ''}`}>
                                <div className="prediction-display-intro">
                                    <div className={`title-container-wrapper${isGroupEditing ? ' is-dimmed' : ''}`}>
                                        <h3>group<span className="inline-teal inline-bold">Stage</span></h3>
                                        <h4>pts: -</h4>
                                    </div>
                                    <div className={`description-container${isGroupEditing ? ' is-dimmed' : ''}`}>
                                        <DescriptionDropdown summary={tPlay('groupStage.dropdownSummary')} onOpenChange={setGuestGroupDropdownOpen}>
                                            <h4>{tPlay('groupStage.hint1')}</h4>
                                            <h4>{tPlay('groupStage.hint2')}</h4>
                                            <h4>{tPlay('groupStage.hint3')}</h4>
                                            <h4>{tPlay('groupStage.hint4')}</h4>
                                            <h4>{tPlay('groupStage.hint5')}</h4>
                                        </DescriptionDropdown>
                                        <div className="right-container">
                                            {!tournamentStarted && (
                                                <>
                                                    <p className="tournament-status-line"><span className="inline-teal">{tPlay('groupStage.openLabel')}</span> {tPlay('groupStage.forPredictions')}</p>
                                                    <p className="tournament-status-spacer"> · </p>
                                                    <p className="tournament-status-line">
                                                        {tPlay('groupStage.closesIn')} <span className="inline-real-yellow inline-bold">{guestGroupCountdown}</span>
                                                    </p>
                                                </>
                                            )}
                                            {tournamentStarted && (
                                                <p>
                                                    <span className="inline-neon-pink">{tPlay('groupStage.closedLabel')}</span> {tPlay('groupStage.forPredictions')}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="prediction-display-content-wrapper">
                                    <GroupStage
                                        data={guestGroupPredictions}
                                        isOwner={true}
                                        isEditable={!tournamentStarted}
                                        isStageClosed={tournamentStarted}
                                        groupPoints={null}
                                        onEditingChange={(id, isEditing) => setActiveEditId(isEditing ? id : null)}
                                        onUpdate={handleGuestUpdateGroupOrder}
                                        onSave={async () => {
                                            setShowGroupLoginBanner(true);
                                            throw new Error('login_required');
                                        }}
                                        cancelEditRef={groupCancelEditRef}
                                        loginBanner={
                                            <TournamentLoginPromptBanner
                                                isVisible={showGroupLoginBanner}
                                                onDismiss={() => {
                                                    setShowGroupLoginBanner(false);
                                                    groupCancelEditRef.current?.();
                                                }}
                                                onOpenAuth={(mode) => {
                                                    setShowGroupLoginBanner(false);
                                                    if (guestGroupPredictions) {
                                                        sessionStorage.setItem('pendingGroupPredictions', JSON.stringify(guestGroupPredictions));
                                                        sessionStorage.setItem('pendingInviteFlow', 'true');
                                                    }
                                                    setAuthModalMode(mode);
                                                    setIsAuthModalOpen(true);
                                                }}
                                            />
                                        }
                                    />
                                </div>
                            </section>
                        )}

                        {BracketStage && guestBracketPredictions && (
                            <section id="guest-bracket" className={`play-prediction-container${isGroupEditing ? ' is-dimmed' : ''}${guestGroupDropdownOpen ? ' peer-dropdown-active' : ''}`}>
                                <div className="prediction-display-intro">
                                    <div className={`title-container-wrapper${isGroupEditing ? ' is-dimmed' : ''}`}>
                                        <h3>bracket<span className="inline-teal inline-bold">Stage</span></h3>
                                        <h4>pts: -</h4>
                                    </div>
                                    <div className={`description-container${isBracketEditing ? ' is-dimmed' : ''}`}>
                                        <DescriptionDropdown summary={tPlay('bracketStage.dropdownSummary')} onOpenChange={setGuestBracketDropdownOpen}>
                                            <h4>{tPlay('bracketStage.hint1')}</h4>
                                            <h4>{tPlay('bracketStage.hint2')}</h4>
                                            <h4>{tPlay('bracketStage.hint3')}</h4>
                                            <h4>{tPlay('bracketStage.hint4')}</h4>
                                            <h4>{tPlay('bracketStage.hint5')}</h4>
                                            <h4>{tPlay('bracketStage.hint6')}</h4>
                                            <h4>{tPlay('bracketStage.hint7')}</h4>
                                        </DescriptionDropdown>
                                        <div className="right-container">
                                            {guestIsBracketNotYet && (
                                                <>
                                                    <p className="tournament-status-line"><span className="inline-neon-pink">{tPlay('bracketStage.closedLabel')}</span> {tPlay('bracketStage.forPredictions')}</p>
                                                    <p className="tournament-status-line">
                                                        {tPlay('bracketStage.opensIn')} <span className="inline-real-yellow">{guestBracketOpenCountdown}</span>
                                                    </p>
                                                </>
                                            )}
                                            {guestIsBracketOpen && (
                                                <>
                                                    <p><span className="inline-neon-pink">{tPlay('bracketStage.openLabel')}</span> {tPlay('bracketStage.forPredictions')}</p>
                                                    <p className="tournament-status-line">
                                                        {tPlay('bracketStage.closesIn')} <span className="inline-real-yellow">{guestBracketCloseCountdown}</span>
                                                    </p>
                                                </>
                                            )}
                                            {guestIsBracketClosed && (
                                                <p>
                                                    {tPlay('bracketStage.underwayPrefix')} <span className="inline-neon-pink inline-bold">{tPlay('bracketStage.underwayHighlight')}</span>
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div id="guest-bracket-content" className="prediction-display-content-wrapper">
                                    <BracketStage
                                        data={guestBracketPredictions}
                                        isEditable={guestIsBracketOpen}
                                        onEditingChange={(id, isEditing) => setActiveEditId(isEditing ? id : null)}
                                        onSave={async () => {
                                            setShowBracketLoginBanner(true);
                                            throw new Error('login_required');
                                        }}
                                        cancelEditRef={bracketCancelEditRef}
                                        loginBanner={
                                            <TournamentLoginPromptBanner
                                                isVisible={showBracketLoginBanner}
                                                onDismiss={() => {
                                                    setShowBracketLoginBanner(false);
                                                    bracketCancelEditRef.current?.();
                                                }}
                                                onOpenAuth={(mode) => {
                                                    setShowBracketLoginBanner(false);
                                                    if (guestGroupPredictions) {
                                                        sessionStorage.setItem('pendingGroupPredictions', JSON.stringify(guestGroupPredictions));
                                                        sessionStorage.setItem('pendingInviteFlow', 'true');
                                                    }
                                                    setAuthModalMode(mode);
                                                    setIsAuthModalOpen(true);
                                                }}
                                            />
                                        }
                                    />
                                </div>
                            </section>
                        )}
                    </div>
                )
            )}

            {/* ── HOW IT WORKS TAB ── */}
            {activeTab === 'howItWorks' && <EventDescription />}

            {/* ── LEADERBOARD TAB ── */}
            {activeTab === 'leaderboard' && (
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
            )}

            {/* ── MODALS ── */}
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
                        setActiveTab('leaderboard');
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

            <InviteSuccessModal
                isOpen={showInviteSuccessModal && !!inviteSuccessData}
                data={inviteSuccessData}
                onViewPool={() => handleInviteSuccessAction(true)}
                onLater={() => handleInviteSuccessAction(false)}
            />

            {showExistingUserInviteModal && (
                <ExistingUserInviteModal
                    poolName={invitePoolCode ? 'the pool' : ''}
                    onJoinWithNew={(name) => handleExistingUserInviteSubmit('new', name)}
                    onCancel={() => { setShowExistingUserInviteModal(false); setInvitePoolCode(null); }}
                    isLoading={isExistingUserInviteLoading}
                />
            )}

            <PlayNotInPoolsModal
                isOpen={showPoolPromptModal}
                tournamentId={tournamentData?.id}
                plays={poolPromptPlay ? [poolPromptPlay, ...userPlays.filter(p => p.id !== poolPromptPlay.id)] : userPlays}
                onCreatePlay={handleCreatePlayFromPool}
                onSuccess={(pool) => {
                    setShowPoolPromptModal(false);
                    refreshPools();
                    refreshPublic();
                    setPoolPromptPlay(null);
                    if (poolPromptPlay) {
                        navigate(
                            `/brackets/${tournamentSlug}/play/${user.id}/${toUrlSlug(poolPromptPlay.name)}`,
                            isNewUser ? { state: { newUser: true } } : undefined
                        );
                    }
                    setIsNewUser(false);
                }}
                onCancel={() => {
                    setShowPoolPromptModal(false);
                    if (poolPromptPlay) {
                        navigate(
                            `/brackets/${tournamentSlug}/play/${user.id}/${toUrlSlug(poolPromptPlay.name)}`,
                            isNewUser ? { state: { newUser: true } } : undefined
                        );
                    }
                    setIsNewUser(false);
                    setPoolPromptPlay(null);
                }}
            />


        </main>
    );
};

export default TournamentPage;
