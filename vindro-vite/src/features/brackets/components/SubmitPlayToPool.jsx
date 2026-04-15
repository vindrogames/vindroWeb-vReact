import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import ShowcaseSection from '../../../components/ui/ShowcaseSection';
import useJoinPool from '../hooks/usePools';

const SubmitPlayToPool = ({ isOpen, type, tournamentId, plays = [], onConfirm, onCancel }) => {
    const { joinPool, isLoading, error: apiError } = useJoinPool();
    const [selectedPlayIds, setSelectedPlayIds] = useState([]);
    const [poolCode, setPoolCode] = useState('');
    const [localError, setLocalError] = useState('');

    useEffect(() => {
        if (!isOpen) {
            setSelectedPlayIds([]);
            setPoolCode('');
            setLocalError('');
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
        if (type === 'private' && !poolCode) {
            setLocalError('Please enter a private pool code.');
            return;
        }

        try {
            const response = await joinPool(tournamentId, selectedPlayIds, type, poolCode);

            if (response.success) {
                // Pass 'response' as the 3rd argument to JoinPoolModal's handleSubmissionSuccess
                onConfirm(selectedPlayIds, poolCode, response);
            } else {
                // apiError from hook usually handles this, but setting local for redundancy
                setLocalError(response.error || 'Failed to join pool.');
            }
        } catch (err) {
            setLocalError(err.message || 'A network error occurred.');
        }
    };

    const hasNoPlays = !plays || plays.length === 0;
    const activeError = apiError || localError;

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
                                    {!hasNoPlays && plays.map((play) => (
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
                                    ))}
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
                                className={`play-name-input ${activeError && !poolCode ? 'error' : ''}`}
                                placeholder="ENTER CODE HERE"
                                value={poolCode}
                                onChange={(e) => setPoolCode(e.target.value.toUpperCase())}
                            />
                        </div>
                    )}

                    {activeError && <p className="error-message">{activeError}</p>}

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