import React from 'react';
import ReactDOM from 'react-dom';
import ShowcaseSection from './ShowcaseSection';

const MESSAGES = {
    unauthorized: {
        heading: <>hands<span className="inline-teal inline-bold">Off</span></>,
        body: "Don't be trying to edit somebody else's sh*t now!",
    },
    not_found: {
        heading: <>nothing<span className="inline-teal inline-bold">Here</span></>,
        body: "Whatever you were looking for has been moved or doesn't exist.",
    },
    server_error: {
        heading: <>server<span className="inline-teal inline-bold">Oops</span></>,
        body: 'Something went wrong on our end. Try again in a moment.',
    },
    generic: {
        heading: <>hmm<span className="inline-teal inline-bold">...</span></>,
        body: null,
    },
};

const ErrorDisplayModal = ({ isOpen, code = 'generic', customMessage, onClose }) => {
    if (!isOpen) return null;

    const { heading, body } = MESSAGES[code] ?? MESSAGES.generic;
    const displayBody = customMessage || body || 'Something unexpected happened.';

    return ReactDOM.createPortal(
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-overlay-content-container error-display-modal" onClick={(e) => e.stopPropagation()}>
                <button className="close-button" onClick={onClose}>&times;</button>

                <ShowcaseSection id="error-modal-gallery" className="modal-gallery">
                    <h2>{heading}</h2>
                    <p>{displayBody}</p>
                </ShowcaseSection>

                <ShowcaseSection id="error-modal-actions" className="bottom-modal-gallery">
                    <button className="btn btn-tan" onClick={onClose}>Got it</button>
                </ShowcaseSection>
            </div>
        </div>,
        document.body
    );
};

export default ErrorDisplayModal;
