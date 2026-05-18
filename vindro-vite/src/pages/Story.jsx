import React from 'react';
import { useTranslation } from 'react-i18next';
import StoryHelmet from '../page-helmets/StoryHelmet';
import ShowcaseSection from '../components/ui/ShowcaseSection';
import TimelineCard from '../components/pages/stories//TimelineCard';

const Story = () => {
    const { t } = useTranslation('story');

    return (
        <>
            <StoryHelmet />

            <main id="stories">

                <ShowcaseSection
                    classes="hero-half bg-black"
                >
                    <h1>{t('hero.pre')}<span className="inline-bold inline-teal">{t('hero.highlight')}</span></h1>
                    <h2>{t('hero.tagline')}</h2>
                </ShowcaseSection>

                <section id="stories-page-content">
                    <div id="timeline">
                        <ul>
                            {['1','2','3','4','5','6','7','8','9','10'].map(num => (
                                <li key={num} className='card show'>
                                    <TimelineCard
                                        cardNum={num}
                                        title={t(`cards.${num}.title`)}
                                        text={t(`cards.${num}.text`)}
                                    />
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>
            </main>
        </>
    )
};

export default Story;