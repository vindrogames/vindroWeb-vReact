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

function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const hamburgerMenuRef = useRef(null);
  const hamburgerToggleRef = useRef(null);

  // Separate refs for desktop and mobile avatar containers (sharing one ref breaks .contains)
  const userDropdownRefDesktop = useRef(null);
  const userDropdownRefMobile = useRef(null);

  // synced refs to avoid stale closures in the global handler
  const menuOpenRef = useRef(menuOpen);
  const userOpenRef = useRef(userDropdownOpen);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { menuOpenRef.current = menuOpen; }, [menuOpen]);
  useEffect(() => { userOpenRef.current = userDropdownOpen; }, [userDropdownOpen]);

  const toggleMenu = () => setMenuOpen((p) => !p);
  const openUserDropdown = () => setUserDropdownOpen(true);
  const closeUserDropdown = () => setUserDropdownOpen(false);

  useEffect(() => {
    function handleGlobalClick(e) {
      const t = e.target;

      // 1) Hamburger logic first
      if (menuOpenRef.current) {
        const clickedInsideHamburger =
          hamburgerMenuRef.current?.contains(t) ||
          hamburgerToggleRef.current?.contains(t) ||
          !!t.closest('#hamburger-menu a') ||
          !!t.closest('#navbar ul a');

        if (!clickedInsideHamburger) setMenuOpen(false);
      }

      // 2) User dropdown logic second (check both desktop & mobile containers)
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
      navigate('/');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  }

  return (
    <>
      {/* Desktop Nav */}
      <div id="navbar">
        <div className="vindro-logo">
          <SmartLink to="/" style={{ border: 'none' }}>
            <img src="/img/vindro_logo_1.png" alt="Vindrogames independent gaming studio in Madrid" />
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
              <div className="user-avatar-container" ref={userDropdownRefDesktop}>
                <button
                  className={`user-avatar-btn ${userDropdownOpen ? 'open' : ''}`}
                  onClick={() => setUserDropdownOpen(prev => !prev)}
                  aria-label="User menu"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </button>

                {userDropdownOpen && (
                  <div className={`user-dropdown-menu ${userDropdownOpen ? 'open' : ''}`}>
                    <SmartLink to="/profile" className="dropdown-item" onClick={() => setUserDropdownOpen(false)}>
                      My Profile
                    </SmartLink>
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
        <div className="vindro-logo">
          <SmartLink to="/" style={{ border: 'none' }}>
            <img src="/img/vindro_logo_1.png" alt="Vindrogames Independent Gaming Studio in Madrid" />
          </SmartLink>
          <div className="vindro-logo-text" translate="no">
            <h4>vindro</h4>
            <h4 className="inline-light inline-teal">games</h4>
          </div>
        </div>

        <nav>
          <div
            id="hamburger-container"
            ref={hamburgerToggleRef}
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

          <div id="hamburger-menu" ref={hamburgerMenuRef} className={menuOpen ? 'open' : ''}>
            <ul>
              {routes.map((r) => (
                <NavBarLink key={r.route} text={r.text} route={r.route} onClick={() => setMenuOpen(false)} />
              ))}
            </ul>
          </div>

          <div className="auth-nav">
            {user ? (
              <div className="user-avatar-container" ref={userDropdownRefMobile}>
                <button
                  className={`user-avatar-btn ${userDropdownOpen ? 'open' : ''}`}
                  onClick={() => setUserDropdownOpen(prev => !prev)}
                  aria-label="User menu"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </button>

                {userDropdownOpen && (
                  <div className={`user-dropdown-menu ${userDropdownOpen ? 'open' : ''}`}>
                    <SmartLink to="/profile" className="dropdown-item" onClick={() => setUserDropdownOpen(false)}>
                      My Profile
                    </SmartLink>
                    <button className="dropdown-item logout-btn" onClick={handleLogout}>Logout</button>
                  </div>
                )}
              </div>
            ) : (
              <NavBarLink route="/login" text="login" className="btn-login" />
            )}
          </div>
        </nav>
      </div>
    </>
  );
}

export default NavBar;