import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

export default function MadridCalculatorHelmet() {
    const { t } = useTranslation('madrid-calculator');

    return (
        <Helmet>
            <meta name="description" content={t('meta.description')} />
            <meta name="keywords" content="madrid calculator, real madrid, champions league, vindrogames, calculator" />

            <meta property="og:type" content="website" />
            <meta property="og:url" content="https://www.vindrogames.com/games/madrid-calculator" />
            <meta property="og:title" content={t('meta.ogTitle')} />
            <meta property="og:description" content={t('meta.ogDescription')} />
            <meta property="og:image" content="https://www.vindrogames.com/img/vindro-og.png" />
            <meta property="og:image:width" content="850" />
            <meta property="og:image:height" content="450" />
            <meta property="og:image:type" content="image/png" />

            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={t('meta.twitterTitle')} />
            <meta name="twitter:description" content={t('meta.twitterDescription')} />
            <meta name="twitter:image" content="https://www.vindrogames.com/img/vindro-og.png" />

            <link rel="icon" type="image/x-icon" href="favicon_io/favicon.ico" />
            <title>{t('meta.title')}</title>
        </Helmet>
    );
}
