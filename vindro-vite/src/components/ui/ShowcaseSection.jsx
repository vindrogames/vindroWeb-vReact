import Button from "./Button"; // adjust path if needed

const ShowcaseSection = ({
    id,
    classes,
    children,
    showButton = false,
    buttonText,
    buttonOnClick,
    buttonTo,
    buttonClasses,
    buttonId,
    ...rest
})  => {
    return (
        <section id={id} className={classes} {...rest}>
            {children}

            {showButton && (
                <Button
                    onClick={buttonOnClick}
                    to={buttonTo}
                    classes={buttonClasses}
                >
                    {buttonText}
                </Button>
            )}
        </section>
    );
}

export default ShowcaseSection;
