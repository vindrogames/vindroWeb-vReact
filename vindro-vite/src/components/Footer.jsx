import React from 'react';

function Footer() {

  return (
    <footer>
      <div class="social">
        <a href="https://github.com/vindrogames" class="fab fa-github fa-4x" target="_blank"></a>
        <a href="https://x.com/vindrogames" class="fab fa-twitter fa-4x" target="_blank"></a>
        <a href="https://www.instagram.com/vindrogames/" class="fab fa-instagram fa-4x" target="_blank"></a>
        <a href="https://www.linkedin.com/in/michael-thomas-bennett-6631822a/" class="fab fa-linkedin fa-4x" target="_blank"></a>
        <a href="https://www.youtube.com/@Vindrogames" class="fab fa-youtube fa-4x" target="_blank"></a>
      </div>
      <div class="contact-info">
        <p>&copy;<span class="inline-bold inline-teal" translate="no">VindroGames</span> <span class="inline-bold inline-teal">|</span> <span>All Rights Reserved</span></p>
        <p><span class="inline-bold inline-teal">&</span> in collaboration with <a href="https://ludotecaenlanube.com/" target="_blank" translate="no">Ludoteca en la Nube</a></p>
      </div>
      <a href="privacy-cookies.html">Cookies & Privacy Policy</a>
    </footer>
  );
}

export default Footer;