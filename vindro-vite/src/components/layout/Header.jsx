import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBarLink from '../ui/NavBarLink';
import SmartLink from '../ui/SmartLink';
import { useAuth } from '../../contexts/AuthContext';

const routes = [
    { text: 'home', route: '/' },
    { text: 'story', route: '/story' },
    { text: 'brackets', route: '/brackets' },
    { text: 'games', route: '/games' },
    { text: 'contact', route: '/contact' },
];

function NavBar({ isMadrid }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);

    const hamburgerMenuRef = useRef(null);
    const hamburgerToggleRef = useRef(null);
    const userDropdownRefDesktop = useRef(null);
    const userDropdownRefMobile = useRef(null);

    const menuOpenRef = useRef(menuOpen);
    const userOpenRef = useRef(userDropdownOpen);

    const { user, logout } = useAuth();
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
            navigate('/');
        } catch (err) {
            console.error('Logout failed:', err);
        }
    }

    const logoSrc = isMadrid ? "/img/vindro-logo-real-yellow.png" : "/img/vindro_logo_1.png";
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
                            <NavBarLink key={r.route} text={r.text} route={r.route} />
                        ))}
                    </ul>

                    <div className="auth-nav">
                        {user ? (
                            <div className="user-avatar-container" ref={userDropdownRefDesktop}>
                                <button
                                    className={`user-avatar-btn ${userDropdownOpen ? 'open' : ''}`}
                                    onClick={() => setUserDropdownOpen(prev => !prev)}
                                >
                                    <img src={user.avatar} alt="User Avatar" />
                                </button>
                                {userDropdownOpen && (
                                    <div className="user-dropdown-menu">
                                        <SmartLink
                                            to={`/user/${user.id}`}
                                            className="dropdown-item"
                                            onClick={() => setUserDropdownOpen(false)}
                                        >
                                            Profile
                                        </SmartLink>

                                        {/* Possible Profile options
                                        <SmartLink
                                            to={`/user/${encodeURIComponent(user?.username || user.id)}/brackets`}
                                            className="dropdown-item"
                                            onClick={() => { setUserDropdownOpen(false) }}
                                        >
                                            Top Scores
                                        </SmartLink>
                                        <SmartLink
                                            to={`/user/${encodeURIComponent(user?.username || user.id)}/topScores`}
                                            className="dropdown-item"
                                            onClick={() => { setUserDropdownOpen(false) }}
                                        >
                                            Brackets
                                        </SmartLink>
                                        */}
                                        
                                        <button className="dropdown-item logout-btn" onClick={handleLogout}>Logout</button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <ul>
                                <NavBarLink route="/login" text="login" className="btn-login" />
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
                                <NavBarLink key={r.route} text={r.text} route={r.route} onClick={() => setMenuOpen(false)} />
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
                                    <img src="/img/profile_icons/teal-pirate.webp" alt="User Avatar" />
                                </button>
                                {userDropdownOpen && (
                                    <div className="user-dropdown-menu">
                                        <SmartLink
                                            to={`/user/${user.id}`}
                                            className="dropdown-item"
                                            onClick={() => setUserDropdownOpen(false)}
                                        >
                                            Profile
                                        </SmartLink>

                                        {/* Possible Profile options
                                        <SmartLink
                                            to={`/user/${encodeURIComponent(user?.username || user.id)}/brackets`}
                                            className="dropdown-item"
                                            onClick={() => { setUserDropdownOpen(false) }}
                                        >
                                            Top Scores
                                        </SmartLink>
                                        <SmartLink
                                            to={`/user/${encodeURIComponent(user?.username || user.id)}/topScores`}
                                            className="dropdown-item"
                                            onClick={() => { setUserDropdownOpen(false) }}
                                        >
                                            Brackets
                                        </SmartLink>
                                        */}
                                        <button className="dropdown-item logout-btn" onClick={handleLogout}>Logout</button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <ul>
                                <NavBarLink route="/login" text="login" className="btn-login" onClick={() => setMenuOpen(false)} />
                            </ul>
                        )}
                    </div>

                </nav>
            </div>
        </header>
    );
}

export default NavBar;