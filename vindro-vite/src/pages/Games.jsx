import React from 'react';
import { Link } from 'react-router-dom';
import ShowcaseSection from '../components/ui/ShowcaseSection';
import GameGalleryCard from '../components/pages/games/GameGalleryCard';
import GamesHelmet from '../page-helmets/GamesHelmet';


function Games() {

    return (

        <>
            <GamesHelmet />

            <main>

                <ShowcaseSection
                    classes="hero-half bg-black"
                >
                    <h1>play<span className="inline-bold inline-teal">Learn</span><span translate="no">Vindrogames</span></h1>
                    <h2>Ad-free games and apps which provide a context for developing language, critical thinking and attention. Or simply just fun.</h2>
                </ShowcaseSection>

                <section id="games-gallery-container">

                    <div id="games-gallery">

                        <GameGalleryCard
                            key="game-1"
                            route="/games/game-42"
                            galleryImg={
                                <img src="img/42-gallery-gif.gif" alt="Inspired by the boardgame The Mind our 42 game puts your reasoning and luck to the test" />
                            }
                            gameTitle="42 the game"
                            gameDescription="Inspired by the boardgame The Mind, our 42 game will test your reasoning, intuition and luck!"
                        />

                        <GameGalleryCard
                            key="game-2"
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

                        <GameGalleryCard
                            key="game-3"
                            route="https://set.vindrogames.com"
                            galleryImg={
                                <img src="img/setGame.png" alt="Set is a classNameic boardgame putting to the test your concentration and speed. This is vindrogame's solitaire version" />
                            }
                            gameTitle="Set"
                            gameDescription="A great boardgame we have recreated to play on screen. Simple but mentally exhausting, how many sets can you find?"
                        />

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