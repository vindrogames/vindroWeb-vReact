import React from 'react';
import { useState, useEffect } from 'react';
import StoryHelmet from './page-helmets/StoryHelmet';

function Story() {

  return (
    <>
      <StoryHelmet />

      <main>
        
        <section className="hero-half">
          <h1>our<span className="inline-bold inline-teal">Stories</span></h1>
          <h2>A timeline of our learnings and projects</h2>
        </section>

        <section id="stories-page-content">
          <div id="timeline">

          </div>
        </section>
      </main>
    </>
  )
};

export default Story;