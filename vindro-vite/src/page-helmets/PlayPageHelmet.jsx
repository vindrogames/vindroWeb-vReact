import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function PlayPageHelmet({ playName = 'Play', tournamentName = 'Tournament' }) {
    const title = `${playName} | ${tournamentName} — Vindro Brackets`;
    const description = `See ${playName}'s bracket predictions for ${tournamentName} on Vindrogames.`;

    return (
        <Helmet>
            <title>{title}</title>
            <meta name="description" content={description} />
            <meta name="keywords" content={`${tournamentName}, brackets, predictions, ${playName}, vindrogames`} />

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
