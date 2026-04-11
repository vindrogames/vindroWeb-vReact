import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

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


                <div id="prediction-play-gallery" className="modal-header">
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
                </div>

                <div id="prediction-play-text">

                    <div className="create-play-text">
                        <p className="modal-description">To participate in the event, you create what we call <em><span className='inline-green inline-bold'>Prediction Plays</span></em>.</p>
                        <p>A <em>play</em> consists of All the stages in the tournament and you will be able to manage your play throughout the tournament.</p>
                        <p>All you have to do is give your play a name</p>
                    </div>

                </div>

                <div className="modal-footer">
                    <button className="cancel-btn" onClick={onCancel}>
                        Cancel
                    </button>

                </div>
            </div>
        </div>,
        document.body
    );
};

export default CreateNewPlayModal;