import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function AutominerHelmet() {

    return (

        <Helmet>
            {/* Meta Description and Key Words */}
            <meta name="description" content="Autominer Idle Game by Vindrogames. Automate mining, leave your tab open, and max out!" />
            <meta name="keywords" content="React Idle Game, Vindrogames Autominer, Autominer Idle Game" />

            {/* OG Tags */}
            <meta property="og:type" content="website" />
            <meta property="og:url" content="https://www.vindrogames.com/games/auto-miner" />
            <meta property="og:title" content="Autominer | Vindrogames" />
            <meta property="og:description" content="Autominer Idle Game" />
            <meta property="og:image" content="https://www.vindrogames.com/img/vindro-og.png" />
            <meta property="og:image:width" content="850" />
            <meta property="og:image:height" content="450" />
            <meta property="og:image:type" content="image/png" />

            <link rel="icon" type="image/x-icon" href="favicon_io/favicon.ico" />
            <title>Autominer | Vindrogames</title>
        </Helmet>
    )
};