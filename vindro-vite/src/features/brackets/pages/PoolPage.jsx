import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../contexts/auth/AuthContext';
import { useLoading } from '../../../contexts/LoadingContext';
import AuthModal from '../../../components/ui/AuthModal';
import ErrorDisplayModal from '../../../components/ui/ErrorDisplayModal';
import EditPoolMembersModal from '../components/modals/EditPoolMembersModal';
import Leaderboard from '../../../components/ui/Leaderboard';
import poolServices from '../services/poolServices';
import playServices from '../services/playServices';

const toErrorCode = (err) => {
    const msg = err?.message?.toLowerCase() || '';
    if (msg.includes('403') || msg.includes('permission') || msg.includes('forbidden')) return 'unauthorized';
    if (msg.includes('401') || msg.includes('authentication')) return 'unauthorized';
    if (msg.includes('404') || msg.includes('not found')) return 'not_found';
    return 'server_error';
};

const getAvatarColorClass = (avatarUrl = '') => {
    const colors = ['teal', 'green', 'gray', 'yellow', 'red', 'orange', 'pink', 'purple'];
    const colorMatch = colors.find(c => avatarUrl.includes(c)) || 'gray';
    let colorClass = `inline-${colorMatch}`;
    if (['orange', 'pink', 'purple'].includes(colorMatch)) colorClass = `inline-neon-${colorMatch}`;
    if (['yellow', 'red'].includes(colorMatch)) colorClass = `inline-real-${colorMatch}`;
    return colorClass;
};

