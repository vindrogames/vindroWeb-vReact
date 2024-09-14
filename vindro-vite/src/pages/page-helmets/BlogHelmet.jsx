import React from 'react';
import { Helmet } from 'react-helmet-async';

function BlogHelm() {

  return (
    <Helmet>
      {/* Meta Description and Key Words */}
      <meta name="description" content="Vindrogames Blog where you can read more in depth about our projects, learnings and experiences as programmers" />
      <meta name="keywords" content="education games, games for learning, vindrogames productions, Google Workspace, Digital Competence" />

      {/* OG Tags */}
      <meta property="og:type" content="website"/>
      <meta property="og:url" content="https://www.vindrogames.com/blog.html" />
      <meta property="og:title" content="Vindrogames Blog"/>
      <meta property="og:description" content="Reflections of Game Design, programming and technology"/>
      <meta property="og:image" content="https://www.vindrogames.com/img/vindro-og.png"/>
      <meta property="og:image:width" content="850" />
      <meta property="og:image:height" content="450" />
      <meta property="og:image:type" content="image/png" />

      <link rel="icon" type="image/x-icon" href="img/favicon_io/favicon.ico" />
      <title>Vindrogames | Blog</title>
    </Helmet>
  )
};

export default BlogHelm;