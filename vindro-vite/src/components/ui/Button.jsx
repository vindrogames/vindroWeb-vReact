import SmartLink from './SmartLink';

function Button({ children, classes = '', onClick, type = 'button', to, ...rest }) {

    if (to) {
        return (
            <SmartLink
                to={to}
                className={classes}
                onClick={onClick}
                {...rest}
            >
                {children}
            </SmartLink>
        );
    }

    return (
        <button
            type={type}
            className={classes}
            onClick={onClick}
            {...rest}
        >
            {children}
        </button>
    );
};

export default Button;
