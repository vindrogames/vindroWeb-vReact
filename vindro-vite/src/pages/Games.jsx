import React from 'react';
import { useTranslation } from 'react-i18next';
import ShowcaseSection from '../components/ui/ShowcaseSection';
import GameGalleryCard from '../components/pages/games/GameGalleryCard';
import GamesHelmet from '../page-helmets/GamesHelmet';


const Games = () => {
    const { t } = useTranslation('games');

    return (

        <>
            <GamesHelmet />

            <main id="games-showcase">

                <ShowcaseSection
                    classes="hero-half bg-black"
                >
                    <h1>play<span className="inline-bold inline-teal">Learn</span><span translate="no">Vindrogames</span></h1>
                    <h2>{t('hero.tagline')}</h2>
                </ShowcaseSection>

                <section id="games-gallery-container">

                    <div id="games-gallery">

                        <GameGalleryCard
                            key="game-1"
                            route="/games/auto-miner"
                            galleryImg={<img src="/img/auto-miner-gallery.webp" alt="Autominer, an Idle Game by Vindrogames" />}
                            gameTitle="Autominer"
                            gameDescription={t('cards.autominer.description')}
                        />

                        <GameGalleryCard
                            key="game-2"
                            route="/games/game-42"
                            galleryImg={<img src="/img/42-gallery-gif.gif" alt="42 The Game, test your reasoning, intuition, probability and luck to reach 42!" />}
                            gameTitle="42 the game"
                            gameDescription={t('cards.game42.description')}
                        />

                        <GameGalleryCard
                            key="game-3"
                            route="/games/escape-the-cloud"
                            galleryImg={<img src="/img/escapeTheCloud.webp" alt="Digital Escaperoom to learn about Google Workspace tools" />}
                            gameTitle="Digital BreakOut"
                            gameDescription={t('cards.breakout.description')}
                        />

                        <GameGalleryCard
                            key="game-4"
                            route="https://cerebro.vindrogames.com"
                            galleryImg={<img src="/img/brainGame.webp" alt="A fantasy style RPG to learn how the brain processes information" />}
                            gameTitle="Brain Game"
                            gameDescription={t('cards.brainGame.description')}
                        />

                        <GameGalleryCard
                            key="game-5"
                            route="https://set.vindrogames.com"
                            galleryImg={<img src="/img/setGame.webp" alt="Set is a classic boardgame putting to the test your concentration and speed" />}
                            gameTitle="Set"
                            gameDescription={t('cards.set.description')}
                        />

                        <GameGalleryCard
                            key="game-6"
                            route="https://greek-tale.vindrogames.com"
                            galleryImg={<img src="/img/greekTale.webp" alt="A Greek Tale is a game with a metaphor of hacking computers with trojan horses by avoiding firewalls" />}
                            gameTitle="A Greek Tale"
                            gameDescription={t('cards.greekTale.description')}
                        />

                        <GameGalleryCard
                            key="game-7"
                            route="/games/madrid-calculator"
                            galleryImg={<img src="/img/madrid-calculator.webp" alt="La calculadora madridista, calcula como siempre o por el número de champions del Real Madrid" />}
                            gameTitle="Calculadora Madridista"
                            gameDescription={t('cards.calculator.description')}
                        />

                    </div>
                </section>
            </main>
        </>
    )
}

export default Games;