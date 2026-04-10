import { useRef } from 'react';
import HomeHelmet from "../page-helmets/HomeHelmet";
import ShowcaseSection from "../components/ui/ShowcaseSection";
import HomeAbout from '../components/pages/home/HomeAbout';

const Home = () => {

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

                <HomeAbout />
            </main>

        </>
    )
}

export default Home;