import React from 'react';
import { Helmet } from 'react-helmet-async';

function EscapeCloudHelmet() {

  return (

    <Helmet>
      {/* Meta Description and Key Words */}
      <meta name="description" content="A digital Escape room desinged to teach people how to use Google Wokspace Tools and build digital competence" />
      <meta name="keywords" content="education games, games for learning, vindrogames productions, Google Workspace, Digital Competence" />

      {/* OG Tags */}
      <meta property="og:type" content="website"/>
      <meta property="og:url" content="https://www.vindrogames.com/escape-the-cloud" />
      <meta property="og:title" content="Escape the Cloud"/>
      <meta property="og:description" content="Learning Experience inspired by Escape Rooms to develop Digital Competence with Google Tools"/>
      <meta property="og:image" content="https://www.vindrogames.com/img/escapeTheCloud-og.png"/>
      <meta property="og:image:width" content="850" />
      <meta property="og:image:height" content="450" />
      <meta property="og:image:type" content="image/png /" />

      <link rel="icon" type="image/x-icon" href="img/favicon_io/favicon.ico" />
      <title>Escape the Cloud | Digital Escape Room to learn how to use Google Tools</title>
    </Helmet>
  )
};

export default EscapeCloudHelmet;