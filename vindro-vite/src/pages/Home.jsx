import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import HomeHelmet from "../page-helmets/HomeHelmet";
import ShowcaseSection from "../components/ui/ShowcaseSection";
import HomeAbout from '../components/pages/home/HomeAbout';

const Home = () => {
    const { t } = useTranslation('home');
    const scrollRef = useRef();

    return (
        <>
            <HomeHelmet />

            <main id="home-page">
                
                <ShowcaseSection
                    classes="hero-full bg-black"
                    showButton="true"
                    buttonText={t('hero.cta')}
                    buttonOnClick={() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' })}
                    buttonClasses="btn btn-tan"
                    buttonId="home-scroll-smooth"
                >
                    <h1 translate="no">
                        <span className="inline-bold inline-teal">Vindro</span>Games
                    </h1>
                    <h2>{t('hero.tagline')}</h2>
                </ShowcaseSection>

                <ShowcaseSection
                    id="what-we-do"
                    classes="hero-half bg-gray"
                    showButton="true"
                    buttonText={t('whatWeDo.cta')}
                    buttonTo="/games"
                    buttonOnClick={() => window.scrollTo({ top: 0, behavior: "instant" })}
                    buttonClasses="btn btn-tan"
                >
                    <h3 ref={scrollRef}>{t('whatWeDo.heading')}</h3>
                    <h4>{t('whatWeDo.subheading')}</h4>
                </ShowcaseSection>

                <HomeAbout />
            </main>

        </>
    )
}

export default Home;