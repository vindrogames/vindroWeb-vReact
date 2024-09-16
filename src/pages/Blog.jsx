import React from 'react';
import BlogHelmet from './page-helmets/BlogHelmet';

function Blog() {

  return (
    <>
      <BlogHelmet />
      <main>
        <section className="hero-half">
          <h1>our<span className="inline-bold inline-teal">Blog</span></h1>
          <h2>A digital journal dedicated to learning and programming</h2>
        </section>

        <section id="under-construction">
          <div className="loading">
            <h1>Pronto jugaremos</h1>
            <div className="loader">
              <span className="loader-element"></span>
              <span className="loader-element"></span>
              <span className="loader-element"></span>
            </div>
          </div>
        </section>
      </main>
    </>
  )
};

export default Blog;