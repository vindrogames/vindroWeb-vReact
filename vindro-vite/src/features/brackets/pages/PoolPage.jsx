import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/auth/AuthContext';
import { useLoading } from '../../../contexts/LoadingContext';
import AuthModal from '../../../components/ui/AuthModal';
import poolServices from '../services/poolServices';

const PoolPage = () => {
    const { tournament, poolName } = useParams();
    const { state } = useLocation();
    const poolId = state?.poolId;
    const navigate = useNavigate();
    const { user } = useAuth();
    const { showLoader, hideLoader } = useLoading();

    const [poolData, setPoolData] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [isOwner, setIsOwner] = useState(false);
    const [isMember, setIsMember] = useState(false);
    const [myPlays, setMyPlays] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedPlays, setSelectedPlays] = useState(new Set());
    const [showAuthModal, setShowAuthModal] = useState(false);

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
            console.error('Failed to fetch pool:', err);
        } finally {
            setLoading(false);
        }
    }, [poolId]);

    useEffect(() => {
        if (user) fetchPoolDetail();
    }, [user, fetchPoolDetail]);

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
        } finally {
            hideLoader();
        }
    };

    const handleToggleSelect = (playId) => {
        setSelectedPlays(prev => {
            const next = new Set(prev);
            next.has(playId) ? next.delete(playId) : next.add(playId);
            return next;
        });
    };

    const handleRemoveSelected = async () => {
        if (selectedPlays.size === 0) return;
        showLoader();
        try {
            await Promise.all(
                [...selectedPlays].map(playId => poolServices.removePlayFromPool(poolId, playId))
            );
            setSelectedPlays(new Set());
            await fetchPoolDetail();
        } finally {
            hideLoader();
        }
    };

    return (
        <main id="pool-page">

            {!user && (
                <div className="pool-page-auth-overlay">
                    <div className="pool-page-auth-prompt">
                        <h2>Log in to view this pool</h2>
                        <button className="btn btn-teal" onClick={() => setShowAuthModal(true)}>
                            Log in
                        </button>
                    </div>
                    <AuthModal
                        isOpen={showAuthModal}
                        onClose={() => setShowAuthModal(false)}
                        redirectTo={`/brackets/${tournament}/pool/${poolName}`}
                    />
                </div>
            )}

            {user && (
                <div className="pool-page-container">

                    <section className="header-container">
                        <div className="text-container">
                            <h1 className="profile-intro">{poolData?.name || '...'}</h1>
                            <div className="play-specs">
                                {isOwner ? (
                                    <>
                                        <h2>Created by <span className="inline-bold inline-pink">YOU</span></h2>
                                    </>
                                ) : (
                                    <>
                                        <h2>Created <span className="inline-teal">by</span> <span className="inline-bold">{poolData?.created_by}</span></h2>
                                        <button className="avatar-link-btn" onClick={() => navigate(`/user/${poolData?.created_by_id}`)}>
                                            <img src={poolData?.created_by_avatar} alt={poolData?.created_by} />
                                        </button>
                                    </>
                                )}
                            </div>
                            {poolData?.is_money_pool && (
                                <p className="pool-prize-info inline-teal">
                                    Entry fee: €{poolData.cost_per_play}
                                </p>
                            )}
                        </div>

                        <div className="go-back-button-container">
                            <button
                                className="btn btn-tan"
                                onClick={() => navigate(`/brackets/${tournament}`)}
                            >
                                Back
                            </button>

                            {isMember && !isOwner && (
                                <button className="btn btn-gray" onClick={handleLeavePool}>
                                    Leave pool
                                </button>
                            )}

                            {isOwner && selectedPlays.size > 0 && (
                                <button className="btn btn-teal" onClick={handleRemoveSelected}>
                                    Remove selected ({selectedPlays.size})
                                </button>
                            )}
                        </div>
                    </section>

                    <section className="pool-leaderboard">
                        <h3>pool<span className="inline-teal inline-bold">Standings</span></h3>

                        {loading ? (
                            <p>Loading...</p>
                        ) : leaderboard.length === 0 ? (
                            <p>No entries yet.</p>
                        ) : (
                            <table className="pool-standings-table">
                                <thead>
                                    <tr>
                                        {isOwner && <th></th>}
                                        <th>Pos.</th>
                                        <th>Player</th>
                                        <th>Play</th>
                                        <th>Group</th>
                                        <th>Bracket</th>
                                        <th>Total</th>
                                        {poolData?.is_money_pool && <th>Paid</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {leaderboard.map((item, idx) => (
                                        <tr key={item.play_id}>
                                            {isOwner && (
                                                <td>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedPlays.has(item.play_id)}
                                                        onChange={() => handleToggleSelect(item.play_id)}
                                                    />
                                                </td>
                                            )}
                                            <td><strong>{idx + 1}</strong></td>
                                            <td className="player-cell">
                                                <img
                                                    src={item.user.avatar}
                                                    alt={item.user.username}
                                                    className="player-avatar"
                                                />
                                                <span>{item.user.username}</span>
                                            </td>
                                            <td
                                                className="play-name-cell clickable"
                                                onClick={() => handleLeaderboardClick(item)}
                                            >
                                                {item.play_name}
                                            </td>
                                            <td>{item.group_points}</td>
                                            <td>{item.bracket_points}</td>
                                            <td><strong>{item.total_points}</strong></td>
                                            {poolData?.is_money_pool && (
                                                <td>{item.has_paid ? '✓' : '—'}</td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </section>

                </div>
            )}

        </main>
    );
};

export default PoolPage;
