import React from 'react';
import { useTranslation, Trans } from 'react-i18next';

const TournamentLoginPromptBanner = ({ isVisible, onDismiss, onOpenAuth }) => {
    const { t } = useTranslation('play');

    return (
        <div className={`login-prompt-banner${isVisible ? ' is-visible' : ''}`}>
            <div className="banner-grid">

                <div className="banner-cta">
                    <h3>
                        <Trans
                            i18nKey="loginBanner.title"
                            ns="play"
                            components={{ teal: <span className="inline-teal inline-bold" /> }}
                        />
                    </h3>
                    <p>{t('loginBanner.subtitle')}</p>
                    <div className="banner-auth-buttons">
                        <button className="btn btn-tan" onClick={() => onOpenAuth('signup')}>{t('loginBanner.signUp')}</button>
                    </div>
                    <button className="banner-not-yet" onClick={onDismiss}>{t('loginBanner.notYet')}</button>
                </div>

                <div className="banner-info">
                    <div className="banner-steps">
                        <div className="banner-step">
                            <span className="step-num">1</span>
                            <p>
                                <Trans
                                    i18nKey="loginBanner.step1"
                                    ns="play"
                                    components={{ teal: <span className="inline-teal inline-bold" /> }}
                                />
                            </p>
                        </div>
                        <div className="banner-step">
                            <span className="step-num">2</span>
                            <p>
                                <Trans
                                    i18nKey="loginBanner.step2"
                                    ns="play"
                                    components={{ teal: <span className="inline-teal inline-bold" /> }}
                                />
                            </p>
                        </div>
                        <div className="banner-step">
                            <span className="step-num">3</span>
                            <p>
                                <Trans
                                    i18nKey="loginBanner.step3"
                                    ns="play"
                                    components={{ teal: <span className="inline-teal inline-bold" /> }}
                                />
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default TournamentLoginPromptBanner;
