import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import ShowcaseSection from '../../../../components/ui/ShowcaseSection';
import usePools from '../../hooks/usePools';
import { useLoading } from '../../../../contexts/LoadingContext';
import { toUrlSlug, NAME_PATTERN } from '../../../../utils/urlUtils';

const PoolCreateNewModal = ({ isOpen, tournamentId, tournamentSlug, onCreated, onCancel }) => {
    const { t } = useTranslation('play');
    const { handleCreatePool, isSubmitting } = usePools(tournamentId);
    const { showLoader, hideLoader } = useLoading();
    const navigate = useNavigate();

    const [poolName, setPoolName] = useState('');
    const [isMoneyPool, setIsMoneyPool] = useState(false);
    const [costPerPlay, setCostPerPlay] = useState('');
    const [currency, setCurrency] = useState('€');
    const [allowMultiplePlays, setAllowMultiplePlays] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isOpen) {
            setPoolName('');
            setIsMoneyPool(false);
            setCostPerPlay('');
            setCurrency('€');
            setAllowMultiplePlays(true);
            setError('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!poolName.trim()) {
            setError(t('createPoolModal.errorRequired'));
            return;
        }
        if (!NAME_PATTERN.test(poolName.trim())) {
            setError(t('createPoolModal.errorPattern'));
            return;
        }
        if (isMoneyPool && (!costPerPlay || parseFloat(costPerPlay) <= 0)) {
            setError(t('createPoolModal.errorCost'));
            return;
        }
        setError('');
        showLoader();

        try {
            const result = await handleCreatePool({
                name: poolName.trim(),
                is_money_pool: isMoneyPool,
                cost_per_play: isMoneyPool ? parseFloat(costPerPlay) : 0,
                currency: isMoneyPool ? currency : '€',
                allow_multiple_plays_per_user: allowMultiplePlays,
            });

            if (result.success) {
                await hideLoader();
                if (onCreated) onCreated(result.data);
                navigate(`/brackets/${tournamentSlug}/pool/${toUrlSlug(result.data.name)}`);
            } else {
                await hideLoader();
                setError(result.error || t('createPoolModal.errorFailed'));
            }
        } catch (err) {
            await hideLoader();
            setError(err.message || t('createPoolModal.errorNetwork'));
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
                    <h2>{t('createPoolModal.titlePrefix')}<span className="inline-teal inline-bold">{t('createPoolModal.titleHighlight')}</span></h2>

                    <input
                        type="text"
                        className={`play-name-input ${error && !poolName.trim() ? 'error' : ''}`}
                        placeholder={t('createPoolModal.namePlaceholder')}
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
                            <span>{t('createPoolModal.allowMultiple')}</span>
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
                            <span>{t('createPoolModal.moneyPool')}</span>
                        </label>

                        <div className={`cost-per-play-wrapper ${!isMoneyPool ? 'inactive' : ''}`}>
                            <select
                                className="currency-select"
                                value={currency}
                                onChange={e => setCurrency(e.target.value)}
                                disabled={!isMoneyPool || isSubmitting}
                            >
                                <option value="€">€</option>
                                <option value="$">$</option>
                                <option value="£">£</option>
                                <option value="¥">¥</option>
                                <option value="₹">₹</option>
                            </select>
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
                            <span className="cost-label">{t('createPoolModal.costLabel')}</span>
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
                            {isSubmitting ? t('createPoolModal.creating') : t('createPoolModal.createBtn')}
                        </button>
                    </div>
                </ShowcaseSection>

                <ShowcaseSection id="create-pool-info" className="bottom-modal-gallery">
                    <div className="bottom-modal-header">
                        <h3>{t('createPoolModal.infoTitle')}</h3>
                    </div>
                    <div className="bottom-modal-text">
                        <p>
                            <Trans
                                i18nKey="createPoolModal.infoText1"
                                ns="play"
                                components={{ code: <span className="inline-teal inline-bold" /> }}
                            />
                        </p>
                        <p>{t('createPoolModal.infoText2')}</p>
                    </div>
                    <button className="btn btn-tan cancel-btn" onClick={onCancel} disabled={isSubmitting}>
                        {t('createPoolModal.cancel')}
                    </button>
                </ShowcaseSection>
            </div>
        </div>,
        document.body
    );
};

export default PoolCreateNewModal;
