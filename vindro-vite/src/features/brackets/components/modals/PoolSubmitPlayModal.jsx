import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import ShowcaseSection from '../../../../components/ui/ShowcaseSection';

// 1. IMPORT HOOK: Ensure the path is correct for your file structure
import usePools from '../../hooks/usePools'; 

const SubmitPlayToPool = ({ isOpen, type, tournamentId, plays = [], onConfirm, onCancel }) => {
    // 2. HOOK CONNECTION: 
    // We destructure 'handleJoinPool' (matching your hook's export) 
    // and 'isSubmitting' (which tracks the specific POST request state).
    const { handleJoinPool, isSubmitting, error: apiError } = usePools(tournamentId);

    // 3. LOCAL STATE:
    const [selectedPlayIds, setSelectedPlayIds] = useState([]);
    const [poolCode, setPoolCode] = useState('');
    const [localError, setLocalError] = useState('');

    // RESET: Clear inputs whenever the modal closes or switches modes
    useEffect(() => {
        if (!isOpen) {
            setSelectedPlayIds([]);
            setPoolCode('');
            setLocalError('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    // 4. SELECTION LOGIC: Toggle play IDs in the array
    const togglePlaySelection = (id) => {
        if (!id) return;
        setSelectedPlayIds(prev =>
            prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
        );
    };

    // 5. THE SUBMISSION: The bridge between UI and Service
    const handleConfirmSubmission = async () => {
        // VALIDATION: Ensure private pools have a code before hitting the API
        if (type === 'private' && !poolCode.trim()) {
            setLocalError('Please enter a private pool code.');
            return;
        }

        try {
            setLocalError(''); // Clear previous errors
            
            // CALL HOOK: This calls poolServices.joinPool via the hook
            // Note: handleJoinPool returns the 'result' object from the service
            const response = await handleJoinPool(selectedPlayIds, type, poolCode);

            if (response.success) {
                // SIGNAL SUCCESS: Send the response back to JoinPoolModal (Stage 1)
                // so it can build the report for the Response Modal (Stage 3).
                onConfirm(selectedPlayIds, poolCode, response);
            } else {
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
                    {/* PRIVATE CODE UI: Only visible if 'private' was selected in Step 1 */}
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
                        <button className="btn btn-tan cancel-btn" onClick={onCancel} disabled={isSubmitting}>
                            Go back
                        </button>
                        <button
                            className="btn btn-tan confirm-btn"
                            onClick={handleConfirmSubmission}
                            disabled={isSubmitting || selectedPlayIds.length === 0}
                        >
                            {isSubmitting ? 'Submitting...' : `Submit ${selectedPlayIds.length} Play${selectedPlayIds.length !== 1 ? 's' : ''}`}
                        </button>
                    </div>
                </ShowcaseSection>
            </div>
        </div>,
        document.body
    );
};

export default SubmitPlayToPool;