/**
 * PlayNameModal.jsx
 * 
 * Modal component for naming a new tournament play/bracket.
 * Users must enter a name before proceeding to predictions.
 * 
 * Props:
 *   - isOpen: Boolean to control modal visibility
 *   - onConfirm: Callback with the play name when confirmed
 *   - onCancel: Callback when user cancels
 */

import React, { useState } from 'react';

const PlayNameModal = ({ isOpen, onConfirm, onCancel }) => {
    const [playName, setPlayName] = useState('');
    const [error, setError] = useState('');

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

        if (trimmedName.length > 30) {
            setError('Play name must be 30 characters or less');
            return;
        }

        onConfirm(trimmedName);
        setPlayName('');
        setError('');
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleConfirm();
        }
    };

    const handleCancel = () => {
        setPlayName('');
        setError('');
        onCancel();
    };

    if (!isOpen) return null;

    return (
        <div className="play-name-modal-overlay" onClick={handleCancel}>
            <div
                className="play-name-modal"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-header">
                    <h2>Name Your Play</h2>
                    <button
                        className="close-btn"
                        onClick={handleCancel}
                        aria-label="Close modal"
                    >
                        ✕
                    </button>
                </div>

                <div className="modal-body">
                    <p className="modal-description">
                        Give your tournament prediction a name so you can track it later.
                    </p>

                    <input
                        type="text"
                        className={`play-name-input ${error ? 'error' : ''}`}
                        placeholder="e.g., My Bold Predictions, Happy Accident..."
                        value={playName}
                        onChange={(e) => {
                            setPlayName(e.target.value);
                            setError('');
                        }}
                        onKeyPress={handleKeyPress}
                        maxLength={30}
                        autoFocus
                    />

                    <div className="character-count">
                        {playName.length} / 30
                    </div>

                    {error && <p className="error-message">{error}</p>}
                </div>

                <div className="modal-footer">
                    <button className="cancel-btn" onClick={handleCancel}>
                        Cancel
                    </button>
                    <button className="confirm-btn" onClick={handleConfirm}>
                        Continue
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PlayNameModal;
