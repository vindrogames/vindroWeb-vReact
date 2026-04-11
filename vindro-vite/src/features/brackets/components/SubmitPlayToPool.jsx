import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import ShowcaseSection from '../../../components/ui/ShowcaseSection';

const SubmitPlayToPool = ({ isOpen, type, plays = [], onConfirm, onCancel }) => {
    const [selectedPlayIds, setSelectedPlayIds] = useState([]);
    const [poolCode, setPoolCode] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Reset state when modal opens/closes
    useEffect(() => {
        if (!isOpen) {
            setSelectedPlayIds([]);
            setPoolCode('');
            setError('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const togglePlaySelection = (id) => {
        if (!id) return; 
        setSelectedPlayIds(prev => 
            prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
        );
    };

    const handleConfirmSubmission = async () => {
        if (selectedPlayIds.length === 0) {
            setError('Please select at least one play.');
            return;
        }

        if (type === 'private' && poolCode.trim().length < 6) {
            setError('Please enter a valid private pool code.');
            return;
        }

        setIsLoading(true);
        try {
            // Success handler
            onConfirm?.(selectedPlayIds, poolCode);
        } catch (err) {
            setError('Submission failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const hasNoPlays = !plays || plays.length === 0;

    return ReactDOM.createPortal(
        <div className="play-name-modal-overlay" onClick={onCancel}>
            <div className="play-name-modal submit-play-modal" onClick={(e) => e.stopPropagation()}>
                
                <button className="close-button" onClick={onCancel}>&times;</button>

                <ShowcaseSection id="select-plays-gallery" className="modal-gallery">
                    <h2>select<span className="inline-teal inline-bold">Plays</span></h2>
                    <div className="modal-gallery-text">
                        <p>{hasNoPlays ? "No plays to submit yet." : "Select plays to submit to this pool."}</p>
                    </div>

                    <div className="feature-table">
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th style={{ width: '80px' }}>Select</th>
                                        <th>Play Name</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {hasNoPlays ? (
                                        <tr className="disabled-row">
                                            <td>
                                                <div className="checkbox-container">
                                                    <div className="custom-checkbox deactivated"></div>
                                                </div>
                                            </td>
                                            <td>-</td>
                                        </tr>
                                    ) : (
                                        plays.map((play) => (
                                            <tr 
                                                key={play.id} 
                                                className={selectedPlayIds.includes(play.id) ? 'selected-row' : ''}
                                                onClick={() => togglePlaySelection(play.id)}
                                            >
                                                <td>
                                                    <div className="checkbox-container">
                                                        <div className={`custom-checkbox ${selectedPlayIds.includes(play.id) ? 'checked' : ''}`}>
                                                            {selectedPlayIds.includes(play.id) && <span>✓</span>}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="play-info-name">{play.name}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </ShowcaseSection>

                <ShowcaseSection id="submission-actions">
                    {type === 'private' && (
                        <div className="private-code-wrapper">
                            <h3>Enter Private Code</h3>
                            <input 
                                type="text"
                                className={`play-name-input ${error && !poolCode ? 'error' : ''}`}
                                placeholder="21 char5 -n0 sp@c3s-"
                                value={poolCode}
                                onChange={(e) => setPoolCode(e.target.value.toUpperCase())}
                            />
                        </div>
                    )}

                    {error && <p className="error-message">{error}</p>}

                    <div className="submit-plays-buttons">
                        <button className="btn btn-tan cancel-btn" onClick={onCancel} disabled={isLoading}>
                            Go back
                        </button>
                        <button 
                            className="btn btn-tan confirm-btn" 
                            onClick={handleConfirmSubmission}
                            disabled={isLoading || selectedPlayIds.length === 0}
                        >
                            {isLoading ? 'Submitting...' : `Submit ${selectedPlayIds.length} Play${selectedPlayIds.length !== 1 ? 's' : ''}`}
                        </button>
                    </div>
                </ShowcaseSection>
                
            </div>
        </div>,
        document.body
    );
};

export default SubmitPlayToPool;