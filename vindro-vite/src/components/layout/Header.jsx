import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBarLink from '../ui/NavBarLink';
import SmartLink from '../ui/SmartLink';
import { useAuth } from '../../contexts/AuthContext';
//import './NavBar.scss'; // Assuming styles are scoped here

const routes = [
    { text: 'home', route: '/' },
    { text: 'story', route: '/story' },
    { text: 'blog', route: '/blog' },
    { text: 'games', route: '/games' },
    { text: 'contact', route: '/contact' },
];

function NavBar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const toggleMenu = () => setMenuOpen((prev) => !prev);

    async function handleLogout() {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    }

    return (
        <>
            {/* Desktop Nav */}
            <div id="navbar">
                <div className="vindro-logo">
                    <SmartLink to="/" style={{ border: 'none' }}>
                        <img
                            src="/img/vindro_logo_1.png"
                            alt="Vindrogames independent gaming studio in Madrid"
                        />
                    </SmartLink>
                    <div className="vindro-logo-text">
                        <h4>vindro</h4>
                        <h4 className="inline-light inline-teal">games</h4>
                    </div>
                </div>

                <nav>
                    <ul>
                        {routes.map((r) => (
                            <NavBarLink key={r.route} text={r.text} route={r.route} />
                        ))}
                    </ul>
                    <div className="auth-nav">
                        {user ? (
                            <>
                                <span className="username">Welcome, {user.username}</span>
                                <button onClick={handleLogout} className="btn btn-tan">
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <SmartLink to="/login" className="btn btn-tan">Login</SmartLink>
                                <SmartLink to="/register" className="btn btn-teal">Register</SmartLink>
                            </>
                        )}
                    </div>
                </nav>
            </div>

            {/* Mobile Nav */}
            <div id="navbar-hamburger">
                <div className="vindro-logo">
                    <SmartLink to="/" style={{ border: 'none' }}>
                        <img
                            src="/img/vindro_logo_1.png"
                            alt="Vindrogames Independent Gaming Studio in Madrid"
                        />
                    </SmartLink>
                    <div className="vindro-logo-text" translate="no">
                        <h4>vindro</h4>
                        <h4 className="inline-light inline-teal">games</h4>
                    </div>
                </div>

                <div
                    id="hamburger-container"
                    className={menuOpen ? 'open' : ''}
                    onClick={toggleMenu}
                >
                    <div id="hamburger-toggler" />
                    <div id="hamburger-lines">
                        <div id="hamburger-lines-top" />
                        <div id="hamburger-lines-mid" />
                        <div id="hamburger-lines-bottom" />
                    </div>
                </div>

                <nav id="hamburger-menu" className={menuOpen ? 'open' : ''}>
                    <ul>
                        {routes.map((r) => (
                            <NavBarLink
                                key={r.route}
                                text={r.text}
                                route={r.route}
                                onClick={() => setMenuOpen(false)} // 👈 closes menu
                            />
                        ))}
                    </ul>
                    <div className="auth-nav-mobile">
                        {user ? (
                            <>
                                <span className="username-mobile">Welcome, {user.username}</span>
                                <button
                                    onClick={() => {
                                        handleLogout();
                                        setMenuOpen(false);
                                    }}
                                    className="btn btn-tan"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <SmartLink to="/login" className="btn btn-tan" onClick={() => setMenuOpen(false)}>
                                    Login
                                </SmartLink>
                                <SmartLink to="/register" className="btn btn-teal" onClick={() => setMenuOpen(false)}>
                                    Register
                                </SmartLink>
                            </>
                        )}
                    </div>
                </nav>
            </div>
        </>
    );
}

export default NavBar;
