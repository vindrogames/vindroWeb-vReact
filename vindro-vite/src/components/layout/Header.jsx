import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import NavBarLink from '../ui/NavBarLink';
import SmartLink from '../ui/SmartLink';
import { useAuth } from '../../contexts/auth/AuthContext';
import AuthModal from '../ui/AuthModal';
import LangToggle from '../ui/LangToggle';

const routes = [
    { key: 'home', route: '/' },
    { key: 'story', route: '/story' },
    { key: 'games', route: '/games' },
    { key: 'brackets', route: '/brackets' },
    { key: 'contact', route: '/contact' },
];

const NavBar = ({ isMadrid }) => {
    
    const [menuOpen, setMenuOpen] = useState(false);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);

    const hamburgerMenuRef = useRef(null);
    const hamburgerToggleRef = useRef(null);
    const userDropdownRefDesktop = useRef(null);
    const userDropdownRefMobile = useRef(null);

    const menuOpenRef = useRef(menuOpen);
    const userOpenRef = useRef(userDropdownOpen);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { user, logout } = useAuth();
    const { t } = useTranslation('common');
    const navigate = useNavigate();

    useEffect(() => { menuOpenRef.current = menuOpen; }, [menuOpen]);
    useEffect(() => { userOpenRef.current = userDropdownOpen; }, [userDropdownOpen]);

    const toggleMenu = () => setMenuOpen((p) => !p);

    useEffect(() => {

        function handleGlobalClick(e) {

            const t = e.target;

            if (menuOpenRef.current) {

                const clickedInsideHamburger =
                    hamburgerMenuRef.current?.contains(t) ||
                    hamburgerToggleRef.current?.contains(t) ||
                    !!t.closest('#hamburger-menu a') ||
                    !!t.closest('#navbar ul a');
                if (!clickedInsideHamburger) setMenuOpen(false);
            }
            if (userOpenRef.current) {

                const clickedInsideDesktop = userDropdownRefDesktop.current?.contains(t);
                const clickedInsideMobile = userDropdownRefMobile.current?.contains(t);
                if (!clickedInsideDesktop && !clickedInsideMobile) {
                    
                    setUserDropdownOpen(false);
                }
            }
        }
        document.addEventListener('click', handleGlobalClick);
        return () => document.removeEventListener('click', handleGlobalClick);
    }, []);

    async function handleLogout() {
        try {
            await logout();
            setUserDropdownOpen(false);
            setMenuOpen(false);
            navigate('/logout');
        } catch (err) {
            console.error('Logout failed:', err);
        }
    }

    const logoSrc = isMadrid ? "/img/vindro-logo-real-yellow.webp" : "/img/vindro-logo-teal.webp";
    const inlineClass = isMadrid ? "inline-real-yellow" : "inline-teal";

    const LogoBlock = () => (
        <div className="vindro-logo">
            <SmartLink to="/" style={{ border: 'none' }}>
                <img src={logoSrc} alt="Vindrogames Logo" />
            </SmartLink>
            <div className="vindro-logo-text">
                <h4>vindro</h4>
                <h4 className={`inline-light ${inlineClass}`}>games</h4>
            </div>
        </div>
    );

    return (
        <header>
            {/* Desktop Nav */}
            <div id="navbar">
                <LogoBlock />
                <nav>
                    <ul>
                        {routes.map((r) => (
                            <NavBarLink key={r.route} text={t(`nav.${r.key}`)} route={r.route} />
                        ))}
                    </ul>

                    <div className="auth-nav">
                        {user ? (
                            <div className="user-avatar-container" ref={userDropdownRefDesktop}>
                                <button
                                    className={`user-avatar-btn ${userDropdownOpen ? 'open' : ''}`}
                                    onClick={() => setUserDropdownOpen(prev => !prev)}
                                >
                                    <img src={(user.avatar || '/img/profile_icons/teal-simple.webp').replace(/\.(\w+)$/, `-${96}.$1`)} alt="User Avatar" />
                                </button>
                                {userDropdownOpen && (
                                    <div className="user-dropdown-menu">
                                        <SmartLink
                                            to={`/user/${user.id}`}
                                            className="dropdown-item"
                                            onClick={() => setUserDropdownOpen(false)}
                                        >
                                            {t('header.profile')}
                                        </SmartLink>

                                        <button className="dropdown-item logout-btn" onClick={handleLogout}>{t('header.logout')}</button>
                                        <LangToggle onAfterChange={() => setUserDropdownOpen(false)} />
                                    </div>
                                )}
                            </div>
                        ) : (
                            <ul>
                                <button className='btn-login' onClick={() => setIsModalOpen(true)}>{t('header.login')}</button>
                            </ul>
                        )}
                    </div>
                </nav>
            </div>

            {/* Mobile Nav */}
            <div id="navbar-hamburger">
                <LogoBlock />
                <nav>
                    <div id="hamburger-container" ref={hamburgerToggleRef} className={menuOpen ? 'open' : ''} onClick={toggleMenu}>
                        <div id="hamburger-toggler" />
                        <div id="hamburger-lines">
                            <div id="hamburger-lines-top" />
                            <div id="hamburger-lines-mid" />
                            <div id="hamburger-lines-bottom" />
                        </div>
                    </div>

                    <div id="hamburger-menu" ref={hamburgerMenuRef} className={menuOpen ? 'open' : ''}>
                        <ul>
                            {routes.map((r) => (
                                <NavBarLink key={r.route} text={t(`nav.${r.key}`)} route={r.route} onClick={() => setMenuOpen(false)} />
                            ))}
                        </ul>
                    </div>

                    {/* Mobile Auth Icons */}
                    <div className="auth-nav">
                        {user ? (
                            <div className="user-avatar-container" ref={userDropdownRefMobile}>
                                <button
                                    className={`user-avatar-btn ${userDropdownOpen ? 'open' : ''}`}
                                    onClick={() => setUserDropdownOpen(prev => !prev)}
                                >
                                    <img src={(user.avatar || '/img/profile_icons/teal-simple.webp').replace(/\.(\w+)$/, `-${96}.$1`)} alt="User Avatar" />
                                </button>
                                {userDropdownOpen && (
                                    <div className="user-dropdown-menu">
                                        <SmartLink
                                            to={`/user/${user.id}`}
                                            className="dropdown-item"
                                            onClick={() => setUserDropdownOpen(false)}
                                        >
                                            {t('header.profile')}
                                        </SmartLink>

                                        <button className="dropdown-item logout-btn" onClick={handleLogout}>{t('header.logout')}</button>
                                        <LangToggle onAfterChange={() => setUserDropdownOpen(false)} />
                                    </div>
                                )}
                            </div>
                        ) : (
                            <ul>
                                <button className='btn-login' onClick={() => setIsModalOpen(true)}>{t('header.login')}</button>
                            </ul>
                        )}
                    </div>

                </nav>
            </div>

            <AuthModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </header>
    );
}

export default NavBar;