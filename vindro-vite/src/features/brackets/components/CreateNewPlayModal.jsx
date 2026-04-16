import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import ShowcaseSection from '../../../components/ui/ShowcaseSection';

const CreateNewPlayModal = ({ isOpen, onConfirm, onCancel, isLoading, apiError }) => {
    const [playName, setPlayName] = useState('');
    const [localError, setLocalError] = useState('');

    // Clear state when modal toggles
    useEffect(() => {
        if (!isOpen) {
            setPlayName('');
            setLocalError('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleConfirm = () => {
        
        const trimmedName = playName.trim();
        if (!trimmedName) {
            setLocalError('Please enter a name for your play');
            return;
        }
        if (trimmedName.length < 3) {
            setLocalError('Play name must be at least 3 characters');
            return;
        }
        
        // This triggers handleCreatePlayConfirm in TournamentPage
        onConfirm(trimmedName);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !isLoading) handleConfirm();
        if (e.key === 'Escape') onCancel();
    };

    // Show local validation error first, then fall back to API error
    const activeError = localError || apiError;

    return ReactDOM.createPortal(
        <div className="play-name-modal-overlay" onClick={onCancel}>
            <div className="play-name-modal" onClick={(e) => e.stopPropagation()}>
                
                <button 
                    className="close-button" 
                    onClick={onCancel} 
                    aria-label="Close modal"
                    disabled={isLoading}
                >
                    &times;
                </button>

                <ShowcaseSection id="prediction-play-gallery" className="modal-gallery">
                    <h2>prediction<span className='inline-teal inline-bold'>Play</span></h2>

                    <input
                        type="text"
                        className={`play-name-input ${activeError ? 'error' : ''}`}
                        placeholder="e.g., My Bold Predictions"
                        value={playName}
                        onChange={(e) => {
                            setPlayName(e.target.value);
                            if (localError) setLocalError('');
                        }}
                        onKeyDown={handleKeyDown}
                        maxLength={42}
                        autoFocus
                        disabled={isLoading}
                    />

                    <div className="char-count-submit-container">
                        <div className="character-count">
                            {playName.length} / 42
                        </div>

                        <button
                            className="btn btn-tan confirm-btn"
                            onClick={handleConfirm}
                            disabled={!playName.trim() || isLoading}
                        >
                            {isLoading ? 'Creating...' : 'Create Play'}
                        </button>
                    </div>

                    {activeError && (
                        <p className="error-message" style={{ color: '#ff4d4d', fontSize: '0.85rem', marginTop: '10px' }}>
                            {activeError}
                        </p>
                    )}
                </ShowcaseSection>

                <ShowcaseSection id="prediction-play-text" className="bottom-modal-gallery">
                    <div className="bottom-modal-header">
                        <h3>Want to play?</h3>
                    </div>

                    <div className="bottom-modal-text">
                        <p>A <em><span className='inline-green inline-bold'>Play</span></em> includes predictions for both Groups and Brackets.</p>
                        <p>You can create multiple plays and enter different pools!</p>
                    </div>

                    <button 
                        className="btn btn-tan cancel-btn" 
                        onClick={onCancel}
                        disabled={isLoading}
                    >
                        Maybe Later
                    </button>
                </ShowcaseSection>
            </div>
        </div>,
        document.body
    );
};

export default CreateNewPlayModal;