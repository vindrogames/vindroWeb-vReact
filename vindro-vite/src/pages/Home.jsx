import React from "react";
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import HomeHelmet from "../page-helmets/HomeHelmet";
import ShowcaseSection from "../components/ui/ShowcaseSection";

function Home() {

    const scrollRef = useRef();

    return (
        <>
            <HomeHelmet />

            <main id="home-page">
                
                <ShowcaseSection
                    classes="hero-full bg-black"
                    showButton="true"
                    buttonText="Let's Play"
                    buttonOnClick={() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' })}
                    buttonClasses="btn btn-tan"
                    buttonId="home-scroll-smooth"
                >
                    <h1 translate="no">
                        <span className="inline-bold inline-teal">Vindro</span>Games
                    </h1>
                    <h2>An independant gaming project based in Madrid</h2>
                </ShowcaseSection>

                <ShowcaseSection
                    id="what-we-do"
                    classes="hero-half bg-gray"
                    showButton="true"
                    buttonText="Start"
                    buttonTo="/games"
                    buttonOnClick={() => window.scrollTo({ top: 0, behavior: "instant" })}
                    buttonClasses="btn btn-tan"

                >
                    <h3 ref={scrollRef}>We learn to code by developing Games and Apps.</h3>
                    <h4>They are designed to boost thinking, promote learning and enhance mental growth.</h4>
                </ShowcaseSection>

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