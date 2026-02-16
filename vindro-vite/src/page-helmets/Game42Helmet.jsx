import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function Game42Helmet() {

    return (

        <Helmet>
            {/* Meta Description and Key Words */}
            <meta name="description" content="42 the game. A game of Probability, Luck and Cunnning. Reach the meaning of life, the universe and everything" />
            <meta name="keywords" content="42 The Game, Digital The Mind, Number Games, Games of Chance, Vindrogames 42, Probability Games" />

            {/* OG Tags */}
            <meta property="og:type" content="website" />
            <meta property="og:url" content="https://www.vindrogames.com/games/game-42" />
            <meta property="og:title" content="42 the Game" />
            <meta property="og:description" content="A game of Probability and Luck" />
            <meta property="og:image" content="https://www.vindrogames.com/img/vindro-og.png" />
            <meta property="og:image:width" content="850" />
            <meta property="og:image:height" content="450" />
            <meta property="og:image:type" content="image/png" />

            <link rel="icon" type="image/x-icon" href="favicon_io/favicon.ico" />
            <title>42 The Game | Vindrogames</title>
        </Helmet>
    )
};