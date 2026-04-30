import React from 'react';
import { Link } from 'react-router-dom';
import ShowcaseSection from '../components/ui/ShowcaseSection';
import GameGalleryCard from '../components/pages/games/GameGalleryCard';
import GamesHelmet from '../page-helmets/GamesHelmet';


const Games = () => {

    return (

        <>
            <GamesHelmet />

            <main id="games-showcase">

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
                            route="/games/auto-miner"
                            galleryImg={
                                <img src="/img/auto-miner-gallery.webp" alt="Autominer, an Idle Game by Vindrogames" />
                            }
                            gameTitle="Autominer"
                            gameDescription="An idle game. Start mining, automate production and leave your tab open."
                        />

                        <GameGalleryCard
                            key="game-2"
                            route="/games/game-42"
                            galleryImg={
                                <img src="/img/42-gallery-gif.gif" alt="42 The Game, test your reasoning, intuition, probability and luck to reach 42!" />
                            }
                            gameTitle="42 the game"
                            gameDescription="Inspired by The Mind boardgame, our 42 game will test your reasoning, intuition and luck!"
                        />

                        <GameGalleryCard
                            key="game-3"
                            route="/games/escape-the-cloud"
                            galleryImg={
                                <img src="/img/escapeTheCloud.webp" alt="Digital Escaperoom to learn about Google Workspace tools" />
                            }
                            gameTitle="Digital BreakOut"
                            gameDescription="Inspired by Escape Rooms, this game teacher players tricks and functionalities of Google tools."
                        />

                        <GameGalleryCard
                            key="game-4"
                            route="https://cerebro.vindrogames.com"
                            galleryImg={
                                <img src="/img/brainGame.webp" alt="A zfantasy style RPG to learn how the brain processes information" />
                            }
                            gameTitle="Brain Game"
                            gameDescription="A role playing type game designed to teach people about the human brain and how we process visual information."
                        />

                        <GameGalleryCard
                            key="game-5"
                            route="https://set.vindrogames.com"
                            galleryImg={
                                <img src="/img/setGame.webp" alt="Set is a classNameic boardgame putting to the test your concentration and speed. This is vindrogame's solitaire version" />
                            }
                            gameTitle="Set"
                            gameDescription="A great boardgame we have recreated to play on screen. Simple but mentally exhausting, how many sets can you find?"
                        />

                        <GameGalleryCard
                            key="game-6"
                            route="https://greek-tale.vindrogames.com"
                            galleryImg={
                                <img src="/img/greekTale.webp" alt="A Greek Tale is a game with a metaphor of hacking computers with trojan horses by avoiding firewalls" />
                            }
                            gameTitle="A Greek Tale"
                            gameDescription="A short game inspired by Troy with a digital spin. Can you send your Trojan Horses through all the firewalls?"
                        />

                        <GameGalleryCard
                            key="game-7"
                            route="/games/madrid-calculator"
                            galleryImg={
                                <img src="/img/madrid-calculator.webp" alt="La calculadora madridista, calcula como siempre o por el número de champions del Real Madrid" />
                            }
                            gameTitle="Calculadora Madridista"
                            gameDescription="Calcula como siempre o por el número de champions que tiene el Real Madrid"
                        />

                    </div>
                </section>
            </main>
        </>
    )
}

export default Games;