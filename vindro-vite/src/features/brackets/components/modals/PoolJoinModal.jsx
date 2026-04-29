import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import ShowcaseSection from '../../../../components/ui/ShowcaseSection';
import SubmitPlayToPool from './PoolSubmitPlayModal';
import PoolSubmitResponseModal from './PoolSubmitResponseModal';
import usePools from '../../hooks/usePools';

const JoinPoolModal = ({ isOpen, mode = 'join', tournamentId, plays = [], onCancel, onSuccess }) => {
    const { handleCreatePool, isSubmitting } = usePools(tournamentId);

    const [submissionFlow, setSubmissionFlow] = useState({ isOpen: false, type: null });
    const [responseFlow, setResponseFlow] = useState({ isOpen: false, results: [] });
    const [newPoolName, setNewPoolName] = useState('');
    const [createError, setCreateError] = useState('');
    const [createSuccess, setCreateSuccess] = useState(null);

    if (!isOpen) return null;

    // --- Join flow ---
    const handleJoinPool = (type) => setSubmissionFlow({ isOpen: true, type });
    const closeSubmissionFlow = () => setSubmissionFlow({ isOpen: false, type: null });

    const handleSubmissionSuccess = (selectedIds, code, responseData) => {
        const serverResults = responseData.results || {};
        const report = plays
            .filter(p => selectedIds.includes(p.id))
            .map(p => ({
                name: p.name,
                status: serverResults[String(p.id)] || 'success',
            }));
        setSubmissionFlow({ isOpen: false, type: null });
        setResponseFlow({ isOpen: true, results: report });
    };

    const handleFinalClose = () => {
        setResponseFlow({ isOpen: false, results: [] });
        if (onSuccess) onSuccess();
        onCancel();
    };

    // --- Create flow ---
    const handleCreatePoolSubmit = async () => {
        if (!newPoolName.trim()) {
            setCreateError('Pool name is required.');
            return;
        }
        setCreateError('');
        try {
            const result = await handleCreatePool({ name: newPoolName.trim() });
            if (result.success) {
                setCreateSuccess(result.data);
                setNewPoolName('');
                if (onSuccess) onSuccess();
            } else {
                setCreateError(result.error || 'Failed to create pool.');
            }
        } catch (err) {
            setCreateError(err.message || 'A network error occurred.');
        }
    };

    if (mode === 'create') {
        return ReactDOM.createPortal(
            <div className="play-name-modal-overlay" onClick={onCancel}>
                <div className="play-name-modal" onClick={(e) => e.stopPropagation()}>
                    <button className="close-button" onClick={onCancel}>&times;</button>
                    <ShowcaseSection id="create-pool" className="modal-gallery">
                        <h2>create<span className="inline-teal inline-bold">Pool</span></h2>
                        {createSuccess ? (
                            <div className="modal-gallery-text">
                                <p>Pool <strong>{createSuccess.name}</strong> created!</p>
                                <p>Share this code with friends: <strong>{createSuccess.join_code}</strong></p>
                                <button className="btn btn-tan" onClick={() => setCreateSuccess(null)}>Create another</button>
                            </div>
                        ) : (
                            <>
                                <div className="modal-gallery-text">
                                    <p>Give your pool a name and share the generated code with friends.</p>
                                </div>
                                <input
                                    type="text"
                                    className="play-name-input"
                                    placeholder="Pool name"
                                    maxLength={100}
                                    value={newPoolName}
                                    onChange={(e) => setNewPoolName(e.target.value)}
                                />
                                {createError && <p className="error-message">{createError}</p>}
                                <button
                                    className="btn btn-tan"
                                    onClick={handleCreatePoolSubmit}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Creating...' : 'Create Pool'}
                                </button>
                            </>
                        )}
                    </ShowcaseSection>
                </div>
            </div>,
            document.body
        );
    }

    // mode === 'join'
    return (
        <>
            {!submissionFlow.isOpen && !responseFlow.isOpen && ReactDOM.createPortal(
                <div className="play-name-modal-overlay" onClick={onCancel}>
                    <div className="play-name-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="close-button" onClick={onCancel}>&times;</button>

                        <ShowcaseSection id="join-pool-gallery" className="modal-gallery">
                            <h2>tournament<span className="inline-teal inline-bold">Pools</span></h2>
                            <div className="modal-gallery-text">
                                <p>Anybody can join our Public Vindro Games Pool.</p>
                            </div>
                            <button className="btn btn-tan" onClick={() => handleJoinPool('public')}>
                                Join Vindro Public Pool
                            </button>
                        </ShowcaseSection>

                        <ShowcaseSection id="join-private-pool" className="bottom-modal-gallery">
                            <div className="bottom-modal-header">
                                <h3>Have a Private code?</h3>
                            </div>
                            <button className="btn btn-tan" onClick={() => handleJoinPool('private')}>
                                Join Private Pool
                            </button>
                        </ShowcaseSection>
                    </div>
                </div>,
                document.body
            )}

            <SubmitPlayToPool
                isOpen={submissionFlow.isOpen}
                type={submissionFlow.type}
                tournamentId={tournamentId}
                plays={plays}
                onConfirm={handleSubmissionSuccess}
                onCancel={closeSubmissionFlow}
            />

            {responseFlow.isOpen && (
                <PoolSubmitResponseModal
                    results={responseFlow.results}
                    onClose={handleFinalClose}
                />
            )}
        </>
    );
};

export default JoinPoolModal;
