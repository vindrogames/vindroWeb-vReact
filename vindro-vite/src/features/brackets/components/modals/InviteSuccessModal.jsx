import React from 'react';
import ReactDOM from 'react-dom';
import { useTranslation, Trans } from 'react-i18next';
import ShowcaseSection from '../../../../components/ui/ShowcaseSection';

const InviteSuccessModal = ({ isOpen, data, onViewPool, onLater }) => {
    const { t } = useTranslation('play');

    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div className="modal-overlay" onClick={onLater}>
            <div className="modal-overlay-content-container" onClick={e => e.stopPropagation()}>

                <ShowcaseSection id="invite-success-gallery" className="modal-gallery">
                    <h2>
                        {t('inviteSuccess.titlePrefix')}
                        {' '}
                        <span className="inline-teal inline-bold">{t('inviteSuccess.titleHighlight')}</span>
                    </h2>
                    <p>
                        <Trans
                            i18nKey="inviteSuccess.message"
                            ns="play"
                            values={{ playName: data?.playName, poolName: data?.poolName }}
                            components={{
                                play: <span className="inline-bold" />,
                                pool: <span className="inline-teal inline-bold" />,
                            }}
                        />
                    </p>
                </ShowcaseSection>

                <ShowcaseSection id="invite-success-actions" className="bottom-modal-gallery">
                    <div className="submit-plays-buttons">
                        <button className="btn btn-ghost-outline cancel-btn" onClick={onLater}>
                            {t('inviteSuccess.later')}
                        </button>
                        <button className="btn btn-tan confirm-btn" onClick={onViewPool}>
                            {t('inviteSuccess.viewPool')}
                        </button>
                    </div>
                </ShowcaseSection>

            </div>
        </div>,
        document.body
    );
};

export default InviteSuccessModal;
