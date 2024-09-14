import React from "react";
import { useRef } from 'react';
import { Helmet } from 'react-helmet-async';

function Home() {

  const scrollRef = useRef();

  return (
    <>
      <Helmet>
        <meta name="description" content="an independant gaming project based in Madrid" />
        <meta name="keywords" content="learning, programming, game development, education innovation" />
        <link rel="icon" type="image/x-icon" href="favicon_io/favicon.ico" />
        <title>Vindrogames | Learning and Programming</title>
      </Helmet>

      <main>
        <section className="hero-full hero-full-home-content">
          <h1 translate="no">
            <span className="inline-bold inline-teal">Vindro</span>Games
          </h1>
          <h2>An independant gaming project based in Madrid</h2>
          <button 
            id="home-smooth-scroll"
            className="btn btn-tan"
            onClick={() => scrollRef.current?.scrollIntoView({
              behavior: 'smooth'
            })}>Let's Play
          </button>
        </section>

        <section id="what-we-do" ref={ scrollRef } className="bg-gray">
          <h3>This is what we do</h3>
          <h4 className="inline-bold inline-green">Games</h4>
          <p>We learn to programm creating <span className="inline-bold inline-green">(and recreating)</span> games. Many of our games are focused on learning.</p> 
          <a href="games.html" className="btn btn-black">start</a>
        </section>

        <section id="home-about" className="bg-tan">
          <div className="team-container">
            <div className="team-member">
              <img src="img/fer_vindro_good.png" alt="Fernando Giménez Cacho is a Software engineer specialized in cloud security"></img>
              <div>
                <h3 className="inline-bold inline-green" translate="no">Zeneke</h3>
                <p><span translate="no">Fernando Giménez</span> is a Computer Engineer working primarily in cloud services and security.</p>
                </div>
              </div>
            <div className="team-member">
              <img src="img/mike_vindro_good.png" alt="Michael Thomas Bennett is a creative teacher gone programmer"></img>
              <div>
                <h3 className="inline-bold inline-green" translate="no">Mikelele</h3>
                <p><span translate="no">Michael Bennett</span> works in education as a University teacher, Teacher trainer and Education Innovation consultant.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

    </>
  )
}

export default Home;