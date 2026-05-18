import React from 'react';
import { useTranslation } from 'react-i18next';
import ContactHelmet from '../page-helmets/ContactHelmet';
import ShowcaseSection from '../components/ui/ShowcaseSection';

const Contact = () => {

    const { t } = useTranslation('contact');
    return (

        <>
            <ContactHelmet />

            <main id="contact-page">

                <ShowcaseSection
                    classes="hero-half bg-black"
                >
                    <h1>get<span className="inline-bold inline-teal">In</span>Touch</h1>
                    <h2>{t('hero.tagline')}</h2>
                </ShowcaseSection>
                
                <ShowcaseSection
                    id="contact-page-content"
                    classes="hero-half bg-gray"
                >
                    <h3>{t('contactContent.firstLine')}</h3>
                    <h3>{t('contactContent.secondLine')}</h3>
                    
                </ShowcaseSection>

                <ShowcaseSection
                    id="contact-page-emails"
                    classes="hero-half bg-tan"
                >
                    <ul>
                        <li>
                            <div>
                                <h4 translate="no">zeneke@gmail.com</h4>
                            </div>
                        </li>
                        <li>
                            <div>
                                <h4 translate="no">d.michaelthomasbennett@gmail.com</h4>
                            </div>
                        </li>
                    </ul>                    
                </ShowcaseSection>
            </main>
        </>

    )
}

export default Contact;