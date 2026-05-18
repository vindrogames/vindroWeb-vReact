import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import NotFoundHelmet from '../page-helmets/NotFoundHelmet';

const NotFoundPage = () => {
    const navigate = useNavigate();
    const { t } = useTranslation('not-found');

    return (
        <main id="not-found-page" className="ux-confirm-hero bg-black">
            <NotFoundHelmet />
            <section className="hero-full">
                <div className="text-container">
                    <h1>vindro<span className="inline-teal inline-bold">404</span></h1>
                    <div className="subtext-container">
                        <h2 className="not-found-subtitle">{t('subtitle')}</h2>
                        <h2>{t('subtext')}</h2>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default NotFoundPage;
