import React from "react";

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
            <li><a className="current" href="index.html">home</a></li>
            <li><a href="story.html">story</a></li>
            <li><a href="blog.html">blog</a></li>
            <li><a href="games.html">games</a></li>
            <li><a href="highscore/index.html">highscore</a></li>
            <li><a href="contact.html">contact</a></li>
          </ul>
        </nav>
      </div>
    </header>
  )
}

export default Header;