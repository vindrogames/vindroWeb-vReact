import React, { useState, useEffect } from 'react';
import { getBackendUrl } from '../../services/api';
import ShowcaseSection from "./ShowcaseSection";
import LoginHelmet from '../../page-helmets/LoginHelmet';

/**
 * AuthModal Component
 * 
 * Props:
 *   isOpen: Boolean - Controls modal visibility
 *   onClose: Function - Called when modal should close
 *   redirectTo: String - Optional redirect URL after successful login
 *             If provided, appended to OAuth URL as 'next' query parameter
 *             Allows users to stay on the current page after authentication
 *   defaultMode: String - 'login' or 'signup' - Initial tab to show (default: 'login')
 */
const AuthModal = ({ isOpen, onClose, redirectTo = null, defaultMode = 'login' }) => {

    const [isSignUp, setIsSignUp] = useState(defaultMode === 'signup');
    const [isFading, setIsFading] = useState(false);

    // Update sign up state based on defaultMode whenever the modal opens
    useEffect(() => {
        if (isOpen) {
            setIsSignUp(defaultMode === 'signup');
            setIsFading(false);
        }
    }, [isOpen, defaultMode]);

    if (!isOpen) return null;

    const handleLogin = (provider) => {
        const backendUrl = getBackendUrl();
        const finalRedirect = redirectTo || window.location.href;

        let oauthUrl = `${backendUrl}/accounts/${provider}/login/`;
        const encodedRedirect = encodeURIComponent(finalRedirect);
        oauthUrl += `?next=${encodedRedirect}`;

        // Flag for checkAuth to show the loader when the user returns from OAuth
        sessionStorage.setItem('oauth_pending', '1');
        window.location.href = oauthUrl;
    };

    const toggleAuthMode = () => {
        setIsFading(true);
        setTimeout(() => {
            setIsSignUp(!isSignUp);
            setIsFading(false);
        }, 300);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <LoginHelmet />

            <div
                className={`modal-content auth-modal-layout ${isFading ? 'is-fading' : ''}`}
                onClick={(e) => e.stopPropagation()}
            >
                <button className="btn close-button" onClick={onClose} aria-label="Close modal">&times;</button>

                <ShowcaseSection id="social-signup-gallery">
                    <h1 translate="no">
                        {isSignUp ? "Sign" : "Log"}<span className="inline-bold inline-teal">{isSignUp ? "Up" : "In"}</span>
                    </h1>

                    <div className="social-login">
                        <button type="button" onClick={() => handleLogin('google')} className="btn btn-social btn-google">
                            {/* ... Google SVG ... */}
                            <svg className="google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            {isSignUp ? "Sign up with Google" : "Continue with Google"}
                        </button>

                        <button type="button" onClick={() => handleLogin('github')} className="btn btn-social btn-github">
                            {/* ... GitHub SVG ... */}
                            <svg className="github-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path fill="currentColor" d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                            </svg>
                            {isSignUp ? "Sign up with GitHub" : "Continue with GitHub"}
                        </button>
                    </div>
                </ShowcaseSection>

                <div className="auth-footer-wrapper">
                    {isSignUp ? (
                        <ShowcaseSection className="no-account-container signup-view">
                            <div id="sign-up-header" className="auth-info-header">
                                <h3>The full vindro<span className='inline-teal inline-bold'>Experience</span></h3>
                            </div>

                            <div className="auth-info">
                                <h4>Choose a cool Avatar</h4>
                                <h4>Save your scores from different games</h4>
                                <h4>Participate in different bracket events</h4>
                                <h4>We don't share your data</h4>
                                <h4>We don't do ads</h4>
                            </div>

                            <div className="legal-info">

                                <h5>If we detect you have already signed up with a selected provider, you will be logged in directly.</h5>
                                <p>*By signing up, you agree to our Terms and Privacy Policy</p>
                            </div>
                        </ShowcaseSection>
                    ) : (
                        <ShowcaseSection className="no-account-container login-view">
                            <div className="auth-info-header">
                                <h3>No Account?</h3>
                            </div>
                            <div className="auth-info">
                                <h4>Join us for the full vindro<span className='inline-teal inline-bold'>Experience</span></h4>
                                <p>We make it easy.</p>
                                <p>No password needed</p>
                            </div>

                            <div className="modal-footer-toggle">
                                <button className="toggle-link btn btn-tan" onClick={toggleAuthMode}>Sign Up</button>
                                <h5>You may have more than 1 account through different providers.</h5>
                            </div>
                        </ShowcaseSection>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthModal;