import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { FaWhatsapp } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import ShowcaseSection from '../../../../components/ui/ShowcaseSection';

const PoolInviteModal = ({ isOpen, poolData, inviteUrl, onClose }) => {
    const { t } = useTranslation('play');
    const [linkCopied, setLinkCopied] = useState(false);
    const [whatsAppClick, setWhatsAppClick] = useState(false);

    if (!isOpen) return null;

    const joinCode = poolData?.join_code;
    const isMoneyPool = poolData?.is_money_pool;
    const allowsMultiple = poolData?.allow_multiple_plays_per_user;
    const currency = poolData?.currency || '€';

    const shareMessage = t('inviteModal.shareMessage', {
        poolName: poolData?.name,
        code: joinCode,
        url: inviteUrl,
    });

    const handleWhatsApp = () => {
        window.open(`https://wa.me/?text=${encodeURIComponent(shareMessage)}`, '_blank');
        setWhatsAppClick(true);
        setTimeout(() => setWhatsAppClick(false), 2500);
    };

    const handleCopyInvite = async () => {
        try {
            await navigator.clipboard.writeText(shareMessage);
        } catch {
            const el = document.createElement('input');
            el.value = shareMessage;
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);
        }
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2500);
    };

    return ReactDOM.createPortal(
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-overlay-content-container pool-invite-modal" onClick={e => e.stopPropagation()}>
                <button className="close-button" onClick={onClose}>&times;</button>

                <ShowcaseSection id="pool-invite-gallery" className="modal-gallery">
                    <h2>
                        {t('inviteModal.titlePrefix')}
                        <span className="inline-teal inline-bold">{t('inviteModal.titleHighlight')}</span>
                    </h2>

                    {allowsMultiple ? (
                        <div className="pool-invite-specs-container">
                            <p>{t('inviteModal.multipleAllowed')}</p>
                        </div>
                    ) : (
                        <div className="pool-invite-specs-container">
                            <p>{t('inviteModal.singleOnly')}</p>
                        </div>
                    )}

                    {isMoneyPool ? (
                        <div className="pool-invite-specs-container">
                            <p>{t('inviteModal.isMoneyPool')}</p>
                            <p>{t('inviteModal.costPerPlay', { currency, cost: parseFloat(poolData?.cost_per_play || 0).toFixed(2) })}</p>
                            <p>{t('inviteModal.ownerUpdates')}</p>
                        </div>
                    ) : (
                        <div className="pool-invite-specs-container">
                            <p>{t('inviteModal.freePool')}</p>
                        </div>
                    )}
                </ShowcaseSection>

                <ShowcaseSection id="pool-invite-bottom" className="bottom-modal-gallery">
                    <div className="invite-reminder">
                        <h3 className="invite-warning">{t('inviteModal.codeWarning')}</h3>
                        <h3 className="inline-teal inline-bold code">{joinCode || '—'}</h3>
                    </div>

                    <div id="pool-invite-buttons" className="submit-plays-buttons">
                        <button
                            className={`btn btn-tan ${linkCopied ? 'copied' : ''} confirm-btn`}
                            onClick={handleCopyInvite}
                            disabled={!joinCode}
                        >
                            {linkCopied ? t('inviteModal.copiedBtn') : t('inviteModal.copyBtn')}
                        </button>
                        <button
                            className={`btn btn-tan whatsapp-btn ${whatsAppClick ? 'copied' : ''}`}
                            onClick={handleWhatsApp}
                            disabled={!joinCode}
                        >
                            <FaWhatsapp /> {t('inviteModal.shareBtn')}
                        </button>
                    </div>
                </ShowcaseSection>
            </div>
        </div>,
        document.body
    );
};

export default PoolInviteModal;
