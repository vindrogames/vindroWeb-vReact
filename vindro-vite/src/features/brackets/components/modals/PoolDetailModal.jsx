import React from 'react';
import ReactDOM from 'react-dom';
import ShowcaseSection from '../../../../components/ui/ShowcaseSection';

const PoolDetailModal = ({ pool, onClose }) => {
    if (!pool) return null;

    const handleCopy = () => navigator.clipboard.writeText(pool.join_code);

    const handleWhatsApp = () => {
        const url = `${window.location.origin}${window.location.pathname}?pool=${pool.join_code}`;
        const text = encodeURIComponent(`Join my pool "${pool.name}" on Vindro Games! Use code: ${pool.join_code} or click here: ${url}`);
        window.open(`https://wa.me/?text=${text}`, '_blank');
    };

    return ReactDOM.createPortal(
        <div className="play-name-modal-overlay" onClick={onClose}>
            <div className="play-name-modal" onClick={(e) => e.stopPropagation()}>
                <button className="close-button" onClick={onClose}>&times;</button>

                <ShowcaseSection id="pool-detail" className="modal-gallery">
                    <h2>pool<span className="inline-teal inline-bold">Details</span></h2>
                    <div className="modal-gallery-text">
                        <p><strong>Name:</strong> {pool.name}</p>
                        {pool.description && <p><strong>Description:</strong> {pool.description}</p>}
                        <p><strong>Members:</strong> {pool.current_member_count}</p>
                    </div>
                </ShowcaseSection>

                <ShowcaseSection id="pool-join-code" className="bottom-modal-gallery">
                    <div className="bottom-modal-header">
                        <h3>Join Code</h3>
                    </div>
                    <div className="modal-gallery-text">
                        <p>Share this code with friends so they can join your pool.</p>
                        <p className="join-code-display">{pool.join_code}</p>
                    </div>
                    <button className="btn btn-tan" onClick={handleCopy}>Copy Code</button>
                    <button className="btn btn-tan" onClick={handleWhatsApp}>Share via WhatsApp</button>
                </ShowcaseSection>
            </div>
        </div>,
        document.body
    );
};

export default PoolDetailModal;
