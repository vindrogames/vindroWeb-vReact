import React from 'react';
import { NavLink } from 'react-router-dom';

function NavBarLink({ route, text, onClick }) {
  return (
    <li>
      <NavLink
        to={route}
        className={({ isActive }) => (isActive ? 'current' : '')}
        onClick={(e) => {
          window.scrollTo({ top: 0, behavior: 'auto' });
          if (onClick) onClick(e);  // Close menu if handler is provided
        }}
      >
        {text}
      </NavLink>
    </li>
  );
}


export default NavBarLink;