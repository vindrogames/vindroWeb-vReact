import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useTranslation, Trans } from 'react-i18next';
import ShowcaseSection from '../../../../components/ui/ShowcaseSection';
import { NAME_PATTERN } from '../../../../utils/urlUtils';

const ExistingUserInviteModal = ({ poolName, onJoinWithNew, onCancel, isLoading }) => {
    const { t } = useTranslation('play');
    const hasPoolContext = !!poolName;

    const [newPlayName, setNewPlayName] = useState('');
    const [localError, setLocalError] = useState('');

    const handleNewSubmit = () => {
        const trimmed = newPlayName.trim();
        if (!trimmed) { setLocalError(t('createModal.errorEmpty')); return; }
        if (trimmed.length < 3) { setLocalError(t('createModal.errorTooShort')); return; }
        if (!NAME_PATTERN.test(trimmed)) { setLocalError(t('createModal.errorPattern')); return; }
        onJoinWithNew(trimmed);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !isLoading) handleNewSubmit();
        if (e.key === 'Escape') onCancel();
    };

    const submitLabel = hasPoolContext
        ? (isLoading ? t('saveGuestModal.joining') : t('saveGuestModal.joinBtn'))
        : (isLoading ? t('saveGuestModal.saving') : t('saveGuestModal.saveBtn'));

    return ReactDOM.createPortal(
        <div className="modal-overlay" onClick={onCancel}>
            <div className="modal-overlay-content-container" onClick={(e) => e.stopPropagation()}>

                <button className="close-button" onClick={onCancel} disabled={isLoading}>&times;</button>

                <ShowcaseSection id="save-guest-play-gallery" className="modal-gallery">
                    <h2>
                        {t('saveGuestModal.titlePrefix')}
                        <span className="inline-teal inline-bold">{t('saveGuestModal.titleHighlight')}</span>
                    </h2>

                    <input
                        type="text"
                        className={`play-name-input${localError ? ' error' : ''}`}
                        placeholder={t('createModal.namePlaceholder')}
                        value={newPlayName}
                        onChange={(e) => { setNewPlayName(e.target.value); if (localError) setLocalError(''); }}
                        onKeyDown={handleKeyDown}
                        maxLength={28}
                        autoFocus
                        disabled={isLoading}
                    />

                    <div className="char-count-submit-container">
                        <div className="character-count">{newPlayName.length} / 28</div>
                        <button
                            className="btn btn-tan confirm-btn"
                            onClick={handleNewSubmit}
                            disabled={!newPlayName.trim() || isLoading}
                        >
                            {submitLabel}
                        </button>
                    </div>

                    <p className={`error-message${localError ? ' visible' : ''}`}>
                        {localError || ' '}
                    </p>
                </ShowcaseSection>

                <ShowcaseSection className="bottom-modal-gallery">
                    <div className="bottom-modal-header">
                        <h3>{t('saveGuestModal.sectionTitle')}</h3>
                    </div>
                    <div className="bottom-modal-text">
                        <p>
                            <Trans
                                i18nKey={hasPoolContext ? 'saveGuestModal.hint1Pool' : 'saveGuestModal.hint1'}
                                ns="play"
                                values={{ poolName }}
                                components={{
                                    bold: <span className="inline-teal inline-bold" />,
                                    pool: <strong />,
                                }}
                            />
                        </p>
                        {!hasPoolContext && <p>{t('saveGuestModal.hint2')}</p>}
                    </div>

                    <button
                        className="btn btn-ghost-outline cancel-btn"
                        onClick={onCancel}
                        disabled={isLoading}
                    >
                        {t('saveGuestModal.discardBtn')}
                    </button>
                </ShowcaseSection>
            </div>
        </div>,
        document.body
    );
};

export default ExistingUserInviteModal;
