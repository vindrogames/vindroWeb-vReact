import React from 'react';
import ContactHelmet from '../page-helmets/ContactHelmet';
import ShowcaseSection from '../components/ui/ShowcaseSection';

function Contact() {

    return (

        <>
            <ContactHelmet />

            <main>

                <ShowcaseSection
                    classes="hero-half bg-black"
                >
                    <h1>get<span className="inline-bold inline-teal">In</span>Touch</h1>
                    <h2>Who knows what could happen</h2>
                </ShowcaseSection>

                <section id="contact-page-content">
                    <div id="contact-left">
                        <h3 translate="no">zeneke@gmail.com</h3>
                        <h3 translate="no">d.michaelthomasbennett@gmail.com</h3>
                    </div>

                    <div id="contact-right">
                        <h2>We love <span className="inline-green inline-bold">talking</span> with people about <span className="inline-green inline-bold">programming</span>, <span style={{ color: '#45A29E', fontWeight: 'bold' }}>games</span> and <span className="inline-green inline-bold">learning</span>.</h2>
                        <h2>We work with people and institutions offering web design, DevOps and security services.</h2>
                    </div>
                </section>
            </main>
        </>

    )
}

export default Contact;