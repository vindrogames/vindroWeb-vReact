import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import ShowcaseSection from '../../../../components/ui/ShowcaseSection';
import usePools from '../../hooks/usePools';
import { useLoading } from '../../../../contexts/LoadingContext';

const PoolCreateNewModal = ({ isOpen, tournamentId, tournamentSlug, onCreated, onCancel }) => {
    const { handleCreatePool, isSubmitting } = usePools(tournamentId);
    const { showLoader, hideLoader } = useLoading();
    const navigate = useNavigate();

    const [poolName, setPoolName] = useState('');
    const [isMoneyPool, setIsMoneyPool] = useState(false);
    const [costPerPlay, setCostPerPlay] = useState('');
    const [allowMultiplePlays, setAllowMultiplePlays] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isOpen) {
            setPoolName('');
            setIsMoneyPool(false);
            setCostPerPlay('');
            setAllowMultiplePlays(true);
            setError('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!poolName.trim()) {
            setError('Pool name is required.');
            return;
        }
        if (isMoneyPool && (!costPerPlay || parseFloat(costPerPlay) <= 0)) {
            setError('Enter a valid cost per play greater than 0.');
            return;
        }
        setError('');
        showLoader();

        try {
            const result = await handleCreatePool({
                name: poolName.trim(),
                is_money_pool: isMoneyPool,
                cost_per_play: isMoneyPool ? parseFloat(costPerPlay) : 0,
                allow_multiple_plays_per_user: allowMultiplePlays,
            });

            if (result.success) {
                await hideLoader();
                if (onCreated) onCreated(result.data);
                navigate(`/brackets/${tournamentSlug}/pool/${encodeURIComponent(result.data.name)}`);
            } else {
                await hideLoader();
                setError(result.error || 'Failed to create pool.');
            }
        } catch (err) {
            await hideLoader();
            setError(err.message || 'A network error occurred.');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !isSubmitting) handleSubmit();
        if (e.key === 'Escape') onCancel();
    };

    return ReactDOM.createPortal(
        <div className="modal-overlay" onClick={onCancel}>
            <div className="modal-overlay-content-container" onClick={(e) => e.stopPropagation()}>
                <button className="close-button" onClick={onCancel}>&times;</button>

                <ShowcaseSection id="create-pool-gallery" className="modal-gallery">
                    <h2>create<span className="inline-teal inline-bold">Pool</span></h2>

                    <input
                        type="text"
                        className={`play-name-input ${error && !poolName.trim() ? 'error' : ''}`}
                        placeholder="Pool name"
                        maxLength={28}
                        value={poolName}
                        onChange={(e) => {
                            setPoolName(e.target.value);
                            if (error) setError('');
                        }}
                        onKeyDown={handleKeyDown}
                        autoFocus
                        disabled={isSubmitting}
                    />

                    <div className="char-count-container">
                        <span className="character-count">{poolName.length} / 28</span>
                    </div>

                    <div className="permit-multi-play">
                        <label className="pool-option-label">
                            <div
                                className={`custom-checkbox ${allowMultiplePlays ? 'checked' : ''}`}
                                onClick={() => setAllowMultiplePlays(p => !p)}
                            >
                                {allowMultiplePlays && <span>✓</span>}
                            </div>
                            <span>Allow multiple plays per player</span>
                        </label>
                    </div>

                    <div className="is-money-container">
                        <label className="pool-option-label">
                            <div
                                className={`custom-checkbox ${isMoneyPool ? 'checked' : ''}`}
                                onClick={() => {
                                    setIsMoneyPool(p => !p);
                                    if (isMoneyPool) setCostPerPlay('');
                                    if (error) setError('');
                                }}
                            >
                                {isMoneyPool && <span>✓</span>}
                            </div>
                            <span>Money pool</span>
                        </label>

                        <div className={`cost-per-play-wrapper ${!isMoneyPool ? 'inactive' : ''}`}>
                            <span className="currency-symbol">€</span>
                            <input
                                type="number"
                                className={`cost-input ${error && isMoneyPool && !costPerPlay ? 'error' : ''}`}
                                placeholder="0.00"
                                min="0.01"
                                step="0.01"
                                value={costPerPlay}
                                onChange={(e) => {
                                    setCostPerPlay(e.target.value);
                                    if (error) setError('');
                                }}
                                disabled={!isMoneyPool || isSubmitting}
                            />
                            <span className="cost-label">per play</span>
                        </div>
                    </div>

                    <p className={`error-message${error ? ' visible' : ''}`}>
                        {error || ' '}
                    </p>

                    <div className="submit-button-container">
                        <button
                            className="btn btn-tan confirm-btn"
                            onClick={handleSubmit}
                            disabled={isSubmitting || !poolName.trim()}
                        >
                            {isSubmitting ? 'Creating...' : 'Create Pool'}
                        </button>
                    </div>
                </ShowcaseSection>

                <ShowcaseSection id="create-pool-info" className="bottom-modal-gallery">
                    <div className="bottom-modal-header">
                        <h3>Private Pool</h3>
                    </div>
                    <div className="bottom-modal-text">
                        <p>Your pool will be <em>private</em>. Only players with your code can join.</p>
                    </div>
                    <button className="btn btn-tan cancel-btn" onClick={onCancel} disabled={isSubmitting}>
                        Cancel
                    </button>
                </ShowcaseSection>
            </div>
        </div>,
        document.body
    );
};

export default PoolCreateNewModal;
