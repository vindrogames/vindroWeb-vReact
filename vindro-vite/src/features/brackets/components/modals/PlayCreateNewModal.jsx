import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useTranslation, Trans } from 'react-i18next';
import ShowcaseSection from '../../../../components/ui/ShowcaseSection';
import { NAME_PATTERN } from '../../../../utils/urlUtils';

const PlayCreateNewModal = ({ isOpen, onConfirm, onCancel, isLoading, apiError }) => {
    const { t } = useTranslation('play');
    const [playName, setPlayName] = useState('');
    const [localError, setLocalError] = useState('');

    useEffect(() => {
        if (!isOpen) {
            setPlayName('');
            setLocalError('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleConfirm = () => {
        const trimmedName = playName.trim();
        if (!trimmedName) {
            setLocalError(t('createModal.errorEmpty'));
            return;
        }
        if (trimmedName.length < 3) {
            setLocalError(t('createModal.errorTooShort'));
            return;
        }
        if (!NAME_PATTERN.test(trimmedName)) {
            setLocalError(t('createModal.errorPattern'));
            return;
        }
        onConfirm(trimmedName);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !isLoading) handleConfirm();
        if (e.key === 'Escape') onCancel();
    };

    const activeError = localError || apiError;

    return ReactDOM.createPortal(
        <div className="modal-overlay" onClick={onCancel}>
            <div className="modal-overlay-content-container" onClick={(e) => e.stopPropagation()}>

                <button
                    className="close-button"
                    onClick={onCancel}
                    aria-label="Close modal"
                    disabled={isLoading}
                >
                    &times;
                </button>

                <ShowcaseSection id="prediction-play-gallery" className="modal-gallery">
                    <h2>{t('createModal.titlePrefix')}<span className='inline-teal inline-bold'>{t('createModal.titleHighlight')}</span></h2>

                    <input
                        type="text"
                        className={`play-name-input ${activeError ? 'error' : ''}`}
                        placeholder={t('createModal.namePlaceholder')}
                        value={playName}
                        onChange={(e) => {
                            setPlayName(e.target.value);
                            if (localError) setLocalError('');
                        }}
                        onKeyDown={handleKeyDown}
                        maxLength={28}
                        autoFocus
                        disabled={isLoading}
                    />

                    <div className="char-count-submit-container">
                        <div className="character-count">
                            {playName.length} / 28
                        </div>
                        <button
                            className="btn btn-tan confirm-btn"
                            onClick={handleConfirm}
                            disabled={!playName.trim() || isLoading}
                        >
                            {isLoading ? t('createModal.creating') : t('createModal.createBtn')}
                        </button>
                    </div>

                    <p className={`error-message${activeError ? ' visible' : ''}`}>
                        {activeError || ' '}
                    </p>
                </ShowcaseSection>

                <ShowcaseSection className="bottom-modal-gallery">
                    <div className="bottom-modal-header">
                        <h3>{t('createModal.sectionTitle')}</h3>
                    </div>
                    <div className="bottom-modal-text">
                        <p>
                            <Trans
                                i18nKey="createModal.hint1"
                                ns="play"
                                components={{ bold: <em><span className='inline-green inline-bold' /></em> }}
                            />
                        </p>
                        <p>{t('createModal.hint2')}</p>
                    </div>
                    <button
                        className="btn btn-tan cancel-btn"
                        onClick={onCancel}
                        disabled={isLoading}
                    >
                        {t('createModal.cancel')}
                    </button>
                </ShowcaseSection>
            </div>
        </div>,
        document.body
    );
};

export default PlayCreateNewModal;
