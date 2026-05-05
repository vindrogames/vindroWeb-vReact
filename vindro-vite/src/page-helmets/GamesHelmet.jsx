import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function GamesHelmet() {

    return (
        <Helmet>
            {/* Meta Description and Key Words */}
            <meta name="description" content="Games and apps developed for learning and entertainment" />
            <meta name="keywords" content="learning, programming, game development, education innovation, games for learning" />

            {/* OG Tags */}
            <meta property="og:type" content="website" />
            <meta property="og:url" content="https://www.vindrogames.com/games" />
            <meta property="og:title" content="vindroGames & Apps" />
            <meta property="og:description" content="Play around with our different Apps and Games developed here at Vindrogames" />
            <meta property="og:image" content="https://www.vindrogames.com/img/vindro-og.png" />
            <meta property="og:image:width" content="850" />
            <meta property="og:image:height" content="450" />
            <meta property="og:image:type" content="image/png" />

            <link rel="icon" type="image/x-icon" href="favicon_io/favicon.ico" />
            <title>Vindrogames | Games & Apps</title>
        </Helmet>
    )
};