const PoolPage = () => {

    // --- Route ---
    const { tournament, poolName } = useParams();
    const { state } = useLocation();
    const [searchParams] = useSearchParams();
    const poolId = state?.poolId || searchParams.get('pool_id');
    const navigate = useNavigate();

    // --- Auth / Loading ---
    const { user } = useAuth();
    const { showLoader, hideLoader } = useLoading();

    // --- Pool data ---
    const [poolData, setPoolData] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [isOwner, setIsOwner] = useState(false);
    const [isMember, setIsMember] = useState(false);
    const [myPlays, setMyPlays] = useState([]);
    const [loading, setLoading] = useState(false);

    // --- UI state ---
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [userPlays, setUserPlays] = useState([]);
    const [isLoadingPlays, setIsLoadingPlays] = useState(false);
    const [submittingPlayId, setSubmittingPlayId] = useState(null);
    const [copied, setCopied] = useState(false);
    const [errorCode, setErrorCode] = useState(null);

    // --- Data fetching ---
    const fetchPoolDetail = useCallback(async () => {
        if (!poolId) return;
        setLoading(true);
        try {
            const result = await poolServices.getPoolDetail(poolId);
            if (result?.success) {
                const { pool, leaderboard, is_owner, is_member, my_plays } = result.data;
                setPoolData(pool);
                setLeaderboard(leaderboard);
                setIsOwner(is_owner);
                setIsMember(is_member);
                setMyPlays(my_plays);
            }
        } catch (err) {
            setErrorCode(toErrorCode(err));
        } finally {
            setLoading(false);
        }
    }, [poolId]);

    useEffect(() => {
        if (user) fetchPoolDetail();
    }, [user, fetchPoolDetail]);

    // --- Handlers ---
    const handleLeaderboardClick = (item) => {
        const playSlug = item.play_name.trim().toLowerCase().replace(/\s+/g, '-');
        navigate(`/brackets/${tournament}/${item.user.id}/${playSlug}?pid=${item.play_id}`, {
            state: { playId: item.play_id }
        });
    };

    const handleLeavePool = async () => {
        showLoader();
        try {
            await poolServices.leavePool(poolId);
            await fetchPoolDetail();
        } catch (err) {
            setErrorCode(toErrorCode(err));
        } finally {
            hideLoader();
        }
    };

    const handleCopyInvite = async () => {
        const url = `${window.location.origin}/brackets/${tournament}?pool=${poolData.join_code}`;
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        } catch {
            const el = document.createElement('input');
            el.value = url;
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        }
    };

    const fetchUserPlays = useCallback(async () => {
        if (!poolData?.tournament_id) return;
        setIsLoadingPlays(true);
        try {
            const result = await playServices.getUserPlays(poolData.tournament_id);
            if (result?.success) setUserPlays(result.data || []);
        } catch {
            // silent — empty state shown
        } finally {
            setIsLoadingPlays(false);
        }
    }, [poolData?.tournament_id]);

    useEffect(() => {
        if (user && !isMember && !isOwner && poolData?.tournament_id) fetchUserPlays();
    }, [user, isMember, isOwner, fetchUserPlays]);

    const handleSubmitPlay = async (playId) => {
        if (!poolData?.tournament_id) return;
        setSubmittingPlayId(playId);
        try {
            const poolType = poolData.is_public ? 'public' : 'private';
            const code = poolData.is_public ? null : poolData.join_code;
            const result = await poolServices.joinPool(poolData.tournament_id, [playId], poolType, code);
            if (result?.success) {
                await fetchPoolDetail();
            } else {
                setErrorCode('server_error');
            }
        } catch (err) {
            setErrorCode(toErrorCode(err));
        } finally {
            setSubmittingPlayId(null);
        }
    };

    // --- Leaderboard columns ---
    const leaderboardColumns = [
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

    // --- Derived state ---
    const showOverlay = !loading && (!user || (!isMember && !isOwner));
    const prizeTotal = (leaderboard.length * parseFloat(poolData?.cost_per_play || 0)).toFixed(2);

    // --- Early returns ---
    if (user && !loading && !poolData) {
        return (
            <main id="pool-page" className="bracket-tournament-play-pool">
                <div className="not-found-container">
                    <h2>pool<span className="inline-teal inline-bold">NotFound</span></h2>
                    <div className="subtitle-container">
                        <p>This pool doesn't exist or has been removed.</p>
                    </div>
                    <button className="btn btn-tan" onClick={() => navigate(`/brackets/${tournament}`)}>
                        Back to tournament
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main id="pool-page" className="bracket-tournament-play-pool">

            <section className="play-pool-intro hero-half bg-black">
                <div className="play-pool-intro-wrapper">
                    <div className="text-container">
                        <h1 className="profile-intro">{poolData?.tournament_name || tournament}</h1>
                        <div className="play-specs">
                            <h2>{poolData?.name || '...'}</h2>
                        </div>
                    </div>
                    <div className="go-back-button-container">
                        <button className="btn btn-tan" onClick={() => navigate(`/brackets/${tournament}`)}>Back</button>
                    </div>
                </div>
            </section>

            <section id="pool-details-leaderboard" className="pool-main-content">

                <div className="pool-specs-share">
                    <div className="pool-specs">
                        {isOwner ? (
                            <h3>Created by <span className="inline-bold inline-neon-pink">YOU</span></h3>
                        ) : (
                            <div className="pool-creator-info">
                                <h3>Created <span className="inline-teal">by</span></h3>
                                <button
                                    className={`avatar-wrapper ${getAvatarColorClass(poolData?.created_by_avatar || '')}`}
                                    data-tooltip={poolData?.created_by}
                                    onClick={() => navigate(`/user/${poolData?.created_by_id}`)}
                                >
                                    <img src={poolData?.created_by_avatar || '/img/profile_icons/gray-simple.webp'} className="player-avatar" alt={poolData?.created_by} />
                                </button>
                                <span className="inline-bold">{poolData?.created_by}</span>
                            </div>
                        )}
                        <p className="pool-join-code">Code: <span className="inline-teal inline-bold">{poolData?.join_code}</span></p>
                        {poolData?.is_money_pool && (
                            <p className="pool-prize">
                                Prize pot: <span className="inline-teal inline-bold">€{prizeTotal}</span>
                                <span className="pool-prize-breakdown"> ({leaderboard.length} × €{poolData?.cost_per_play})</span>
                            </p>
                        )}
                    </div>

                    <div className="pool-share">
                        {poolData?.join_code && (
                            <button
                                className={`btn ${copied ? 'btn-teal' : 'btn-tan'}`}
                                onClick={handleCopyInvite}
                            >
                                {copied ? 'Copied!' : 'Invite Friends'}
                            </button>
                        )}
                    </div>
                </div>

                <div className="pool-leaderboard">
                    <div className="leaderboard-header">
                        <h3>pool<span className="inline-teal inline-bold">Standings</span></h3>
                        <div className="exit-edit-container">
                            {isMember && !isOwner && (
                                <button className="btn btn-gray" onClick={handleLeavePool}>Remove Play</button>
                            )}
                            {isOwner && (
                                <button className="btn btn-teal" onClick={() => setShowEditModal(true)}>Edit Users</button>
                            )}
                        </div>
                    </div>
                    <div className="leaderboard-body">
                        <Leaderboard
                            data={leaderboard}
                            columns={leaderboardColumns}
                            isLoading={loading}
                            onRowClick={handleLeaderboardClick}
                            emptyMessage="No plays submitted yet."
                            tableContainerClasses="table-container bg-black backdrop-gray"
                        />
                    </div>
                </div>

                {showOverlay && (
                    <div className="auth-prompt-overlay">
                        {!user ? (
                            <div className="auth-prompt-message">
                                <h5>To view this pool you must be logged in.</h5>
                                <div className="prompt-links">
                                    <button className="btn btn-tan" onClick={() => setShowAuthModal(true)}>Log In</button>
                                </div>
                            </div>
                        ) : (
                            <div className="auth-prompt-message">
                                <h5>Select a play to join this pool.</h5>
                                {isLoadingPlays ? (
                                    <p>Loading your plays...</p>
                                ) : userPlays.length === 0 ? (
                                    <p>You have no plays for this tournament yet.</p>
                                ) : (
                                    <div className="plays-select-list">
                                        {userPlays.map(play => (
                                            <button
                                                key={play.id}
                                                className="btn btn-tan"
                                                disabled={!!submittingPlayId}
                                                onClick={() => handleSubmitPlay(play.id)}
                                            >
                                                {submittingPlayId === play.id ? 'Joining...' : play.name}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                <div className="prompt-links">
                                    <button className="btn btn-tan" onClick={() => navigate(`/brackets/${tournament}`)}>Go to Tournament</button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

            </section>

            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                redirectTo={`/brackets/${tournament}/pool/${poolName}`}
            />
            <EditPoolMembersModal
                isOpen={showEditModal}
                poolId={poolId}
                isMoneyPool={poolData?.is_money_pool}
                leaderboard={leaderboard}
                onClose={() => setShowEditModal(false)}
                onUpdate={fetchPoolDetail}
            />
            <ErrorDisplayModal
                isOpen={!!errorCode}
                code={errorCode}
                onClose={() => setErrorCode(null)}
            />

        </main>
    );
};

export default PoolPage;
