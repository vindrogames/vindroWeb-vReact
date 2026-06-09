import React, { useEffect, useState, useCallback, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaEye } from 'react-icons/fa';
import { useAuth } from '../../../contexts/auth/AuthContext';
import { toUrlSlug } from '../../../utils/urlUtils';
import { useLoading } from '../../../contexts/LoadingContext';
import AuthModal from '../../../components/ui/AuthModal';
import ErrorDisplayModal from '../../../components/ui/ErrorDisplayModal';
import JoinPoolModal from '../components/modals/PoolJoinModal';
import PlayCreateNewModal from '../components/modals/PlayCreateNewModal';
import PoolRemovePlayModal from '../components/modals/PoolRemovePlayModal';
import PoolMoniesModal from '../components/modals/PoolMoniesModal';
import PoolInviteModal from '../components/modals/PoolInviteModal';
import PoolAdminModal from '../components/modals/PoolAdminModal';
import NotLoggedInviteModal from '../components/modals/NotLoggedInviteModal';
import Leaderboard from '../../../components/ui/Leaderboard';
import poolServices from '../services/poolServices';
import playServices from '../services/playServices';
import PoolPageHelmet from '../../../page-helmets/PoolPageHelmet';
import { EVENT_MAP } from '../tournaments/eventMap';

const getAvatarColorClass = (avatarUrl = '') => {
    const colors = ['teal', 'green', 'gray', 'yellow', 'red', 'orange', 'pink', 'purple'];
    const colorMatch = colors.find(c => avatarUrl.includes(c)) || 'gray';
    let colorClass = `inline-${colorMatch}`;
    if (['orange', 'pink', 'purple'].includes(colorMatch)) colorClass = `inline-neon-${colorMatch}`;
    if (['yellow', 'red'].includes(colorMatch)) colorClass = `inline-real-${colorMatch}`;
    return colorClass;
};

const avatarBorderColorMap = {
    pink: '#ff2edcff',
    green: '#b4ff00ff',
    orange: '#D97706',
    purple: '#a020f0',
    teal: '#66FCF1',
    white: '#ffffff',
};

const getAvatarBorderColor = (avatarUrl = '') => {
    const matched = Object.keys(avatarBorderColorMap).find(c => avatarUrl.toLowerCase().includes(c));
    return avatarBorderColorMap[matched] || 'transparent';
};

const toErrorCode = (err) => {
    const msg = err?.message?.toLowerCase() || '';
    if (msg.includes('403') || msg.includes('permission') || msg.includes('forbidden')) return 'unauthorized';
    if (msg.includes('401') || msg.includes('authentication')) return 'unauthorized';
    if (msg.includes('404') || msg.includes('not found')) return 'not_found';
    return 'server_error';
};

const cleanTournamentName = (t) =>
    t.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

