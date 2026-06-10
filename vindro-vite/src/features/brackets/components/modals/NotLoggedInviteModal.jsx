import React from 'react';
import ReactDOM from 'react-dom';
import { useTranslation, Trans } from 'react-i18next';
import ShowcaseSection from '../../../../components/ui/ShowcaseSection';

const NotLoggedInviteModal = ({ isOpen, poolData, poolName, onSignIn, onGuestPlay, onClose }) => {
    const { t } = useTranslation('play');

    if (!isOpen) return null;

    const displayName = poolData?.name || poolName;
    const joinCode = poolData?.join_code;

    return ReactDOM.createPortal(
        <div className="modal-overlay">
            <div className="modal-overlay-content-container pool-invite-modal" onClick={e => e.stopPropagation()}>
                <button className="close-button" onClick={onClose}>&times;</button>

                <ShowcaseSection id="not-logged-invite-gallery" className="modal-gallery">
                    <h2>
                        {t('notLoggedInviteModal.titlePrefix')}
                        <span className="inline-teal inline-bold">{t('notLoggedInviteModal.titleHighlight')}</span>
                    </h2>
                    <p>
                        <Trans
                            i18nKey="notLoggedInviteModal.subtitle"
                            ns="play"
                            values={{ poolName: displayName, tournamentName: poolData?.tournament_name }}
                            components={{ pool: <span className="inline-teal inline-bold" /> }}
                        />
                    </p>

                    <div className="table-container bg-gray backdrop-black">
                        <table>
                            <tbody>
                                <tr>
                                    <td>{t('poolPage.poolLabel')}</td>
                                    <td className="inline-teal inline-bold">{displayName}</td>
                                </tr>
                                <tr>
                                    <td>{t('notLoggedInviteModal.codeLabel')}</td>
                                    <td className="inline-teal inline-bold">{joinCode || '—'}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </ShowcaseSection>

                <ShowcaseSection id="not-logged-invite-actions" className="bottom-modal-gallery pool-prompt-bottom">
                    <div className="pool-prompt-half">
                        <h3>{t('notLoggedInviteModal.signInTitle')}</h3>
                        <p>{t('notLoggedInviteModal.signInText')}</p>
                        <button className="btn btn-tan confirm-btn" onClick={onSignIn}>
                            {t('notLoggedInviteModal.signInBtn')}
                        </button>
                    </div>

                    <div className="pool-half-divider" />

                    <div className="pool-prompt-half">
                        <h3>{t('notLoggedInviteModal.newUserTitle')}</h3>
                        <p>{t('notLoggedInviteModal.newUserText')}</p>
                        <button className="btn btn-tan" onClick={onGuestPlay}>
                            {t('notLoggedInviteModal.newUserBtn')}
                        </button>
                    </div>
                </ShowcaseSection>
            </div>
        </div>,
        document.body
    );
};

export default NotLoggedInviteModal;
