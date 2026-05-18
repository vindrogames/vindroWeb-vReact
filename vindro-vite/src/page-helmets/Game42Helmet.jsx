import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

export default function Game42Helmet() {
    const { t } = useTranslation('game-42');

    return (
        <Helmet>
            <meta name="description" content={t('meta.description')} />
            <meta name="keywords" content="42 The Game, Digital The Mind, Number Games, Games of Chance, Vindrogames 42, Probability Games" />

            <meta property="og:type" content="website" />
            <meta property="og:url" content="https://www.vindrogames.com/games/game-42" />
            <meta property="og:title" content={t('meta.ogTitle')} />
            <meta property="og:description" content={t('meta.ogDescription')} />
            <meta property="og:image" content="https://www.vindrogames.com/img/vindro-og.png" />
            <meta property="og:image:width" content="850" />
            <meta property="og:image:height" content="450" />
            <meta property="og:image:type" content="image/png" />

            <link rel="icon" type="image/x-icon" href="favicon_io/favicon.ico" />
            <title>{t('meta.title')}</title>
        </Helmet>
    );
};
