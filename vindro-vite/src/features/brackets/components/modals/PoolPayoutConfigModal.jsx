import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import ShowcaseSection from '../../../../components/ui/ShowcaseSection';
import poolServices from '../../services/poolServices';

const ORDINALS = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th'];

const PoolPayoutConfigModal = ({ isOpen, poolId, totalPot, currency = '€', maxPositions, currentConfig, onClose, onSaved }) => {
    // percs[i] = percentage string for position i+1
    const [percs, setPercs] = useState(['']);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isOpen) return;
        const keys = Object.keys(currentConfig || {}).sort((a, b) => +a - +b);
        if (keys.length > 0) {
            setPercs(keys.map(k => String(currentConfig[k])));
        } else {
            setPercs(['']);
        }
        setError('');
    }, [isOpen]);

    if (!isOpen) return null;

    const parsedPercs = percs.map(v => parseInt(v, 10));
    const total = parsedPercs.reduce((s, v) => s + (isNaN(v) ? 0 : v), 0);
    const allValid = parsedPercs.every(v => !isNaN(v) && v > 0);
    const canSave = allValid && total === 100;

    const updatePerc = (idx, val) => {
        // only allow digits, max 3 chars
        if (!/^\d{0,3}$/.test(val)) return;
        setPercs(prev => prev.map((p, i) => i === idx ? val : p));
    };

    const addPosition = () => {
        if (percs.length >= maxPositions) return;
        setPercs(prev => [...prev, '']);
    };

    const removePosition = (idx) => {
        // removing idx also removes all after it
        setPercs(prev => prev.slice(0, idx));
    };

    const handleSave = async () => {
        if (!canSave) return;
        setIsSubmitting(true);
        setError('');
        const config = {};
        parsedPercs.forEach((v, i) => { config[String(i + 1)] = v; });
        try {
            await poolServices.updatePayoutConfig(poolId, config);
            onSaved();
            onClose();
        } catch (err) {
            setError(err.message || 'Failed to save payout config.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const prizeStr = (pct) => {
        const v = parseInt(pct, 10);
        if (isNaN(v) || v <= 0 || totalPot <= 0) return '—';
        return `${currency}${((v / 100) * totalPot).toFixed(2)}`;
    };

    return ReactDOM.createPortal(
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-overlay-content-container" onClick={e => e.stopPropagation()}>
                <button className="close-button" onClick={onClose} disabled={isSubmitting}>&times;</button>

                <ShowcaseSection id="payout-config-gallery" className="modal-gallery">
                    <h2>payout<span className="inline-neon-pink inline-bold">Config</span></h2>

                    <div className="payout-config-list">
                        {percs.map((pct, idx) => (
                            <div key={idx} className="payout-config-row">
                                <span className="payout-position-label">{ORDINALS[idx] || `${idx + 1}th`}</span>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    className="payout-pct-input"
                                    value={pct}
                                    onChange={e => updatePerc(idx, e.target.value)}
                                    placeholder="%"
                                    disabled={isSubmitting}
                                />
                                <span className="payout-pct-symbol">%</span>
                                <span className="payout-prize-preview">{prizeStr(pct)}</span>
                                {idx > 0 && (
                                    <button
                                        className="btn btn-gray payout-remove-btn"
                                        onClick={() => removePosition(idx)}
                                        disabled={isSubmitting}
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {percs.length < maxPositions && (
                        <button
                            className="btn btn-gray payout-add-btn"
                            onClick={addPosition}
                            disabled={isSubmitting}
                        >
                            + Add {ORDINALS[percs.length] || `${percs.length + 1}th`} place
                        </button>
                    )}

                    <div className={`payout-total ${total === 100 ? 'valid' : total > 100 ? 'over' : ''}`}>
                        Total: <strong>{total}</strong> / 100%
                    </div>

                    {error && <p className="error-message">{error}</p>}
                </ShowcaseSection>

                <ShowcaseSection id="payout-config-actions" className="bottom-modal-gallery">
                    <div className="submit-plays-buttons">
                        <button className="btn btn-gray cancel-btn" onClick={onClose} disabled={isSubmitting}>
                            Cancel
                        </button>
                        <button
                            className="btn btn-tan confirm-btn"
                            onClick={handleSave}
                            disabled={!canSave || isSubmitting}
                        >
                            {isSubmitting ? 'Saving...' : 'Save Payouts'}
                        </button>
                    </div>
                </ShowcaseSection>
            </div>
        </div>,
        document.body
    );
};

export default PoolPayoutConfigModal;
