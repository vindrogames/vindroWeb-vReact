import React from 'react';
import BracketHelmet from '../page-helmets/BracketHelmet';
import ShowcaseSection from '../components/ui/ShowcaseSection';
import BracketEventCard from '../components/pages/brackets/BracketEventCard';

const Brackets = () => {

    return (

        <>
            <BracketHelmet />

            <main id="brackets-page">

                <ShowcaseSection
                    classes="hero-half bg-black"
                >
                    <h1>vindro<span className="inline-bold inline-teal">Brackets</span></h1>
                    <h2>Join an event, complete a bracket and enter a pool. Easy</h2>
                </ShowcaseSection>

                <section id="brackets-events-container">

                    <div id="brackets-events-gallery">

                        <BracketEventCard
                            key="bracket-event-1"
                            eventTitle="World Cup 2026"
                            phases={{
                                groupPhases: ["48 Teams", "Points for Correct Picks", "Reset Bracket"],
                                bracketPhases: ["Round of 32", "Round of 16", "Quarter-finals", "Semi-finals", "Finals"]
                            }}
                            startDate="Start: Jun 11, 2026"
                            route='/brackets/world-cup-2026'
                        />


                    </div>
                </section>
            </main>
        </>

    )
}

export default Brackets;