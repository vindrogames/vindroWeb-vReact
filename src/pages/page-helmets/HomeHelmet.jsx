import React from 'react';
import { Helmet } from 'react-helmet-async';

function HomeHelmet() {

  return (
    <Helmet>
      {/* Meta Description and Key Words */}
      <meta name="description" content="an independant gaming project based in Madrid" />
      <meta name="keywords" content="learning, programming, game development, education innovation" />

      {/* OG Tags */}
      <meta property="og:type" content="website"/>
      <meta property="og:url" content="https://www.vindrogames.com" />
      <meta property="og:title" content="Vindrogames"/>
      <meta property="og:description" content="Small independant game studio based in Madrid, Spain"/>
      <meta property="og:image" content="https://www.vindrogames.com/img/vindro-og.png"/>
      <meta property="og:image:width" content="850" />
      <meta property="og:image:height" content="450" />
      <meta property="og:image:type" content="image/png" />

      <link rel="icon" type="image/x-icon" href="img/favicon_io/favicon.ico" />
      <title>Vindrogames | Learning and Programming</title>
    </Helmet>
  )
};

export default HomeHelmet;