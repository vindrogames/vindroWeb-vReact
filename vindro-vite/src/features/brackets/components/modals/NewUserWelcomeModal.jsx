import React from 'react';

const NewUserWelcomeModal = ({ onDismiss, onGoToProfile }) => (
    <div className="modal-overlay" onClick={onDismiss}>
        <div
            className="modal-overlay-content-container"
            onClick={(e) => e.stopPropagation()}
        >
            <button className="btn close-button" onClick={onDismiss}>&times;</button>

            <div className="modal-gallery">
                <h2>Welcome to <span className="inline-teal inline-bold">vindro</span></h2>
                <p>Your play is saved. You can keep editing your group predictions until the stage closes.</p>
            </div>

            <div className="bottom-modal-gallery">
                <div className="bottom-modal-text">
                    <p>Pick a cool <span className="inline-teal inline-bold">avatar</span> and set your display name from your profile.</p>
                    <p>Create or join a <span className="inline-teal inline-bold">pool</span> to compete with friends and family.</p>
                </div>
                <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', paddingTop: '7px' }}>
                    <button className="btn btn-ghost-outline" onClick={onGoToProfile}>My Profile</button>
                    <button className="btn btn-tan" onClick={onDismiss}>Let's go!</button>
                </div>
            </div>
        </div>
    </div>
);

export default NewUserWelcomeModal;
