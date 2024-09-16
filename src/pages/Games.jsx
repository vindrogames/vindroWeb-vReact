import React from 'react';
import { Helmet } from 'react-helmet-async';

import { Link } from 'react-router-dom';
import GameGalleryCard from '../components/GameGalleryCard';


function Games() {

  return (

    <>
      <Helmet>
        <meta name="description" content="A collection of projects centered around games programmed in different lanugages at vindrogames in Madrid" />
        <meta name="keywords" content="education games, games for learning, vindrogames productions, programming languages" />
        <link rel="icon" type="image/x-icon" href="favicon_io/favicon.ico" />
        <title>Games for learning | Vindrogames</title>
      </Helmet>

      <main>

        <section className="hero-half-games">
          <div className="title-container">
            <h2>games</h2>
            <h2 className="inline-bold inline-teal">Learning</h2>
            <h2>Programming</h2>
          </div>
          <h1>play, learn, <span translate="no">vindrogames</span></h1>
        </section>

        <section id="games-gallery-container">
          <div id="games-gallery-intro">
            <h2>Play around with a few of our <span className="inline-bold inline-green">projects</span></h2>
            <p>Each of these projects are centered on creating games which provide a context for developing language, critical thinking, attention and can be tied to curricular standards.</p>
          </div>

          <div id="games-gallery">

            <div className="game game-1">
              <a href="/games/42-the-game/"><img src="img/42-gallery-gif.gif" alt="Inspired by the boardgame The Mind our 42 game puts your reasoning and luck to the test" /></a>
              <div className="game-text">
                <h3>42 the game</h3>
                <p>Inspired by the boardgame The Mind, our 42 game will test your reasoning, intuition and luck!</p>
              </div>
            </div>

            <GameGalleryCard
              classNum="game-2"
              route="/games/escape-the-cloud"
              galleryImg={
                <img src="img/escapeTheCloud.png" alt="Digital Escaperoom to learn about Google Workspace tools" />
              }
              gameTitle="Digital BreakOut"
              gameDescription="Inspired by Escape Rooms, this game teacher players tricks and functionalities of Google tools."
            />
            
            <div className="game game-3">
              <a href="#" >
                <img src="img/brainGame.png" alt="A zelda style role playing game to learn how the brain processes information" />
              </a>
              <div className="game-text">
                <h3>Brain Game</h3>
                <p>A role playing type game designed to teach people about the human brain and how we process visual information.</p>
              </div>
            </div>

            <div className="game game-4">
              <a href="https://set.vindrogames.com" target="_blank"><img src="img/setGame.png" alt="Set is a classNameic boardgame putting to the test your concentration and speed. This is vindrogame's solitaire version" /></a>
              <div className="game-text">
                <h3 translate="no">SET</h3>
                <p>A great boardgame we have recreated to play on screen. Simple but mentally exhausting, how many sets can you find?</p>
              </div>
            </div>

            <div className="game game-5">
              <a href="games/troyan-horse/play/" target="blank"><img src="img/greekTale.png" alt="A Greek Tale is a game with a metaphor of hacking computers with trojan horses by avoiding firewalls" /></a>
                <div className="game-text">
                  <h3>Trojan Horse</h3>
                  <p>A short game inspired by Troy with a digital spin. Can you send your Trojan Horses through all the firewalls?</p>
                </div>
            </div>

            <div className="game game-6">
              <a href="madrid-calculator/"><img src="img/madrid-calculator.png" alt="La calculadora madridista, calcula como siempre o por el número de champions del Real Madrid" /></a>
                <div className="game-text">
                  <h3>Calculadora Madridista</h3>
                  <p>Calcula como siempre o por el número de champions que tiene el Real Madrid.</p>
                </div>
            </div>

          </div>
        </section>
      </main>
    </>
  )
}

export default Games;