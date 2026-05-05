import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function MadridCalculatorHelmet() {
    return (
        <Helmet>
            <title>Madrid Calculator | Vindrogames</title>
            <meta name="description" content="The Real Madrid Champions League Calculator. Do the math like a Galáctico." />
            <meta name="keywords" content="madrid calculator, real madrid, champions league, vindrogames, calculator" />

            <meta property="og:type" content="website" />
            <meta property="og:url" content="https://www.vindrogames.com/games/madrid-calculator" />
            <meta property="og:title" content="Madrid Calculator | Vindrogames" />
            <meta property="og:description" content="The Real Madrid Champions League Calculator. Do the math like a Galáctico." />
            <meta property="og:image" content="https://www.vindrogames.com/img/vindro-og.png" />
            <meta property="og:image:width" content="850" />
            <meta property="og:image:height" content="450" />
            <meta property="og:image:type" content="image/png" />

            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content="Madrid Calculator | Vindrogames" />
            <meta name="twitter:description" content="The Real Madrid Champions League Calculator." />
            <meta name="twitter:image" content="https://www.vindrogames.com/img/vindro-og.png" />

            <link rel="icon" type="image/x-icon" href="favicon_io/favicon.ico" />
        </Helmet>
    );
}
