import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaEye } from 'react-icons/fa';
import { useAuth } from '../../../contexts/auth/AuthContext';
import { useLoading } from '../../../contexts/LoadingContext';
import AuthModal from '../../../components/ui/AuthModal';
import ErrorDisplayModal from '../../../components/ui/ErrorDisplayModal';
import EditPoolMembersModal from '../components/modals/EditPoolMembersModal';
import Leaderboard from '../../../components/ui/Leaderboard';
import poolServices from '../services/poolServices';
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
    const { user } = useAuth();
    const { showLoader, hideLoader } = useLoading();

    // --- Pool data ---
    const [poolData, setPoolData] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [isOwner, setIsOwner] = useState(false);
    const [isMember, setIsMember] = useState(false);
    const [myPlays, setMyPlays] = useState([]);
    const [loading, setLoading] = useState(true);

    // Separate fetch-error states so the intro section always renders
    const [notFound, setNotFound] = useState(false);
    const [fetchFailed, setFetchFailed] = useState(false);

    // --- UI state ---
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showRemoveModal, setShowRemoveModal] = useState(false);
    const [copied, setCopied] = useState(false);
    const [opErrorCode, setOpErrorCode] = useState(null); // operational errors only

    // --- Data fetching ---
    const fetchPoolDetail = useCallback(async () => {
        setLoading(true);
        setNotFound(false);
        setFetchFailed(false);
        try {
            // OPTION 2: fetch by pool name (shareable URL, auth optional)
            const result = await poolServices.getPoolDetailByName(poolName);
            if (result?.success) {
                const { pool, leaderboard, is_owner, is_member, my_plays } = result.data;
                setPoolData(pool);
                setLeaderboard(leaderboard);
                setIsOwner(is_owner);
                setIsMember(is_member);
                setMyPlays(my_plays);
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
        navigate(`/brackets/${tournament}/play/${item.user.id}/${encodeURIComponent(item.play_name)}`);
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
    // Show whenever: still loading initial data, pool not found, not logged in, or logged in but not a member
    const showOverlay = loading || notFound || fetchFailed || !user || (!isMember && !isOwner);

    const memberCount = poolData?.current_member_count ?? leaderboard.length;
    const prizeTotal = (memberCount * parseFloat(poolData?.cost_per_play || 0)).toFixed(2);

    // Always render the full page — intro section uses URL params as fallback before data loads
    return (
        <main id="pool-page" className="bracket-tournament-play-pool">

            <PoolPageHelmet
                poolName={poolData?.name || poolName}
                tournamentName={poolData?.tournament_name || cleanTournamentName(tournament)}
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
                            <p className="pool-join-code">Code: <span className="inline-teal inline-bold">{poolData?.join_code}</span></p>
                            {poolData?.is_money_pool && (
                                <div className="pool-prize-row">
                                    <p className="pool-prize">
                                        Prize Pot: <span className="inline-teal inline-bold">€{prizeTotal}</span>
                                    </p>
                                    <button className="prize-eye-btn" onClick={() => { /* TODO: open prize modal */ }}>
                                        <FaEye />
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="pool-actions">
                            <button
                                className="btn btn-tan"
                                onClick={() => navigate(`/brackets/${tournament}?pool=${poolData.join_code}`)}
                                disabled={user && !poolData.allow_multiple_plays_per_user && myPlays.length >= 1}
                                title={user && !poolData.allow_multiple_plays_per_user && myPlays.length >= 1
                                    ? 'This pool only allows one play per member'
                                    : undefined}
                            >
                                Submit a Play
                            </button>
                            {(isMember || isOwner) && (
                                <button className="btn btn-gray" onClick={() => setShowRemoveModal(true)}>
                                    Remove Play
                                </button>
                            )}
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
                )}
            </section>

            <section id="pool-leaderboard" className="leaderboard-display-container bg-gray hero-half">

                <div className="leaderboard-header">
                    <h3>pool<span className="inline-teal inline-bold">Standings</span></h3>
                    {isOwner && (
                        <button className="btn btn-teal edit-pool-btn" onClick={() => setShowEditModal(true)}>
                            Edit Users
                        </button>
                    )}
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
                                        Back to tournament
                                    </button>
                                </div>
                            </div>
                        ) : !user ? (
                            <div className="auth-prompt-message">
                                <div className="auth-promtp-text">
                                    <h5>This is a Private Pool.</h5>
                                <h5>Start by logging in.</h5>
                                </div>
                                
                                <div className="prompt-links">
                                    <button className="btn btn-tan" onClick={() => setShowAuthModal(true)}>Log In</button>
                                </div>
                            </div>
                        ) : (
                            <div className="auth-prompt-message">
                                <h5>Submit a play to view Pool and Standings.</h5>
                                <div className="prompt-links">
                                    <button
                                        className="btn btn-tan"
                                        onClick={() => navigate(`/brackets/${tournament}?pool=${poolData?.join_code}`)}
                                    >
                                        Submit a Play
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                redirectTo={`/brackets/${tournament}/pool/${poolName}`}
            />
            <EditPoolMembersModal
                isOpen={showEditModal}
                poolId={poolData?.id}
                isMoneyPool={poolData?.is_money_pool}
                leaderboard={leaderboard}
                onClose={() => setShowEditModal(false)}
                onUpdate={fetchPoolDetail}
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
