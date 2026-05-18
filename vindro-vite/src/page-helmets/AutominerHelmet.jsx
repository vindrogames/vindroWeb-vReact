import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

export default function AutominerHelmet() {

    const { t } = useTranslation('autominer');

    return (
        <Helmet>
            <meta name="description" content={t('meta.description')} />
            <meta name="keywords" content="React Idle Game, Vindrogames Autominer, Autominer Idle Game" />

            <meta property="og:type" content="website" />
            <meta property="og:url" content="https://www.vindrogames.com/games/auto-miner" />
            <meta property="og:title" content={t('meta.title')} />
            <meta property="og:description" content={t('meta.description')} />
            <meta property="og:image" content="https://www.vindrogames.com/img/vindro-og.png" />
            <meta property="og:image:width" content="850" />
            <meta property="og:image:height" content="450" />
            <meta property="og:image:type" content="image/png" />

            <link rel="icon" type="image/x-icon" href="favicon_io/favicon.ico" />
            <title>{t('meta.title')}</title>
        </Helmet>
    );
}
