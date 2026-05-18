import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

export default function TournamentHelmet({ tournamentName = 'Tournament' }) {
    const { t } = useTranslation('tournament');
    const title = t('helmet.title', { name: tournamentName });
    const description = t('helmet.description', { name: tournamentName });

    return (
        <Helmet>
            <title>{title}</title>
            <meta name="description" content={description} />
            <meta name="keywords" content={`${tournamentName}, ${t('helmet.keywords')}`} />

            <meta property="og:type" content="website" />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content="https://www.vindrogames.com/img/vindro-og.png" />
            <meta property="og:image:width" content="850" />
            <meta property="og:image:height" content="450" />
            <meta property="og:image:type" content="image/png" />

            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content="https://www.vindrogames.com/img/vindro-og.png" />

            <link rel="icon" type="image/x-icon" href="favicon_io/favicon.ico" />
        </Helmet>
    );
}
