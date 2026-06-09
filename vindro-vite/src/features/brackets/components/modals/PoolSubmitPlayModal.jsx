import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useTranslation } from 'react-i18next';
import ShowcaseSection from '../../../../components/ui/ShowcaseSection';
import usePools from '../../hooks/usePools';
import { useLoading } from '../../../../contexts/LoadingContext';

const SubmitPlayToPool = ({ isOpen, type, tournamentId, plays = [], onConfirm, onCancel, initialCode = '', onCreatePlay }) => {
    const { t } = useTranslation('play');
    const { handleJoinPool, isSubmitting, error: apiError } = usePools(tournamentId);
    const { showLoader, hideLoader } = useLoading();

    const [selectedPlayIds, setSelectedPlayIds] = useState([]);
    const [poolCode, setPoolCode] = useState(initialCode);
    const [localError, setLocalError] = useState('');

    useEffect(() => {
        if (initialCode) setPoolCode(initialCode);
    }, [initialCode]);

    // RESET: Clear inputs whenever the modal closes or switches modes
    useEffect(() => {
        if (!isOpen) {
            setSelectedPlayIds([]);
            setPoolCode('');
            setLocalError('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    // 4. SELECTION LOGIC: Toggle play IDs in the array
    const togglePlaySelection = (id) => {
        if (!id) return;
        setSelectedPlayIds(prev =>
            prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
        );
    };

    const handleConfirmSubmission = async () => {
        if (type === 'private' && !poolCode.trim()) {
            setLocalError(t('submitPlayModal.errorNoCode'));
            return;
        }

        setLocalError('');
        showLoader();

        try {
            const response = await handleJoinPool(selectedPlayIds, type, poolCode);

            if (response.success) {
                await hideLoader();
                onConfirm(selectedPlayIds, poolCode, response);
            } else {
                await hideLoader();
                setLocalError(response.error || t('submitPlayModal.errorFailed'));
            }
        } catch (err) {
            await hideLoader();
            setLocalError(err.message || t('submitPlayModal.errorNetwork'));
        }
    };

    const hasNoPlays = !plays || plays.length === 0;
    const activeError = apiError || localError;

    return ReactDOM.createPortal(
        <div className="modal-overlay" onClick={onCancel}>
            <div className="modal-overlay-content-container submit-play-modal" onClick={(e) => e.stopPropagation()}>
                <button className="close-button" onClick={onCancel}>&times;</button>

                <ShowcaseSection id="select-plays-gallery" className="modal-gallery">
                    <h2>{t('submitPlayModal.titlePrefix')}<span className="inline-teal inline-bold">{t('submitPlayModal.titleHighlight')}</span></h2>
                    <div className="">
                        <p>{hasNoPlays ? t('submitPlayModal.noPlays') : t('submitPlayModal.hasPlays')}</p>
                        {hasNoPlays && onCreatePlay && (
                            <button className="btn btn-tan" onClick={onCreatePlay}>
                                {t('submitPlayModal.createFirst')}
                            </button>
                        )}
                    </div>

                    <div className="select-table">
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>{t('submitPlayModal.colName')}</th>
                                        <th style={{ width: '84px' }}>{t('submitPlayModal.colSelect')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {!hasNoPlays && plays.map((play) => (
                                        <tr
                                            key={play.id}
                                            className={selectedPlayIds.includes(play.id) ? 'selected-row' : ''}
                                            onClick={() => togglePlaySelection(play.id)}
                                        >
                                            <td className="play-info-name">{play.name}</td>
                                            <td>
                                                <div className="checkbox-container">
                                                    <div className={`custom-checkbox ${selectedPlayIds.includes(play.id) ? 'checked' : ''}`}>
                                                        {selectedPlayIds.includes(play.id) && <span>✓</span>}
                                                    </div>
                                                </div>
                                            </td>
                                            
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </ShowcaseSection>

                <ShowcaseSection id="submission-actions">
                    {/* PRIVATE CODE UI: Only visible if 'private' was selected in Step 1 */}
                    {type === 'private' && (
                        <div className="private-code-wrapper">
                            <h3>{t('submitPlayModal.privateCodeTitle')}</h3>
                            <input
                                type="text"
                                className={`play-name-input ${activeError && !poolCode ? 'error' : ''}`}
                                placeholder={t('submitPlayModal.privateCodePlaceholder')}
                                value={poolCode}
                                onChange={(e) => setPoolCode(e.target.value.toUpperCase())}
                            />
                        </div>
                    )}

                    {activeError && <p className="error-message">{activeError}</p>}

                    <div className="submit-plays-buttons">
                        <button className="btn btn-tan cancel-btn" onClick={onCancel} disabled={isSubmitting}>
                            {t('submitPlayModal.goBack')}
                        </button>
                        <button
                            className="btn btn-tan confirm-btn"
                            onClick={handleConfirmSubmission}
                            disabled={isSubmitting || selectedPlayIds.length === 0}
                        >
                            {isSubmitting ? t('submitPlayModal.submitting') : t('submitPlayModal.submitBtn', { count: selectedPlayIds.length })}
                        </button>
                    </div>
                </ShowcaseSection>
            </div>
        </div>,
        document.body
    );
};

export default SubmitPlayToPool;