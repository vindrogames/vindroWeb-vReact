import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function BracketHelmet() {

    return (

        <Helmet>
            {/* Meta Description and Key Words */}
            <meta name="description" content="Easy, fun and stylish brackets for you and your friends." />
            <meta name="keywords" content="World Cup Brackets, Football Brackets, Friend Bracket Groups, Vindrogame Brackets" />

            {/* OG Tags */}
            <meta property="og:type" content="website" />
            <meta property="og:url" content="https://www.vindrogames.com/brackets" />
            <meta property="og:title" content="Vindro Brackets" />
            <meta property="og:description" content="Easy, fun and stylish brackets for you and your friends." />
            <meta property="og:image" content="https://www.vindrogames.com/img/vindro-og.png" />
            <meta property="og:image:width" content="850" />
            <meta property="og:image:height" content="450" />
            <meta property="og:image:type" content="image/png" />

            <link rel="icon" type="image/x-icon" href="favicon_io/favicon.ico" />
            <title>Vindrogames | Brackets</title>
        </Helmet>
    )
};