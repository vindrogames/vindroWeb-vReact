import React from 'react';
import EscapeCloudHelmet from './page-helmets/EscapeCloudHelmet';

function EscapeTheCloud() {

  return (

    <>
      <EscapeCloudHelmet />
      <main>

        <section className="hero-half">
          <h1>escape<span className="inline-bold inline-teal">The</span>Cloud</h1>
          <h2>A learning experience inspired by Escape Rooms</h2>
        </section>

        <section id="escape-the-cloud">

          <div id="escape-the-cloud-trailer">
            <video controls>
              <source src="img/Escape the Cloud Trailor.mp4" type="video/mp4" />
            </video>
          </div>

          <div id="escape-the-cloud-info">
            <p>Test your knowledge of Google Workspace tools with the different puzzles found in our game.</p>
            <p><span className="inline-bold inline-green">To play you should be logged into your google account</span>. The game should take more or less 30 minutes to complete and covers from basic to advanced functionalities and properties of Google Workspace apps.</p>
            <div className="buttons">
              <a href="https://forms.gle/cXWsncFLb14cDqkK8" className="btn btn-teal" target="_blank" translate="no">Play in English</a>
              <a href="https://forms.gle/PfpCTF4jrmYz6SnB8" className="btn btn-teal" target="_blank" translate="no">Jugar en Español</a>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}

export default EscapeTheCloud;