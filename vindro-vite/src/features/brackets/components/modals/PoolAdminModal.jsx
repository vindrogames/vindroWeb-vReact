import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import ShowcaseSection from '../../../../components/ui/ShowcaseSection';
import poolServices from '../../services/poolServices';

const ORDINALS = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th'];

const PoolAdminModal = ({ isOpen, poolData, leaderboard = [], onClose, onUpdate }) => {
    const [activeTab, setActiveTab] = useState('plays');

    // Plays tab
    const [selectedPlayIds, setSelectedPlayIds] = useState([]);
    const [isRemoving, setIsRemoving] = useState(false);
    const [removeError, setRemoveError] = useState('');

    // Payouts tab
    const [percs, setPercs] = useState(['']);
    const [isSavingPayouts, setIsSavingPayouts] = useState(false);
    const [payoutsError, setPayoutsError] = useState('');

    // Payments tab
    const [toggling, setToggling] = useState(new Set());
    const [paymentsError, setPaymentsError] = useState('');

    const payoutConfig = poolData?.payout_config || {};
    const costPerPlay = parseFloat(poolData?.cost_per_play || 0);
    const memberCount = poolData?.current_member_count ?? leaderboard.length;
    const totalPot = memberCount * costPerPlay;
    const currency = poolData?.currency || '€';
    const maxPositions = Math.min(leaderboard.length || 1, 10);

    useEffect(() => {
        if (!isOpen) {
            setActiveTab('plays');
            setSelectedPlayIds([]);
            setRemoveError('');
            setPayoutsError('');
            setPaymentsError('');
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen || activeTab !== 'payouts') return;
        const keys = Object.keys(payoutConfig).sort((a, b) => +a - +b);
        setPercs(keys.length > 0 ? keys.map(k => String(payoutConfig[k])) : ['']);
    }, [activeTab, isOpen]);

    if (!isOpen) return null;

    // --- Plays ---
    const togglePlay = (id) =>
        setSelectedPlayIds(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);

    const handleRemovePlays = async () => {
        if (!selectedPlayIds.length) return;
        setIsRemoving(true);
        setRemoveError('');
        try {
            await Promise.all(selectedPlayIds.map(id => poolServices.removePlayFromPool(poolData.id, id)));
            setSelectedPlayIds([]);
            await onUpdate();
        } catch (err) {
            setRemoveError(err.message || 'Failed to remove plays.');
        } finally {
            setIsRemoving(false);
        }
    };

    // --- Payouts ---
    const parsedPercs = percs.map(v => parseInt(v, 10));
    const total = parsedPercs.reduce((s, v) => s + (isNaN(v) ? 0 : v), 0);
    const canSavePayouts = parsedPercs.every(v => !isNaN(v) && v > 0) && total === 100;

    const updatePerc = (idx, val) => {
        if (!/^\d{0,3}$/.test(val)) return;
        setPercs(prev => prev.map((p, i) => i === idx ? val : p));
    };

    const prizeStr = (pct) => {
        const v = parseInt(pct, 10);
        if (isNaN(v) || v <= 0 || totalPot <= 0) return '—';
        return `${currency}${((v / 100) * totalPot).toFixed(2)}`;
    };

    const handleSavePayouts = async () => {
        if (!canSavePayouts) return;
        setIsSavingPayouts(true);
        setPayoutsError('');
        const config = {};
        parsedPercs.forEach((v, i) => { config[String(i + 1)] = v; });
        try {
            await poolServices.updatePayoutConfig(poolData.id, config);
            await onUpdate();
        } catch (err) {
            setPayoutsError(err.message || 'Failed to save payouts.');
        } finally {
            setIsSavingPayouts(false);
        }
    };

    // --- Payments ---
    const paidCount = leaderboard.filter(e => e.has_paid).length;
    const collectedAmount = (paidCount * costPerPlay).toFixed(2);

    const prizeForRank = (idx) => {
        const pct = payoutConfig[String(idx + 1)];
        if (!pct || totalPot <= 0) return '—';
        return `${currency}${((pct / 100) * totalPot).toFixed(2)}`;
    };

    const handleTogglePaid = async (playId) => {
        setToggling(prev => new Set(prev).add(playId));
        setPaymentsError('');
        try {
            await poolServices.togglePaid(poolData.id, playId);
            await onUpdate();
        } catch (err) {
            setPaymentsError(err.message || 'Failed to update paid status.');
        } finally {
            setToggling(prev => { const s = new Set(prev); s.delete(playId); return s; });
        }
    };

    return ReactDOM.createPortal(
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-overlay-content-container pool-admin-modal" onClick={e => e.stopPropagation()}>
                <button className="close-button" onClick={onClose}>&times;</button>

                <ShowcaseSection id="pool-admin-gallery" className="modal-gallery">
                    <h2>edit<span className="inline-teal inline-bold">Pool</span></h2>
                    <div className="admin-tabs">
                        {['plays', 'payouts', 'payments'].map(tab => (
                            <button
                                key={tab}
                                className={`admin-tab ${activeTab === tab ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>
                </ShowcaseSection>

                <ShowcaseSection id="pool-admin-bottom" className="pool-admin-bottom">

                    {activeTab === 'plays' && (
                        <>
                            <div className="select-table">
                                <div className="table-container">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Player</th>
                                                <th>Play</th>
                                                <th style={{ width: '56px' }}>✕</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {leaderboard.length === 0 ? (
                                                <tr><td colSpan={3}>No plays in this pool yet.</td></tr>
                                            ) : leaderboard.map(entry => (
                                                <tr
                                                    key={entry.play_id}
                                                    className={selectedPlayIds.includes(entry.play_id) ? 'selected-row' : ''}
                                                    onClick={() => togglePlay(entry.play_id)}
                                                >
                                                    <td className="play-info-name">
                                                        <div className="member-info">
                                                            <img src={entry.user?.avatar || '/img/profile_icons/gray-simple.webp'} alt={entry.user?.username} className="member-avatar" />
                                                            <span>{entry.user?.username}</span>
                                                        </div>
                                                    </td>
                                                    <td>{entry.play_name}</td>
                                                    <td>
                                                        <div className="checkbox-container">
                                                            <div className={`custom-checkbox ${selectedPlayIds.includes(entry.play_id) ? 'checked' : ''}`}>
                                                                {selectedPlayIds.includes(entry.play_id) && <span>✓</span>}
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            {removeError && <p className="error-message">{removeError}</p>}
                            <div className="admin-tab-actions">
                                <button
                                    className="btn btn-tan"
                                    onClick={handleRemovePlays}
                                    disabled={isRemoving || !selectedPlayIds.length}
                                >
                                    {isRemoving
                                        ? 'Removing...'
                                        : `Remove${selectedPlayIds.length ? ` ${selectedPlayIds.length}` : ''} Play${selectedPlayIds.length !== 1 ? 's' : ''}`}
                                </button>
                            </div>
                        </>
                    )}

                    {activeTab === 'payouts' && (
                        <>
                            <div className="payout-config-list">
                                {percs.map((pct, idx) => (
                                    <div key={idx} className="payout-row">
                                        <span className="payout-ordinal">{ORDINALS[idx]}</span>
                                        <input
                                            type="text"
                                            className="payout-input"
                                            value={pct}
                                            onChange={e => updatePerc(idx, e.target.value)}
                                            placeholder="%"
                                        />
                                        <span className="payout-preview">{prizeStr(pct)}</span>
                                        {idx === percs.length - 1 && (
                                            <button className="payout-remove-btn" onClick={() => setPercs(prev => prev.slice(0, idx))}>×</button>
                                        )}
                                    </div>
                                ))}
                                {percs.length < maxPositions && (
                                    <button className="btn btn-tan add-position-btn" onClick={() => setPercs(prev => [...prev, ''])}>
                                        + {ORDINALS[percs.length]} place
                                    </button>
                                )}
                            </div>
                            <div className={`payout-total ${total === 100 ? 'valid' : total > 100 ? 'over' : ''}`}>
                                {total}% {total === 100 ? '✓' : total > 100 ? '— over 100%' : `— ${100 - total}% remaining`}
                            </div>
                            {payoutsError && <p className="error-message">{payoutsError}</p>}
                            <div className="admin-tab-actions">
                                <button className="btn btn-tan" onClick={handleSavePayouts} disabled={isSavingPayouts || !canSavePayouts}>
                                    {isSavingPayouts ? 'Saving...' : 'Save Payouts'}
                                </button>
                            </div>
                        </>
                    )}

                    {activeTab === 'payments' && (
                        <>
                            <div className="monies-summary">
                                <p>Pot: <span className="inline-teal inline-bold">{currency}{totalPot.toFixed(2)}</span></p>
                                <p>Collected: <span className="inline-teal inline-bold">{currency}{collectedAmount}</span>
                                    <span className="monies-paid-count"> ({paidCount}/{memberCount})</span>
                                </p>
                            </div>
                            <div className="select-table monies-table">
                                <div className="table-container">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Pos.</th>
                                                <th>Play</th>
                                                <th>Prize</th>
                                                <th>Paid</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {leaderboard.length === 0 ? (
                                                <tr><td colSpan={4}>No plays yet.</td></tr>
                                            ) : leaderboard.map((entry, idx) => (
                                                <tr key={entry.play_id}>
                                                    <td>{ORDINALS[idx] || `${idx + 1}th`}</td>
                                                    <td className="play-info-name">
                                                        <div className="member-info">
                                                            <img src={entry.user?.avatar || '/img/profile_icons/gray-simple.webp'} alt={entry.user?.username} className="member-avatar" />
                                                            <div className="member-details">
                                                                <span className="member-play-name">{entry.play_name}</span>
                                                                <span className="member-username">{entry.user?.username}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>{prizeForRank(idx)}</td>
                                                    <td>
                                                        <button
                                                            className={`btn paid-toggle ${entry.has_paid ? 'btn-teal' : 'btn-gray'}`}
                                                            onClick={() => handleTogglePaid(entry.play_id)}
                                                            disabled={toggling.has(entry.play_id)}
                                                        >
                                                            {toggling.has(entry.play_id) ? '...' : entry.has_paid ? 'Paid ✓' : 'Unpaid'}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            {paymentsError && <p className="error-message">{paymentsError}</p>}
                        </>
                    )}

                </ShowcaseSection>
            </div>
        </div>,
        document.body
    );
};

export default PoolAdminModal;
