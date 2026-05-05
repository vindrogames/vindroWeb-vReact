import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function UserProfileHelmet({ username = 'Player' }) {
    const title = `${username} | Vindrogames Profile`;
    const description = `View ${username}'s bracket predictions, scores and activity on Vindrogames.`;

    return (
        <Helmet>
            <title>{title}</title>
            <meta name="description" content={description} />
            <meta name="keywords" content={`${username}, vindrogames, profile, brackets, scores`} />

            <meta property="og:type" content="profile" />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content="https://www.vindrogames.com/img/vindro-og.png" />
            <meta property="og:image:width" content="850" />
            <meta property="og:image:height" content="450" />
            <meta property="og:image:type" content="image/png" />

            <meta name="twitter:card" content="summary" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />

            <link rel="icon" type="image/x-icon" href="favicon_io/favicon.ico" />
        </Helmet>
    );
}
