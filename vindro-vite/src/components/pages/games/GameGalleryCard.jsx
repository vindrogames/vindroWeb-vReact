import React from 'react';
import { Link } from 'react-router-dom';

function GameGalleryCard(props) {
    const cardClasses = `game ${props.classNum}`;

    const isInternalRoute = (url) => {
        return url && (url.startsWith('/') || !url.startsWith('http'));
    };

    const handleClick = () => {
        if (isInternalRoute(props.route)) {
            window.scrollTo({ top: 0, behavior: "instant" });
        }
    };

    return (
        <div key={props.classNum} className={cardClasses}>
            <Link to={props.route} onClick={handleClick}>
                {props.galleryImg}
            </Link>
            <div className="game-text">
                <Link to={props.route} onClick={handleClick}>
                    <h3>{props.gameTitle}</h3>
                </Link>
                <p>{props.gameDescription}</p>
            </div>
        </div>
    );
}

export default GameGalleryCard;
