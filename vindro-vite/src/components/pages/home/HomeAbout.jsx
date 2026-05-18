import { useTranslation } from 'react-i18next';
import TeamMember from "./TeamMember";

const HomeAbout = () => {
    const { t } = useTranslation('home');

    return (

        <section id="home-about" className="hero-half bg-tan">
            <div className="team-container">
                <TeamMember
                    imgSource="img/fer-vindro-good.webp"
                    imgAltText={t('about.fer.alt')}
                    memberName="Zeneke"
                >
                    <span translate="no">Fernando Giménez</span> {t('about.fer.bio')}
                </TeamMember>
                <TeamMember
                    imgSource="img/mike-vindro-good.webp"
                    imgAltText={t('about.mike.alt')}
                    memberName="Mikelele"
                >
                    <span translate="no">Michael Bennett</span> {t('about.mike.bio')}
                </TeamMember>
            </div>
        </section>
    )
}

export default HomeAbout;