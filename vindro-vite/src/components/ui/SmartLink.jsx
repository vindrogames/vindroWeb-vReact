import { Link, NavLink } from 'react-router-dom';

// 1. Define the helper function at the top so it's available to the component
function isInternal(url) {
    return url && (url.startsWith('/') || !url.startsWith('http'));
}

function SmartLink({ to, children, className = '', isNav = false, ...rest }) {
    const handleClick = (e) => {
        if (isInternal(to)) {
            window.scrollTo({ top: 0, behavior: 'auto' });
        }
    };

    if (isInternal(to)) {
        // Use NavLink ONLY if isNav is passed as true
        if (isNav) {
            return (
                <NavLink
                    to={to}
                    className={({ isActive }) => 
                        `${className} ${isActive ? 'current' : ''}`.trim()
                    }
                    onClick={handleClick}
                    {...rest}
                >
                    {children}
                </NavLink>
            );
        }

        // Standard Link for all other internal uses
        return (
            <Link to={to} className={className} onClick={handleClick} {...rest}>
                {children}
            </Link>
        );
    }

    // External <a> tag logic
    return (
        <a 
            href={to} 
            className={className} 
            target="_blank" 
            rel="noopener noreferrer" 
            {...rest}
        >
            {children}
        </a>
    );
}

export default SmartLink;
