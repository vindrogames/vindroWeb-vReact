import React from 'react';
import { useTranslation } from 'react-i18next';
import { FaGithub, FaTwitter, FaInstagram, FaLinkedin, FaYoutube } from "react-icons/fa";
import SmartLink from '../ui/SmartLink';
import LangToggle from '../ui/LangToggle';

const Footer = ({ isMadrid }) => {
    const { t } = useTranslation('common');
    const inlineClass = isMadrid ? "inline-real-yellow" : "inline-teal";

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
                <p>&copy;<span className={`inline-bold ${inlineClass}`} translate="no">VindroGames</span> <span className={`inline-bold ${inlineClass}`}>|</span> <span>{t('footer.allRightsReserved')}</span></p>
                <p>
                    <span className={`inline-bold ${inlineClass}`}>&</span> {t('footer.inCollabWith')}{" "}
                    <SmartLink to="https://ludotecaenlanube.com/" translate="no">
                        Ludoteca en la Nube
                    </SmartLink>
                </p>
            </div>
            <SmartLink to={"/privacy-cookies"}>
                {t('footer.privacyPolicy')}
            </SmartLink>
            <LangToggle />
        </footer>
    );
}

export default Footer;