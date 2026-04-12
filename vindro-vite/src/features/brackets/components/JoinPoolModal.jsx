import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import ShowcaseSection from '../../../components/ui/ShowcaseSection';
import SubmitPlayToPool from './SubmitPlayToPool'; // Import the new modal

const JoinPoolModal = ({ isOpen, tournamentId, userId, plays = [], onCancel }) => {
    // State to track if we should show the submission step
    const [submissionFlow, setSubmissionFlow] = useState({
        isOpen: false,
        type: null // 'public' or 'private'
    });

    if (!isOpen) return null;

    /**
     * Triggered when clicking 'Join' buttons.
     * It closes the selection view and opens the submission view.
     */
    const handleJoinPool = (type) => {
        setSubmissionFlow({
            isOpen: true,
            type: type
        });
    };

    const closeSubmissionFlow = () => {
        setSubmissionFlow({ isOpen: false, type: null });
    };

    const handleSubmissionSuccess = (selectedIds, code) => {
        console.log("Success! Plays submitted:", selectedIds, "to pool:", code || 'Public');
        // Close everything
        closeSubmissionFlow();
        onCancel(); 
        // Logic to refresh parent data would go here
    };

    return (
        <>
            {/* 1. SELECTION MODAL (The Router) */}
            {/* We only show this if the second modal isn't active */}
            {!submissionFlow.isOpen && ReactDOM.createPortal(
                <div className="play-name-modal-overlay" onClick={onCancel}>
                    <div className="play-name-modal" onClick={(e) => e.stopPropagation()}>

                        <button className="close-button" onClick={onCancel} aria-label="Close modal">
                            &times;
                        </button>

                        <ShowcaseSection id="join-pool-gallery" className="modal-gallery">
                            <h2>tournament<span className="inline-teal inline-bold">Pools</span></h2>
                            <div className="modal-gallery-text">
                                <p>Anybody can join our Public Vindro Games Pool.</p>
                                <p>A global Pool to compete against all players!</p>
                            </div>

                            <button 
                                className="btn btn-tan" 
                                onClick={() => handleJoinPool('public')}
                            >
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

                            <button 
                                className="btn btn-tan" 
                                onClick={() => handleJoinPool('private')}
                            >
                                Join Private Pool
                            </button>
                        </ShowcaseSection>
                        
                    </div>
                </div>,
                document.body
            )}

            {/* 2. SUBMISSION MODAL (The Action) */}
            <SubmitPlayToPool 
                isOpen={submissionFlow.isOpen}
                type={submissionFlow.type}
                plays={plays}
                onConfirm={handleSubmissionSuccess}
                onCancel={closeSubmissionFlow}
            />
        </>
    );
};

export default JoinPoolModal;