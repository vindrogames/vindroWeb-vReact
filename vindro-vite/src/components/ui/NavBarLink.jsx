import React from 'react';
import { NavLink } from 'react-router-dom';

function NavBarLink(props) {

  return (
    <li>
      <NavLink 
        to={ props.route }
        className={({ isActive, isPending }) =>
          isPending ? "pending" : isActive ? "active" : ""
        }
        onClick={() => window.scrollTo({ top: 0, behavior: "auto" })}
      >{ props.text }
      </NavLink>
    </li>
  )
}

export default NavBarLink;