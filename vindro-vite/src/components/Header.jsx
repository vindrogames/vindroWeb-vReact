import React from "react";
import { NavLink } from 'react-router-dom';
import NavBarLink from './NavBarLink';
function Header() {

  return (
    <header>
      <div id="navbar" className="top">
        <div className="vindro-logo">
          <NavLink 
            to="/"
            onClick={() => window.scrollTo({ top: 0, behavior: "instant" })}
            >
              <img src="img/vindro_logo_1.png" alt="vindrogames independant gaming studio in Madrid"></img>
            </NavLink>
          <div className="vindro-logo-text">
            <h4>vindro</h4>
            <h4 className="inline-light inline-teal">games</h4>
          </div>
        </div>
        <nav>
          <ul>
            <NavBarLink route='/' text='home' />
            <NavBarLink route='/story' text='story' />
            <NavBarLink route='/blog' text='blog' />
            <NavBarLink route='/games' text='games' />
            <NavBarLink route='/contact' text='contact' />
          </ul>
        </nav>
      </div>
    </header>
  )
}

export default Header;