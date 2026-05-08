import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { FaWhatsapp } from 'react-icons/fa';
import ShowcaseSection from '../../../../components/ui/ShowcaseSection';

const PoolInviteModal = ({ isOpen, poolData, inviteUrl, onClose }) => {
    const [linkCopied, setLinkCopied] = useState(false);
    const [whatsAppClick, setWhatsAppClick] = useState(false)

    if (!isOpen) return null;

    const joinCode = poolData?.join_code;
    const isMoneyPool = poolData?.is_money_pool;
    const allowsMultiple = poolData?.allow_multiple_plays_per_user;
    const poolType = poolData?.pool_type;
    const currency = poolData?.currency || '€';

    const handleWhatsApp = () => {
        const text = encodeURIComponent(
            `Join my pool "${poolData?.name}" on Vindro Games! Use code: ${joinCode} or click here: ${inviteUrl}`
        );
        window.open(`https://wa.me/?text=${text}`, '_blank');
        setWhatsAppClick(true);
        setTimeout(() => setWhatsAppClick(false), 2500);
    };

    const handleCopyInvite = async () => {
        try {
            await navigator.clipboard.writeText(inviteUrl);
        } catch {
            const el = document.createElement('input');
            el.value = inviteUrl;
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
                    <h2>invite<span className="inline-teal inline-bold">Friends</span></h2>


                    {allowsMultiple ? (
                        <div className="pool-invite-specs-container">
                            <p>Users can submit as many plays as they like.</p>
                        </div>

                    ) : (
                        <div className="pool-invite-specs-container">
                            <p>Users can only submit 1 play each.</p>
                        </div>
                    )}
                    {isMoneyPool ? (
                        <div className="pool-invite-specs-container">
                            <p>This is a Money Pool.</p>
                            <p>Each play costs {currency}{parseFloat(poolData?.cost_per_play || 0).toFixed(2)} to submit</p>
                            <p>The owner will update payments during the Tournament</p>
                        </div>
                    ) : (
                        <div className="pool-invite-specs-container">
                            <p>This is not a Money Pool.</p>
                            <p>Free to play!.</p>
                        </div>
                    )}
                </ShowcaseSection>

                <ShowcaseSection id="pool-invite-bottom" className="bottom-modal-gallery">

                    <div className="invite-reminder">
                        <h3 className="invite-warning">Very important the code to join.</h3>
                        <h3 className='inline-teal inline-bold code'>{joinCode || '—'}</h3>
                    </div>
                    

                    <div id="pool-invite-buttons" className="submit-plays-buttons">
                        <button
                            className={`btn btn-tan ${linkCopied ? 'copied' : ''} confirm-btn`}
                            onClick={handleCopyInvite}
                            disabled={!joinCode}
                        >
                            {linkCopied ? 'Link Copied!' : 'Copy Invite Link'}
                        </button>
                        <button
                            className={`btn btn-tan whatsapp-btn ${whatsAppClick ? 'copied' : ''}`}
                            onClick={handleWhatsApp}
                            disabled={!joinCode}
                        >
                            <FaWhatsapp /> Share
                        </button>
                    </div>
                </ShowcaseSection>
            </div>
        </div>,
        document.body
    );
};

export default PoolInviteModal;
