import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LogoutHelmet from '../page-helmets/LogoutHelmet';

const Logout = () => {
    const navigate = useNavigate();
    const { t } = useTranslation('logout');

    return (
        <main id="logout" className="ux-confirm-hero bg-black">
            <LogoutHelmet />
            <section className="hero-full">
                <div className="text-container">
                    <h1>logged<span className="inline-teal inline-bold">Out</span></h1>
                    <h2>{t('tagline')}</h2>
                </div>
            </section>
        </main>
    );
};

export default Logout;
