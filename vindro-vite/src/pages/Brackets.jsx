import React from 'react';
import ContactHelmet from '../page-helmets/ContactHelmet';
import ShowcaseSection from '../components/ui/ShowcaseSection';

function Brackets() {

    return (

        <>
            <ContactHelmet />

            <main id="brackets-page">

                <ShowcaseSection
                    classes="hero-half bg-black"
                >
                    <h1>vindro<span className="inline-bold inline-teal">Brackets</span></h1>
                    <h2>Easy, fun and stylish brackets for you and your friends.</h2>
                </ShowcaseSection>
                
                <ShowcaseSection
                    id=""
                >
                    <div id="contact-left">
                        <h3 translate="no">zeneke@gmail.com</h3>
                        <h3 translate="no">d.michaelthomasbennett@gmail.com</h3>
                    </div>

                    <div id="contact-right">
                        <h2>We love talking with people about programming, games and learning.</h2>
                        <h2>We work with people and institutions offering:</h2>
                        <ul className='offerings-list'>
                            <li>Web design</li>
                            <li>Game Development</li>
                            <li>DevOps</li>
                            <li>Security services</li>
                            <li>Data Analysis</li>
                        </ul>
                    </div>
                </ShowcaseSection>
            </main>
        </>

    )
}

export default Brackets;