import React from 'react';
import { useTranslation } from 'react-i18next';
import EscapeCloudHelmet from '../../page-helmets/EscapeCloudHelmet';
import ShowcaseSection from '../../components/ui/ShowcaseSection';

const EscapeTheCloud = () => {
    const { t } = useTranslation('escape-cloud');

    return (
        <>
            <EscapeCloudHelmet />
            <main id="escape-the-cloud">

                <ShowcaseSection classes="hero-half bg-black">
                    <h1>escape<span className="inline-bold inline-teal">The</span>Cloud</h1>
                    <h2>{t('hero.tagline')}</h2>
                </ShowcaseSection>

                <section id="escape-the-cloud-container">

                    <div id="escape-the-cloud-trailer">
                        <video controls>
                            <source src="/video/Escape_the_Cloud_Trailor.mp4" type="video/mp4" />
                            {t('info.videoUnsupported')}
                        </video>
                    </div>

                    <div id="escape-the-cloud-info">
                        <p>{t('info.p1')}</p>
                        <p>
                            <span className="inline-bold inline-green">{t('info.p2Bold')}</span>
                            {t('info.p2Rest')}
                        </p>
                        <div className="buttons">
                            <a href="https://forms.gle/cXWsncFLb14cDqkK8" className="btn btn-tan" target="_blank" translate="no">Play in English</a>
                            <a href="https://forms.gle/PfpCTF4jrmYz6SnB8" className="btn btn-tan" target="_blank" translate="no">Jugar en Español</a>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
};

export default EscapeTheCloud;
