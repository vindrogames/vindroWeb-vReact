import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import ShowcaseSection from '../../../../components/ui/ShowcaseSection';
import SubmitPlayToPool from './PoolSubmitPlayModal';
import PoolSubmitResponseModal from './PoolSubmitResponseModal';
const JoinPoolModal = ({ isOpen, tournamentId, plays = [], onCancel, onSuccess, initialCode = '', onCreatePlay }) => {

    const [submissionFlow, setSubmissionFlow] = useState({ isOpen: false, type: null });
    const [responseFlow, setResponseFlow] = useState({ isOpen: false, results: [] });

    useEffect(() => {
        if (isOpen && initialCode) {
            setSubmissionFlow({ isOpen: true, type: 'private' });
        }
    }, [isOpen, initialCode]);

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

    return (
        <>
            {!submissionFlow.isOpen && !responseFlow.isOpen && ReactDOM.createPortal(
                <div className="modal-overlay" onClick={onCancel}>
                    <div className="modal-overlay-content-container" onClick={(e) => e.stopPropagation()}>
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
                initialCode={submissionFlow.type === 'private' ? initialCode : ''}
                onCreatePlay={onCreatePlay}
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
