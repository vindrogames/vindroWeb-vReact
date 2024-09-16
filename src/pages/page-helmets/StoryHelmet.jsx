import React from 'react';
import { Helmet } from 'react-helmet-async';

function StoryHelmet() {

  return (

    <Helmet>
      {/* Meta Description and Key Words */}
      <meta name="description" content="Timeline of our projects and learnings of different programming languages to create different games and aplications" />
      <meta name="keywords" content="education games, games for learning, vindrogames productions, programming languages" />

      {/* OG Tags */}
      <meta property="og:type" content="website"/>
      <meta property="og:url" content="https://www.vindrogames.com/story.html" />
      <meta property="og:title" content="Vindrogames Stories"/>
      <meta property="og:description" content="Timeline of our productions and learning with different programming languages"/>
      <meta property="og:image" content="https://www.vindrogames.com/img/vindro-og.png"/>
      <meta property="og:image:width" content="850" />
      <meta property="og:image:height" content="450" />
      <meta property="og:image:type" content="image/png" />

      <link rel="icon" type="image/x-icon" href="img/favicon_io/favicon.ico" />
      <title>Vindrogames | Stories of programmers and gamers</title>
    </Helmet>
  )
};

export default StoryHelmet;