import { Link } from 'react-router-dom';

function isInternal(url) {
    return url && (url.startsWith('/') || !url.startsWith('http'));
}

function SmartLink({ to, children, className = '', ...rest }) {
    const handleClick = (e) => {
        if (isInternal(to)) {
            window.scrollTo({ top: 0, behavior: 'auto' });
        }
    };

    if (isInternal(to)) {
        return (
            <Link
                to={to}
                className={className}
                onClick={handleClick}
                {...rest}
            >
                {children}
            </Link>
        );
    } else {
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
}

export default SmartLink;


