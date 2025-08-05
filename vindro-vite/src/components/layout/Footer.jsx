import React from 'react';
import { FaGithub, FaTwitter, FaInstagram, FaLinkedin, FaYoutube } from "react-icons/fa";

function Footer() {

  return (
    <footer>
      <div className="social">
        <a href="https://github.com/vindrogames" target="_blank">
          <FaGithub />
        </a>
        <a href="https://x.com/vindrogames" target="_blank">
          <FaTwitter />
        </a>
        <a href="https://www.instagram.com/vindrogames/" target="_blank">
          <FaInstagram />
        </a>
        <a href="https://www.linkedin.com/in/michael-thomas-bennett-6631822a/" target="_blank">
          <FaLinkedin />
        </a>
        <a href="https://www.youtube.com/@Vindrogames" target="_blank">
          <FaYoutube />
        </a>
      </div>
      <div className="contact-info">
        <p>&copy;<span className="inline-bold inline-teal" translate="no">VindroGames</span> <span className="inline-bold inline-teal">|</span> <span>All Rights Reserved</span></p>
        <p><span className="inline-bold inline-teal">&</span> in collaboration with <a href="https://ludotecaenlanube.com/" target="_blank" translate="no">Ludoteca en la Nube</a></p>
      </div>
      <a href="privacy-cookies.html">Cookies & Privacy Policy</a>
    </footer>
  );
}

export default Footer;