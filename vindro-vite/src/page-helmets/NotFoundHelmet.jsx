import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function NotFoundHelmet() {
    return (
        <Helmet>
            <title>404 — Page Not Found | Vindrogames</title>
            <meta name="description" content="This page doesn't exist on Vindrogames." />
            <meta name="robots" content="noindex, nofollow" />
            <link rel="icon" type="image/x-icon" href="favicon_io/favicon.ico" />
        </Helmet>
    );
}
