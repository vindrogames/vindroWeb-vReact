import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import ShowcaseSection from '../../../components/ui/ShowcaseSection';
import SubmitPlayToPool from './SubmitPlayToPool';
import PoolSubmitResponseModal from './PoolSubmitResponseModal';

const JoinPoolModal = ({ isOpen, tournamentId, plays = [], onCancel, onSuccess }) => {
    const [submissionFlow, setSubmissionFlow] = useState({ isOpen: false, type: null });
    const [responseFlow, setResponseFlow] = useState({ isOpen: false, results: [] });

    if (!isOpen) return null;

    const handleJoinPool = (type) => {
        setSubmissionFlow({ isOpen: true, type: type });
    };

    const closeSubmissionFlow = () => {
        setSubmissionFlow({ isOpen: false, type: null });
    };

    const handleSubmissionSuccess = (selectedIds, code, responseData) => {
        const serverResults = responseData.results || {};
        const report = plays
            .filter(p => selectedIds.includes(p.id))
            .map(p => {
                const playIdStr = String(p.id);
                const statusFromServer = serverResults[playIdStr];
                return {
                    name: p.name,
                    status: statusFromServer ? statusFromServer : 'success'
                };
            });

        setSubmissionFlow({ isOpen: false, type: null }); // Close sub modal
        setResponseFlow({ isOpen: true, results: report }); // Open result modal
    };

    const handleFinalClose = () => {
        setResponseFlow({ isOpen: false, results: [] });
        if (onSuccess) onSuccess();
        onCancel();
    };

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
                                <p>A global Pool to compete against all players!</p>
                            </div>
                            <button className="btn btn-tan" onClick={() => handleJoinPool('public')}>
                                Join Vindro Public Pool
                            </button>
                        </ShowcaseSection>

                        <ShowcaseSection id="join-private-pool" className="bottom-modal-gallery">
                            <div className="bottom-modal-header">
                                <h3>Have a Private code?</h3>
                            </div>
                            <div className="bottom-modal-text">
                                <p>You can join Private Pools if the creator has given you a code.</p>
                                <p>Classifications and Scores will only be visible to members of the private pool.</p>
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