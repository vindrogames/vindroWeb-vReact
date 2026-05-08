import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function LogoutHelmet() {
    return (
        <Helmet>
            <title>Logged Out | Vindrogames</title>
            <meta name="description" content="You have been logged out of Vindrogames." />
            <meta name="robots" content="noindex, nofollow" />
            <link rel="icon" type="image/x-icon" href="favicon_io/favicon.ico" />
        </Helmet>
    );
}
