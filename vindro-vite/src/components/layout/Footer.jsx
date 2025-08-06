import React from 'react';
import { FaGithub, FaTwitter, FaInstagram, FaLinkedin, FaYoutube } from "react-icons/fa";
import SmartLink from '../ui/SmartLink';

function Footer() {

    return (
        <footer>
            <div className="social">
                <SmartLink to={"https://github.com/vindrogames"}>
                    <FaGithub />
                </SmartLink>
                <SmartLink to={"https://x.com/vindrogames"}>
                    <FaTwitter />
                </SmartLink>
                <SmartLink to={"https://www.instagram.com/vindrogames"}>
                    <FaInstagram />
                </SmartLink>
                <SmartLink to={"https://www.linkedin.com/in/michael-thomas-bennett-6631822a/"}>
                    <FaLinkedin />
                </SmartLink>
                <SmartLink to={"https://www.youtube.com/@Vindrogames"}>
                    <FaYoutube />
                </SmartLink>
            </div>
            <div className="contact-info">
                <p>&copy;<span className="inline-bold inline-teal" translate="no">VindroGames</span> <span className="inline-bold inline-teal">|</span> <span>All Rights Reserved</span></p>
                <p>
                    <span className="inline-bold inline-teal">&</span> in collaboration with{" "}
                    <SmartLink to="https://ludotecaenlanube.com/" translate="no">
                        Ludoteca en la Nube
                    </SmartLink>
                </p>
            </div>
            <SmartLink to={"/privacy-cookies"}>
                Cookies & Privacy Policy
            </SmartLink>
        </footer>
    );
}

export default Footer;