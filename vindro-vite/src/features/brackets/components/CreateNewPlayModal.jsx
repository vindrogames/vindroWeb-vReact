import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import ShowcaseSection from '../../../components/ui/ShowcaseSection';

const CreateNewPlayModal = ({ isOpen, onConfirm, onCancel }) => {

    const [playName, setPlayName] = useState('');
    const [error, setError] = useState('');

    // Reset state when modal opens/closes
    useEffect(() => {
        if (!isOpen) {
            setPlayName('');
            setError('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleConfirm = () => {
        const trimmedName = playName.trim();

        if (!trimmedName) {
            setError('Please enter a name for your play');
            return;
        }
        if (trimmedName.length < 3) {
            setError('Play name must be at least 3 characters');
            return;
        }

        onConfirm(trimmedName);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleConfirm();
        if (e.key === 'Escape') onCancel();
    };

    return ReactDOM.createPortal(
        <div className="play-name-modal-overlay" onClick={onCancel}>

            <div className="play-name-modal" onClick={(e) => e.stopPropagation()}>

                <button className="close-button" onClick={onCancel} aria-label="Close modal">
                    &times;
                </button>

                <ShowcaseSection id="prediction-play-gallery" className="modal-gallery">
                    <h2>prediction<span className='inline-teal inline-bold'>Play</span></h2>

                    <input
                        type="text"
                        className={`play-name-input ${error ? 'error' : ''}`}
                        placeholder="e.g., My Bold Predictions"
                        value={playName}
                        onChange={(e) => {
                            setPlayName(e.target.value);
                            if (error) setError('');
                        }}
                        onKeyDown={handleKeyDown}
                        maxLength={50}
                        autoFocus
                    />

                    <div className="char-count-submit-container">
                        <div className="character-count">
                            {playName.length} / 50
                        </div>

                        <button
                            className="btn btn-tan confirm-btn"
                            onClick={handleConfirm}
                            disabled={!playName.trim()}
                        >
                            Create Play
                        </button>
                    </div>


                    {error && <p className="error-message" style={{ color: '#ff4d4d', fontSize: '0.85rem' }}>{error}</p>}
                </ShowcaseSection>

                <ShowcaseSection id="prediction-play-text" className="bottom-modal-gallery">
                    <div className="bottom-modal-header">
                        <h3>Want to play?</h3>
                    </div>

                    <div className="bottom-modal-text">
                        <p>A <em><span className='inline-green inline-bold'>Play</span></em> includes predictions for both the Groups Stage & the Brackets Stage. You will be able to manage your predictions throughout the tournament.</p>
                        <p>Anybody can have multiple play predictions and submit their plays to different private and public pools</p>
                        <p>All you have to do is give your play a name and make your picks!</p>
                    </div>

                    <button className="btn btn-tan cancel-btn" onClick={onCancel}>
                        Maybe Later
                    </button>
                    
                </ShowcaseSection>
            </div>
        </div>,
        document.body
    );
};

export default CreateNewPlayModal;