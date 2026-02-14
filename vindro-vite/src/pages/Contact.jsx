import React from 'react';
import ContactHelmet from '../page-helmets/ContactHelmet';
import ShowcaseSection from '../components/ui/ShowcaseSection';

function Contact() {

    return (

        <>
            <ContactHelmet />

            <main id="contact-page">

                <ShowcaseSection
                    classes="hero-half bg-black"
                >
                    <h1>get<span className="inline-bold inline-teal">In</span>Touch</h1>
                    <h2>Who knows what could happen</h2>
                </ShowcaseSection>
                
                <ShowcaseSection
                    id="contact-page-content"
                    classes="hero-half bg-gray"
                >
                    <h3>We are passionate about programming, games, learning and data</h3>
                    <h3>We offer web design, game development, DevOps, security and data analysis services to individuals and institutions.</h3>
                    
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