const PoolPage = () => {

    const { tournament, poolName } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation('play');
    const eventConfig = EVENT_MAP[tournament];

    const { user, showWelcomeModal } = useAuth();
    const { showLoader, hideLoader } = useLoading();

    const [poolData, setPoolData] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [isOwner, setIsOwner] = useState(false);
    const [isMember, setIsMember] = useState(false);
    const [myPlaysInPool, setMyPlaysInPool] = useState([]);
    const [loading, setLoading] = useState(true);

    const [notFound, setNotFound] = useState(false);
    const [fetchFailed, setFetchFailed] = useState(false);

    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showRemoveModal, setShowRemoveModal] = useState(false);
    const [showMoniesModal, setShowMoniesModal] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showAdminModal, setShowAdminModal] = useState(false);
    const [showJoinPoolModal, setShowJoinPoolModal] = useState(false);
    const [showCreatePlayModal, setShowCreatePlayModal] = useState(false);
    const [showNeedPlayModal, setShowNeedPlayModal] = useState(false);
    const [opErrorCode, setOpErrorCode] = useState(null);

    const [myPlays, setMyPlays] = useState([]);
    const [isCreatingPlay, setIsCreatingPlay] = useState(false);
    const [createPlayError, setCreatePlayError] = useState(null);

    // Code pre-filled from sessionStorage after the invite sign-in flow
    const [prefillCode, setPrefillCode] = useState('');

    // On user sign-in (return from AuthModal redirect), read any stored invite code
    useEffect(() => {
        if (!user) return;
        const code = sessionStorage.getItem('pendingPoolCode');
        if (code) {
            setPrefillCode(code);
            sessionStorage.removeItem('pendingPoolCode');
        }
    }, [user]);

    // Dedicated effect for invite sign-in flow: fire join modal as soon as pool data is ready
    useEffect(() => {
        if (!prefillCode || !user || loading || isMember || isOwner || !poolData) return;
        if (myPlays.length === 0) {
            setShowNeedPlayModal(true);
        } else {
            setShowJoinPoolModal(true);
        }
    }, [prefillCode, user, loading, isMember, isOwner, poolData, myPlays.length]);

    const handleNeedPlayNavigate = () => {
        if (prefillCode) {
            sessionStorage.setItem('pendingPoolCode', prefillCode);
            sessionStorage.setItem('pendingInviteFlow', 'true');
        }
        setShowNeedPlayModal(false);
        navigate(`/brackets/${tournament}`);
    };

    const handleCreatePlayForPool = async (playName) => {
        if (!poolData?.tournament_id) return null;
        setIsCreatingPlay(true);
        setCreatePlayError(null);
        showLoader();
        try {
            const response = await playServices.createPlay(poolData.tournament_id, playName.trim());
            if (response.success) return response.data;
            setCreatePlayError(response.error || 'Failed to create play.');
            return null;
        } catch (err) {
            setCreatePlayError(err.message || 'Failed to create play.');
            return null;
        } finally {
            setIsCreatingPlay(false);
            hideLoader();
        }
    };

    const refreshMyPlays = useCallback(async () => {
        if (!poolData?.tournament_id || !user?.id) return;
        try {
            const data = await playServices.getUserPlays(poolData.tournament_id);
            setMyPlays(data?.data || []);
        } catch {
            setMyPlays([]);
        }
    }, [poolData?.tournament_id, user?.id]);

    const autoModalFired = useRef(false);
    useEffect(() => {
        autoModalFired.current = false;
    }, [poolName, user?.id]);

    useEffect(() => {
        if (autoModalFired.current) return;
        if (loading || showWelcomeModal || !user || isMember || isOwner || !poolData) return;
        autoModalFired.current = true;
        if (myPlays.length === 0) {
            setShowCreatePlayModal(true);
        } else {
            setShowJoinPoolModal(true);
        }
    }, [loading, showWelcomeModal, user, isMember, isOwner, poolData, myPlays.length]);

    const fetchPoolDetail = useCallback(async () => {
        setLoading(true);
        setNotFound(false);
        setFetchFailed(false);
        try {
            const result = await poolServices.getPoolDetailByName(poolName);
            if (result?.success) {
                const { pool, leaderboard, is_owner, is_member, my_plays } = result.data;
                setPoolData(pool);
                setLeaderboard(leaderboard);
                setIsOwner(is_owner);
                setIsMember(is_member);
                setMyPlaysInPool(my_plays);

                if (user?.id && pool.tournament_id) {
                    try {
                        const playsData = await playServices.getUserPlays(pool.tournament_id);
                        setMyPlays(playsData?.data || []);
                    } catch {
                        setMyPlays([]);
                    }
                } else {
                    setMyPlays([]);
                }
            }
        } catch (err) {
            const code = toErrorCode(err);
            if (code === 'not_found') setNotFound(true);
            else setFetchFailed(true);
        } finally {
            setLoading(false);
        }
    }, [poolName]);

    useEffect(() => {
        fetchPoolDetail();
    }, [user, fetchPoolDetail]);

    // --- Invite handlers for unauthenticated users ---
    const handleInviteSignIn = () => {
        if (poolData?.join_code) {
            sessionStorage.setItem('pendingPoolCode', poolData.join_code);
        }
        setShowAuthModal(true);
    };

    const handleInviteGuestPlay = () => {
        if (poolData?.join_code) {
            sessionStorage.setItem('pendingPoolCode', poolData.join_code);
            sessionStorage.setItem('pendingInviteFlow', 'true');
        }
        navigate(`/brackets/${tournament}`);
    };

    const handleLeaderboardClick = (item) => {
        navigate(`/brackets/${tournament}/play/${item.user.id}/${toUrlSlug(item.play_name)}`);
    };

    const leaderboardCols = [
        {
            header: t('poolPage.leaderboard.colPos'),
            width: "7%",
            narrow: true,
            render: (_, idx) => <strong>{idx + 1}</strong>
        },
        {
            header: t('poolPage.leaderboard.colPlayer'),
            width: "10%",
            narrow: true,
            render: (item) => {
                const colorClass = getAvatarColorClass(item.user?.avatar || '');
                return (
                    <div className={`avatar-wrapper ${colorClass}`} data-tooltip={item.user?.username || t('poolPage.leaderboard.anonymous')}>
                        <img src={item.user?.avatar || '/img/profile_icons/gray-simple.webp'} className="player-avatar" alt="avatar" />
                    </div>
                );
            }
        },
        {
            header: t('poolPage.leaderboard.colPlay'),
            width: "42%",
            truncate: true,
            className: "table-link",
            render: (item) => {
                const avatarUrl = item.user?.avatar || '';
                const colors = ['teal', 'green', 'gray', 'yellow', 'red', 'orange', 'pink', 'purple', 'white'];
                const colorMatch = colors.find(c => avatarUrl.includes(c)) || 'gray';
                let colorClass = `inline-${colorMatch}`;
                if (['orange', 'pink', 'purple', 'green', 'white', 'teal'].includes(colorMatch)) colorClass = `inline-neon-${colorMatch}`;
                if (['yellow', 'red'].includes(colorMatch)) colorClass = `inline-real-${colorMatch}`;
                return <span className={`${colorClass} inline-bold table-link`}>{item.play_name}</span>;
            }
        },
        { header: t('poolPage.leaderboard.colGroupPts'), width: "20.5%", render: (item) => (item.group_points ?? 0).toString() },
        { header: t('poolPage.leaderboard.colBracketPts'), width: "20.5%", render: (item) => (item.bracket_points ?? 0).toString() },
    ];

    if (!loading && (notFound || fetchFailed)) return <Navigate to="/404" replace />;

    const showNotLoggedInviteModal = !loading && !user && !!poolData && !showAuthModal;

    const showPrivatePrompt =
        !loading && !!user && !isMember && !isOwner && !!poolData &&
        autoModalFired.current &&
        !showCreatePlayModal && !showJoinPoolModal;

    const memberCount = poolData?.current_member_count ?? leaderboard.length;
    const prizeTotal = (memberCount * parseFloat(poolData?.cost_per_play || 0)).toFixed(2);

    return (
        <main id="pool-page" className="bracket-tournament-play-pool play-pool">

            <PoolPageHelmet
                poolName={poolData?.name || poolName}
                tournamentName={poolData?.tournament_name || cleanTournamentName(tournament)}
                joinCode={poolData?.join_code}
            />

            <section className="play-pool-intro hero-half bg-black">
                <div className="play-pool-intro-wrapper">
                    <div className="text-container">
                        <h1 className="profile-intro">
                            {eventConfig
                                ? <>{eventConfig.title.before}<span className="inline-bold inline-teal">{eventConfig.title.highlight}</span>{eventConfig.title.after}</>
                                : (poolData?.tournament_name || cleanTournamentName(tournament))
                            }
                        </h1>
                        <div className="play-specs">
                            <h2><span className='inline-teal inline-bold'>{t('poolPage.poolLabel')} </span>{poolData?.name || poolName}</h2>
                        </div>
                    </div>
                    <div className="go-back-button-container">
                        <button className="btn btn-tan" onClick={() => navigate(`/brackets/${tournament}`)}>{t('backToArea')}</button>
                    </div>
                </div>
            </section>

            <div className="pool-main-content-wrapper">

                <section id="pool-details" className="pool-main-content">
                    {poolData && (
                        <div className="pool-specs-share">

                            <div className="pool-specs">
                                {isOwner ? (
                                    <h3>{t('poolPage.specs.createdByYou')} <span className="inline-bold inline-neon-pink">{t('poolPage.specs.youLabel')}</span></h3>
                                ) : (
                                    <div className="pool-creator-info">
                                        <h3>{t('poolPage.specs.createdPrefix')} <span className="inline-teal">{t('poolPage.specs.createdBy')} </span><span className="inline-bold">{poolData?.created_by}</span></h3>
                                        <button
                                            className="avatar-link-btn"
                                            style={{ borderBottom: `2px solid ${getAvatarBorderColor(poolData?.created_by_avatar || '')}` }}
                                            data-tooltip={poolData?.created_by}
                                            onClick={() => navigate(`/user/${poolData?.created_by_id}`)}
                                        >
                                            <img src={poolData?.created_by_avatar || '/img/profile_icons/gray-simple.webp'} alt={poolData?.created_by} />
                                        </button>
                                    </div>
                                )}
                                <p className="pool-member-count">
                                    <span className="inline-teal inline-bold">{memberCount}</span>
                                    {' '}{t('poolPage.specs.playsSubmittedLabel', { count: memberCount })}
                                </p>

                                {poolData?.is_money_pool && (
                                    <div className="pool-prize-row">
                                        <p className="pool-prize">
                                            {t('poolPage.specs.prizePot')}: <span className="inline-teal inline-bold">{poolData.currency || '€'}{prizeTotal}</span>
                                        </p>
                                        <button className="prize-eye-btn" onClick={() => setShowMoniesModal(true)}>
                                            <FaEye />
                                        </button>
                                    </div>
                                )}
                                <p className="pool-join-code">{t('poolPage.specs.codeLabel')}: <span className="inline-teal inline-bold">{poolData?.join_code}</span></p>
                                {poolData?.join_code && (
                                    <button
                                        id="invite-friends-modal-trigger"
                                        className="btn btn-tan"
                                        onClick={() => setShowInviteModal(true)}
                                    >
                                        {t('inviteModal.triggerBtn')}
                                    </button>
                                )}
                            </div>

                            <div className="pool-actions">
                                <button
                                    className="btn btn-tan"
                                    onClick={() => myPlays.length === 0 ? setShowCreatePlayModal(true) : setShowJoinPoolModal(true)}
                                    disabled={user && !poolData.allow_multiple_plays_per_user && myPlaysInPool.length >= 1}
                                    title={user && !poolData.allow_multiple_plays_per_user && myPlaysInPool.length >= 1
                                        ? t('poolPage.actions.onePlayLimit')
                                        : undefined}
                                >
                                    {t('poolPage.actions.submitPlay')}
                                </button>
                                {isMember && !isOwner && (
                                    <button className="btn btn-tan" onClick={() => setShowRemoveModal(true)}>
                                        {t('poolPage.actions.removePlay')}
                                    </button>
                                )}
                                {isOwner && (
                                    <button className="btn btn-tan" onClick={() => setShowAdminModal(true)}>
                                        {t('poolPage.actions.editPool')}
                                    </button>
                                )}
                            </div>

                        </div>
                    )}
                </section>

                <section id="pool-leaderboard" className="leaderboard-display-container bg-gray hero-half">
                    <div className="leaderboard-header">
                        <h3>{t('poolPage.leaderboard.title')}</h3>
                    </div>
                    <Leaderboard
                        data={leaderboard}
                        columns={leaderboardCols}
                        isLoading={loading}
                        onRowClick={handleLeaderboardClick}
                        emptyMessage={t('poolPage.leaderboard.emptyMessage')}
                        tableContainerClasses="table-container bg-black backdrop-gray"
                    />
                </section>

                {showPrivatePrompt && (
                    <div className="auth-prompt-overlay">
                        <div className="auth-prompt-message">

                            <div className="top-half auth-prompt-half">
                                <h5>{t('poolPage.privatePrompt.title')}</h5>
                                <div className="double-text">
                                    <p>{t('poolPage.privatePrompt.submitToView')}</p>
                                </div>
                                <div className="prompt-links">
                                    <button
                                        className="btn btn-tan"
                                        onClick={() => myPlays.length === 0 ? setShowCreatePlayModal(true) : setShowJoinPoolModal(true)}
                                    >
                                        {t('poolPage.privatePrompt.submitPlay')}
                                    </button>
                                </div>
                            </div>

                            <div className="section-seperator"></div>

                            <div className="bottom-half auth-prompt-half">
                                <div className="double-text">
                                    <p>{t('poolPage.privatePrompt.notInterested')}</p>
                                </div>
                                <div className="prompt-links">
                                    <button className="btn btn-tan" onClick={() => navigate(`/brackets/${tournament}`)}>
                                        {t('poolPage.privatePrompt.backToTournament')}
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>
                )}
            </div>

            <NotLoggedInviteModal
                isOpen={showNotLoggedInviteModal}
                poolData={poolData}
                poolName={poolName}
                onSignIn={handleInviteSignIn}
                onGuestPlay={handleInviteGuestPlay}
                onClose={() => navigate(`/brackets/${tournament}`)}
            />

            {showNeedPlayModal && ReactDOM.createPortal(
                <div className="modal-overlay">
                    <div className="modal-overlay-content-container pool-invite-modal" onClick={e => e.stopPropagation()}>
                        <button className="close-button" onClick={() => setShowNeedPlayModal(false)}>&times;</button>
                        <div className="modal-gallery">
                            <h2>
                                {t('poolPage.needPlayModal.titlePrefix')}{' '}
                                <span className="inline-teal inline-bold">{t('poolPage.needPlayModal.titleHighlight')}</span>
                            </h2>
                            <p>{t('poolPage.needPlayModal.text')}</p>
                            <button className="btn btn-tan confirm-btn" onClick={handleNeedPlayNavigate}>
                                {t('poolPage.needPlayModal.cta')}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            <PlayCreateNewModal
                isOpen={showCreatePlayModal}
                onConfirm={async (playName) => {
                    const newPlay = await handleCreatePlayForPool(playName);
                    if (newPlay) {
                        await refreshMyPlays();
                        setShowCreatePlayModal(false);
                        setShowJoinPoolModal(true);
                    }
                }}
                onCancel={() => setShowCreatePlayModal(false)}
                isLoading={isCreatingPlay}
                apiError={createPlayError}
            />
            <JoinPoolModal
                isOpen={showJoinPoolModal}
                tournamentId={poolData?.tournament_id}
                plays={myPlays}
                onCancel={() => { setShowJoinPoolModal(false); setPrefillCode(''); }}
                onSuccess={() => { setPrefillCode(''); fetchPoolDetail(); }}
                skipToPrivate
                prefillCode={prefillCode}
            />
            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                redirectTo={`/brackets/${tournament}/pool/${poolName}`}
            />
            <PoolRemovePlayModal
                isOpen={showRemoveModal}
                poolId={poolData?.id}
                leaderboard={leaderboard}
                currentUserId={user?.id}
                onCancel={() => setShowRemoveModal(false)}
                onSuccess={fetchPoolDetail}
            />
            <PoolMoniesModal
                isOpen={showMoniesModal}
                poolData={poolData}
                leaderboard={leaderboard}
                onClose={() => setShowMoniesModal(false)}
            />
            <PoolAdminModal
                isOpen={showAdminModal}
                poolData={poolData}
                leaderboard={leaderboard}
                onClose={() => setShowAdminModal(false)}
                onUpdate={fetchPoolDetail}
            />
            <PoolInviteModal
                isOpen={showInviteModal}
                poolData={poolData}
                inviteUrl={`${window.location.origin}/brackets/${tournament}/pool/${poolName}`}
                onClose={() => setShowInviteModal(false)}
            />
            <ErrorDisplayModal
                isOpen={!!opErrorCode}
                code={opErrorCode}
                onClose={() => setOpErrorCode(null)}
            />

        </main>
    );
};

export default PoolPage;
