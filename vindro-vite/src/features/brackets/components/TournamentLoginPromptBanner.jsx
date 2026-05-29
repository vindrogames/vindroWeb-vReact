import React from 'react';

const TournamentLoginPromptBanner = ({ isVisible, onDismiss, onOpenAuth }) => {
    return (
        <div className={`login-prompt-banner${isVisible ? ' is-visible' : ''}`}>
            <div className="banner-grid">

                <div className="banner-cta">
                    <h3>register to<span className="inline-teal inline-bold">Save</span></h3>
                    <p>Create a free account to lock in your predictions and compete in pools.</p>
                    <div className="banner-auth-buttons">
                        <button className="btn btn-ghost-outline" onClick={() => onOpenAuth('login')}>Log In</button>
                        <button className="btn btn-tan" onClick={() => onOpenAuth('signup')}>Sign Up</button>
                    </div>
                </div>

                <div className="banner-info">
                    <ol className="banner-steps">
                        <li>Create your <span className="inline-teal inline-bold">Plays</span> — make multiple sets of picks, and let your kids join in under your account</li>
                        <li>Submit plays to <span className="inline-teal inline-bold">Pools</span> to compete against friends and the public</li>
                        <li>Create your <span className="inline-teal inline-bold">own pool</span> and invite family, friends, or your office</li>
                    </ol>
                </div>

            </div>

            <button className="banner-dismiss" onClick={onDismiss}>Not yet</button>
        </div>
    );
};

export default TournamentLoginPromptBanner;
