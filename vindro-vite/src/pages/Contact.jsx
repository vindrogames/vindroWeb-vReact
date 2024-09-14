import React from 'react';
import { Helmet } from 'react-helmet-async';

function Contact() {

  return (

    <>
      <Helmet>
        <meta name="description" content="If you want to collaborate on an educational project, wed-design or cloud security contact vindrogames" />
        <meta name="keywords" content="vindrogames Madrid, Web design and programming, Cloud security, Educational games" />
        <link rel="icon" type="image/x-icon" href="favicon_io/favicon.ico" />
        <title>Vindrogames | Contact to play, colaborate and learn</title>
      </Helmet>

      <main>

        <section className="hero-half">
          <h1>get<span class="inline-bold inline-teal">In</span>Touch</h1>
          <h2>Who knows what could happen</h2>
        </section>

        <section id="contact-page-content">
          <div id="contact-left">
            <h3 translate="no">zeneke@gmail.com</h3>
            <h3 translate="no">d.michaelthomasbennett@gmail.com</h3>
          </div>

          <div id="contact-right">
            <h2>We love <span className="inline-green inline-bold">talking</span> with people about <span className="inline-green inline-bold">programming</span>, <span style={{color: '#45A29E', fontWeight: 'bold'}}>games</span> and <span className="inline-green inline-bold">learning</span>.</h2>
            <h2>We work with people and institutions offering web design, DevOps and security services.</h2>
          </div>
        </section>
      </main>
    </>
    
  )
}

export default Contact;