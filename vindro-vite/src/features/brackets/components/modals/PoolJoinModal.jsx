import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import ShowcaseSection from '../../../../components/ui/ShowcaseSection';
import SubmitPlayToPool from './PoolSubmitPlayModal'; 
import PoolSubmitResponseModal from './PoolSubmitResponseModal';

const JoinPoolModal = ({ isOpen, tournamentId, plays = [], onCancel, onSuccess }) => {
    // 1. MANAGE SUB-FLOW STATE
    // submissionFlow: Controls the "Select Plays" modal (Step 2)
    const [submissionFlow, setSubmissionFlow] = useState({ isOpen: false, type: null });
    // responseFlow: Controls the "Status Report" modal (Step 3)
    const [responseFlow, setResponseFlow] = useState({ isOpen: false, results: [] });

    // Standard guard clause for Modal visibility
    if (!isOpen) return null;

    // 2. TRIGGER STEP 2
    // When user clicks 'Join Public' or 'Join Private', we open the next modal
    const handleJoinPool = (type) => {
        setSubmissionFlow({ isOpen: true, type: type });
    };

    const closeSubmissionFlow = () => {
        setSubmissionFlow({ isOpen: false, type: null });
    };

    // 3. PROCESS API RESULTS (Called by Step 2 on Success)
    // selectedIds: the IDs the user checked
    // responseData: the raw JSON from the server containing { results: { "id": "status" } }
    const handleSubmissionSuccess = (selectedIds, code, responseData) => {
        const serverResults = responseData.results || {};
        
        // Transform server data into a readable report for the UI
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

        setSubmissionFlow({ isOpen: false, type: null }); // Close Step 2
        setResponseFlow({ isOpen: true, results: report }); // Open Step 3
    };

    // 4. CLEANUP
    const handleFinalClose = () => {
        setResponseFlow({ isOpen: false, results: [] });
        if (onSuccess) onSuccess(); // Triggers a list refresh in the parent page
        onCancel(); // Closes the entire gateway
    };

    return (
        <>
            {/* Only show the Choice UI if neither the Submission nor Response modals are active.
               We use createPortal to ensure the modal sits at the root of the DOM.
            */}
            {!submissionFlow.isOpen && !responseFlow.isOpen && ReactDOM.createPortal(
                <div className="play-name-modal-overlay" onClick={onCancel}>
                    <div className="play-name-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="close-button" onClick={onCancel}>&times;</button>
                        
                        {/* PUBLIC POOL CHOICE */}
                        <ShowcaseSection id="join-pool-gallery" className="modal-gallery">
                            <h2>tournament<span className="inline-teal inline-bold">Pools</span></h2>
                            <div className="modal-gallery-text">
                                <p>Anybody can join our Public Vindro Games Pool.</p>
                            </div>
                            <button className="btn btn-tan" onClick={() => handleJoinPool('public')}>
                                Join Vindro Public Pool
                            </button>
                        </ShowcaseSection>

                        {/* PRIVATE POOL CHOICE */}
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

            {/* STEP 2: SELECT PLAYS MODAL */}
            <SubmitPlayToPool 
                isOpen={submissionFlow.isOpen}
                type={submissionFlow.type}
                tournamentId={tournamentId}
                plays={plays}
                onConfirm={handleSubmissionSuccess} // Passing logic back up
                onCancel={closeSubmissionFlow}
            />

            {/* STEP 3: FEEDBACK MODAL */}
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