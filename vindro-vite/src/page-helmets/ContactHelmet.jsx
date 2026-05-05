import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function ContactHelmet() {

    return (

        <Helmet>
            {/* Meta Description and Key Words */}
            <meta name="description" content="Contact Vindrogames for colaborations or services" />
            <meta name="keywords" content="Learn to program, Digital Competence made fun, Vindrogames Madrid" />

            {/* OG Tags */}
            <meta property="og:type" content="website" />
            <meta property="og:url" content="https://www.vindrogames.com/contact" />
            <meta property="og:title" content="Vindrogames | Contact" />
            <meta property="og:description" content="Contact Vindrogames" />
            <meta property="og:image" content="https://www.vindrogames.com/img/vindro-og.png" />
            <meta property="og:image:width" content="850" />
            <meta property="og:image:height" content="450" />
            <meta property="og:image:type" content="image/png" />

            <link rel="icon" type="image/x-icon" href="favicon_io/favicon.ico" />
            <title>Vindrogames | Contact</title>
        </Helmet>
    )
};