import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import BracketHelmet from '../page-helmets/BracketHelmet';
import ShowcaseSection from '../components/ui/ShowcaseSection';
import BracketEventCardLive from '../components/pages/brackets/BracketEventCardLive';
import tournamentServices from '../features/brackets/services/tournamentServices';

const Brackets = () => {
    const { t } = useTranslation('brackets');
    const [tournaments, setTournaments] = useState([]);

    useEffect(() => {
        tournamentServices.getAllTournaments()
            .then(res => { if (res?.data) setTournaments(res.data); })
            .catch(() => {});
    }, []);

    return (
        <>
            <BracketHelmet />

            <main id="brackets-page">

                <ShowcaseSection classes="hero-half bg-black">
                    <h1>vindro<span className="inline-bold inline-teal">Brackets</span></h1>
                    <h2>{t('hero.tagline')}</h2>
                </ShowcaseSection>

                <section id="brackets-events-container">
                    <div id="brackets-events-gallery">
                        {tournaments.map(tournament => (
                            <BracketEventCardLive
                                key={tournament.id}
                                tournament={tournament}
                            />
                        ))}
                    </div>
                </section>
            </main>
        </>
    );
};

export default Brackets;
