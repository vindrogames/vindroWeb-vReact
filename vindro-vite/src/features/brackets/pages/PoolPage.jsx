import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import NewUserTutorialModal from '../components/modals/new-user-tutorial';
import Leaderboard from '../../../components/ui/Leaderboard';
import poolServices from '../services/poolServices';
import playServices from '../services/playServices';
import PoolPageHelmet from '../../../page-helmets/PoolPageHelmet';

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

    // --- Route (always available — used as fallback before pool data loads) ---
    const { tournament, poolName } = useParams();
    const navigate = useNavigate();

    // --- Auth / Loading ---
    const { user, showWelcomeModal } = useAuth();
    const { showLoader, hideLoader } = useLoading();

    // --- Pool data ---
    const [poolData, setPoolData] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [isOwner, setIsOwner] = useState(false);
    const [isMember, setIsMember] = useState(false);
    const [myPlaysInPool, setMyPlaysInPool] = useState([]);
    const [loading, setLoading] = useState(true);

    // Separate fetch-error states so the intro section always renders
    const [notFound, setNotFound] = useState(false);
    const [fetchFailed, setFetchFailed] = useState(false);

    // --- UI state ---
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showRemoveModal, setShowRemoveModal] = useState(false);
    const [showMoniesModal, setShowMoniesModal] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showAdminModal, setShowAdminModal] = useState(false);
    const [showJoinPoolModal, setShowJoinPoolModal] = useState(false);
    const [showCreatePlayModal, setShowCreatePlayModal] = useState(false);
    const [showTutorialModal, setShowTutorialModal] = useState(false);
    const [opErrorCode, setOpErrorCode] = useState(null); // operational errors only

    // --- All user plays for this tournament (fetched inline with pool data — no separate loading state) ---
    const [myPlays, setMyPlays] = useState([]);
    const [isCreatingPlay, setIsCreatingPlay] = useState(false);
    const [createPlayError, setCreatePlayError] = useState(null);

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

    // Auto-fire the appropriate modal once for logged-in non-members.
    // Uses only `loading` — plays are fetched inline in fetchPoolDetail so no separate race condition.
    const autoModalFired = useRef(false);
    useEffect(() => {
        autoModalFired.current = false;
    }, [poolName, user?.id]);

    useEffect(() => {
        if (autoModalFired.current) return;
        if (loading || showWelcomeModal || !user || isMember || isOwner || notFound || fetchFailed || !poolData) return;
        autoModalFired.current = true;
        setShowTutorialModal(true);
    }, [loading, showWelcomeModal, user, isMember, isOwner, notFound, fetchFailed, poolData, myPlays.length]);

    // --- Data fetching ---
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

                // Fetch all user plays for this tournament inline so `loading` covers both.
                // This prevents the race condition where usePlays hadn't started fetching yet.
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

    // Re-fetch on mount and whenever auth changes (login/logout)
    useEffect(() => {
        fetchPoolDetail();
    }, [user, fetchPoolDetail]);

    // --- Handlers ---
    const handleLeaderboardClick = (item) => {
        navigate(`/brackets/${tournament}/play/${item.user.id}/${toUrlSlug(item.play_name)}`);
    };


    // --- Leaderboard columns ---
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
                const colorClass = getAvatarColorClass(item.user?.avatar || '');
                return (
                    <div className={`avatar-wrapper ${colorClass}`} data-tooltip={item.user?.username || 'Anonymous'}>
                        <img src={item.user?.avatar || '/img/profile_icons/gray-simple.webp'} className="player-avatar" alt="avatar" />
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
                let colorClass = `inline-${colorMatch}`;
                if (['orange', 'pink', 'purple', 'green', 'white', 'teal'].includes(colorMatch)) colorClass = `inline-neon-${colorMatch}`;
                if (['yellow', 'red'].includes(colorMatch)) colorClass = `inline-real-${colorMatch}`;
                return <span className={`${colorClass} inline-bold table-link`}>{item.play_name}</span>;
            }
        },
        { header: "Groups Pts", width: "20.5%", render: (item) => (item.group_points ?? 0).toString() },
        { header: "Bracket Pts", width: "20.5%", render: (item) => (item.bracket_points ?? 0).toString() },
    ];

    // --- Overlay logic ---
    // Only blocks for unauthenticated users and error states — members see the pool directly
    const showOverlay = loading || notFound || fetchFailed || !user;

    // Shown after both auto-fire modals are dismissed without the user joining the pool
    const showPrivatePrompt =
        !loading && !!user && !isMember && !isOwner &&
        !notFound && !fetchFailed && !!poolData &&
        autoModalFired.current &&
        !showTutorialModal && !showCreatePlayModal && !showJoinPoolModal;

    const memberCount = poolData?.current_member_count ?? leaderboard.length;
    const prizeTotal = (memberCount * parseFloat(poolData?.cost_per_play || 0)).toFixed(2);

    // Always render the full page — intro section uses URL params as fallback before data loads
    return (
        <main id="pool-page" className="bracket-tournament-play-pool">

            <PoolPageHelmet
                poolName={poolData?.name || poolName}
                tournamentName={poolData?.tournament_name || cleanTournamentName(tournament)}
                joinCode={poolData?.join_code}
            />

            <section className="play-pool-intro hero-half bg-black">
                <div className="play-pool-intro-wrapper">
                    <div className="text-container">
                        <h1 className="profile-intro">
                            {poolData?.tournament_name || cleanTournamentName(tournament)}
                        </h1>
                        <div className="play-specs">
                            <h2><span className='inline-teal inline-bold'>pool </span>{poolData?.name || poolName}</h2>
                        </div>
                    </div>
                    <div className="go-back-button-container">
                        <button className="btn btn-tan" onClick={() => navigate(`/brackets/${tournament}`)}>Back</button>
                    </div>
                </div>
            </section>

            <div className="pool-main-content-wrapper">

                <section id="pool-details" className="pool-main-content">

                    {poolData && (
                        <div className="pool-specs-share">

                            <div className="pool-specs">
                                {isOwner ? (
                                    <h3>Created by <span className="inline-bold inline-neon-pink">YOU</span></h3>
                                ) : (
                                    <div className="pool-creator-info">
                                        <h3>Created <span className="inline-teal">by </span><span className="inline-bold">{poolData?.created_by}</span></h3>
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
                                    {' '}{memberCount === 1 ? 'play' : 'plays'} submitted
                                </p>
                                
                                {poolData?.is_money_pool && (
                                    <div className="pool-prize-row">
                                        <p className="pool-prize">
                                            Prize Pot: <span className="inline-teal inline-bold">{poolData.currency || '€'}{prizeTotal}</span>
                                        </p>
                                        <button className="prize-eye-btn" onClick={() => setShowMoniesModal(true)}>
                                            <FaEye />
                                        </button>
                                    </div>
                                )}
                                <p className="pool-join-code">Code: <span className="inline-teal inline-bold">{poolData?.join_code}</span></p>
                                {poolData?.join_code && (
                                    <button
                                    id="invite-friends-modal-trigger"
                                        className="btn btn-tan"
                                        onClick={() => setShowInviteModal(true)}
                                    >
                                        Invite Friends
                                    </button>
                                )}
                            </div>

                            <div className="pool-actions">
                                <button
                                    className="btn btn-tan"
                                    onClick={() => myPlays.length === 0 ? setShowCreatePlayModal(true) : setShowJoinPoolModal(true)}
                                    disabled={user && !poolData.allow_multiple_plays_per_user && myPlaysInPool.length >= 1}
                                    title={user && !poolData.allow_multiple_plays_per_user && myPlaysInPool.length >= 1
                                        ? 'This pool only allows one play per member'
                                        : undefined}
                                >
                                    Submit a Play
                                </button>
                                {isMember && !isOwner && (
                                    <button className="btn btn-tan" onClick={() => setShowRemoveModal(true)}>
                                        Remove Play
                                    </button>
                                )}
                                {isOwner && (
                                    <button className="btn btn-tan" onClick={() => setShowAdminModal(true)}>
                                        Edit Pool
                                    </button>
                                )}
                            </div>

                        </div>
                    )}
                </section>

                <section id="pool-leaderboard" className="leaderboard-display-container bg-gray hero-half">

                    <div className="leaderboard-header">
                        <h3>Leaderboard</h3>
                    </div>

                    <Leaderboard
                        data={leaderboard}
                        columns={leaderboardCols}
                        isLoading={loading}
                        onRowClick={handleLeaderboardClick}
                        emptyMessage="No plays submitted yet."
                        tableContainerClasses="table-container bg-black backdrop-gray"
                    />
                </section>

                <div>
                    {showOverlay && !loading && (
                        <div className="auth-prompt-overlay">
                            {notFound || fetchFailed ? (
                                <div className="auth-prompt-message">
                                    <h5>{notFound ? 'This pool does not exist.' : 'Could not load pool.'}</h5>
                                    <div className="prompt-links">
                                        <button className="btn btn-tan" onClick={() => navigate(`/brackets/${tournament}`)}>
                                            Back to Tournament
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="auth-prompt-overlay">
                                    <div className="auth-prompt-message">

                                        <div className="top-half auth-prompt-half">
                                            <h5>To see this Pool you must be logged in.</h5>
                                            <div className="prompt-links">
                                                <button className="btn btn-tan" onClick={() => setShowAuthModal(true)}>Log In</button>
                                            </div>
                                        </div>

                                        <div className="section-seperator"></div>

                                        <div className="bottom-half auth-prompt-half">
                                            <div className="double-text">
                                                <h5>First Time?</h5>
                                                <p>Check out how it works and come back later.</p>
                                            </div>
                                            <div className="prompt-links">
                                                <button className="btn btn-tan" onClick={() => navigate(`/brackets/${tournament}`)}>
                                                    About the Tournament
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {showPrivatePrompt && (
                        <div className="auth-prompt-overlay">
                            <div className="auth-prompt-message">

                                <div className="top-half auth-prompt-half">
                                    <h5>This is a private pool.</h5>
                                    <div className="double-text">
                                        <p>Submit a play to view the leaderboard.</p>
                                    </div>
                                    <div className="prompt-links">
                                        <button
                                            className="btn btn-tan"
                                            onClick={() => myPlays.length === 0 ? setShowCreatePlayModal(true) : setShowJoinPoolModal(true)}
                                        >
                                            Submit a Play
                                        </button>
                                    </div>
                                </div>

                                <div className="section-seperator"></div>

                                <div className="bottom-half auth-prompt-half">
                                    <div className="double-text">
                                        <p>Not interested? Go back to the tournament.</p>
                                    </div>
                                    <div className="prompt-links">
                                        <button className="btn btn-tan" onClick={() => navigate(`/brackets/${tournament}`)}>
                                            Back to Tournament
                                        </button>
                                    </div>
                                </div>

                            </div>
                        </div>
                    )}
                </div>
            </div>

            <NewUserTutorialModal
                isOpen={showTutorialModal}
                onComplete={() => {
                    setShowTutorialModal(false);
                    if (myPlays.length === 0) {
                        setShowCreatePlayModal(true);
                    } else {
                        setShowJoinPoolModal(true);
                    }
                }}
                onSkip={() => setShowTutorialModal(false)}
            />
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
                onCancel={() => setShowJoinPoolModal(false)}
                onSuccess={() => fetchPoolDetail()}
                skipToPrivate
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
