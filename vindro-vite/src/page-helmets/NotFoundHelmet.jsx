import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

export default function NotFoundHelmet() {
    const { t } = useTranslation('not-found');
    return (
        <Helmet>
            <title>{t('meta.title')}</title>
            <meta name="description" content={t('meta.description')} />
            <meta name="robots" content="noindex, nofollow" />
            <link rel="icon" type="image/x-icon" href="favicon_io/favicon.ico" />
        </Helmet>
    );
}
