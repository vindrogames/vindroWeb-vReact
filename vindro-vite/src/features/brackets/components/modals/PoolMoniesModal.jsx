import React from 'react';
import ReactDOM from 'react-dom';
import ShowcaseSection from '../../../../components/ui/ShowcaseSection';

const ORDINALS = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th'];

const PoolMoniesModal = ({ isOpen, poolData, leaderboard = [], onClose }) => {
    if (!isOpen) return null;

    const memberCount = poolData?.current_member_count ?? leaderboard.length;
    const costPerPlay = parseFloat(poolData?.cost_per_play || 0);
    const totalPot = memberCount * costPerPlay;
    const payoutConfig = poolData?.payout_config || {};
    const currency = poolData?.currency || '€';

    const prizeForRank = (rank) => {
        const pct = payoutConfig[String(rank + 1)];
        if (!pct || totalPot <= 0) return '—';
        return `${currency}${((pct / 100) * totalPot).toFixed(2)}`;
    };

    return ReactDOM.createPortal(
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-overlay-content-container pool-monies-modal" onClick={e => e.stopPropagation()}>
                <button className="close-button" onClick={onClose}>&times;</button>

                <ShowcaseSection id="pool-monies-gallery" className="modal-gallery">
                    <h2>pool<span className="inline-neon-pink inline-bold">Monies</span></h2>

                    <div className="monies-summary">
                        <p>Prize Pot: <span className="inline-teal inline-bold">{currency}{totalPot.toFixed(2)}</span></p>
                    </div>

                    <div className="select-table monies-table">
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Pos.</th>
                                        <th>Play Name</th>
                                        <th>Prize</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leaderboard.length === 0 ? (
                                        <tr><td colSpan={3}>No plays submitted yet.</td></tr>
                                    ) : (
                                        leaderboard.map((entry, idx) => (
                                            <tr key={entry.play_id}>
                                                <td className="monies-pos">{ORDINALS[idx] || `${idx + 1}th`}</td>
                                                <td className="play-info-name">
                                                    <div className="member-info">
                                                        <img
                                                            src={entry.user?.avatar || '/img/profile_icons/gray-simple.webp'}
                                                            alt={entry.user?.username}
                                                            className="member-avatar"
                                                        />
                                                        <div className="member-details">
                                                            <span className="member-play-name">{entry.play_name}</span>
                                                            <span className="member-username">{entry.user?.username}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="monies-prize">{prizeForRank(idx)}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {Object.keys(payoutConfig).length === 0 && (
                        <p className="monies-no-config">Payout structure not yet configured.</p>
                    )}
                </ShowcaseSection>
            </div>
        </div>,
        document.body
    );
};

export default PoolMoniesModal;
