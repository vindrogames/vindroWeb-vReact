import { NavLink } from 'react-router-dom';

const NavBarLink = ({ route, text, onClick, className }) => {
    return (
        <li>
            <NavLink
                to={route}
                className={({ isActive }) => {
                    const baseClass = className || ""; 
                    return `${baseClass} ${isActive ? 'current' : ''}`.trim();
                }}
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