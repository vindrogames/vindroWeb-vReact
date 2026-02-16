import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function PrivacyCookiesHelmet() {

    return (
        <Helmet>
            {/* Meta Description and Key Words */}
            <meta name="description" content="Vindrogames Privacy and Cookies policies, premium content with no ads" />
            <meta name="keywords" content="Add free  games, Games for learning, Vindrogames Development" />

            {/* OG Tags */}
            <meta property="og:type" content="website" />
            <meta property="og:url" content="https://www.vindrogames.com/privacy-cookies" />
            <meta property="og:title" content="Privacy & Cookies" />
            <meta property="og:description" content="We don't use ads and don't give your info to anybody" />
            <meta property="og:image" content="https://www.vindrogames.com/img/vindro-og.png" />
            <meta property="og:image:width" content="850" />
            <meta property="og:image:height" content="450" />
            <meta property="og:image:type" content="image/png" />

            <link rel="icon" type="image/x-icon" href="favicon_io/favicon.ico" />
            <title>Vindrogames | Privacy & Cookies</title>
        </Helmet>
    )
};