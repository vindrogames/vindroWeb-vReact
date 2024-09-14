import React from "react";
import NavBarLink from './NavBarLink';
function Header() {

  return (
    <header>
      <div id="navbar" className="top">
        <div className="vindro-logo">
          <a href="index.html" ><img src="img/vindro_logo_1.png" alt="vindrogames independant gaming studio in Madrid"></img></a>
          <div className="vindro-logo-text">
            <h4>vindro</h4>
            <h4 className="inline-light inline-teal">games</h4>
          </div>
        </div>
        <nav>
          <ul>
            <NavBarLink route='/' text='home' />
            <li><a href="story.html">story</a></li>
            <li><a href="blog.html">blog</a></li>
            <NavBarLink route='/games' text='games' />
            <li><a href="highscore/index.html">highscore</a></li>
            <NavBarLink route='/contact' text='contact' />
          </ul>
        </nav>
      </div>
    </header>
  )
}

export default Header;