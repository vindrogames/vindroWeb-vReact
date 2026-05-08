import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/auth/AuthContext';
import ShowcaseSection from "./ShowcaseSection";

const WelcomeUserModal = ({ onClose }) => {
    const { user } = useAuth();
    const navigate = useNavigate();

    if (!user) return null;

    const handleGoToProfile = () => {
        onClose();
        navigate(`/user/${user.id}`, { state: { fromWelcome: true } });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content welcome-modal" onClick={(e) => e.stopPropagation()}>

                <button className="btn close-button" onClick={onClose} aria-label="Close">&times;</button>

                <ShowcaseSection id="welcome-user-gallery">
                    <h1 translate="no">Welcome!</h1>
                    <img
                        className="welcome-avatar"
                        src={user.avatar || '/img/profile_icons/teal-simple.webp'}
                        alt="Your avatar"
                    />
                    <h2 className="inline-bold">{user.username}</h2>
                </ShowcaseSection>


                <div className="auth-footer-wrapper">
                    <ShowcaseSection id="welcome-user-interaction">

                        <div className="welcome-text">
                            <h4>This is your userName and avatar.</h4>
                            <h4>You can edit them on your profile<span className='inline-teal inline-bold'>Page</span>.</h4>
                        </div>

                        <div className="welcome-buttons">
                            <button className="btn btn-tan" onClick={handleGoToProfile}>Go to Profile</button>
                            <button className="btn btn-tan" onClick={onClose}>Not Now</button>
                        </div>
                    </ShowcaseSection>
                </div>
            </div>
        </div>
    );
};

export default WelcomeUserModal;
