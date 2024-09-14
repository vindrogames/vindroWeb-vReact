import React from 'react';
import { Link } from 'react-router-dom';

function GameGalleryCard(props) {

  const cardClasses = `game ${props.classNum}`

  return (
    <div key={props.classNum} className={ cardClasses } >
      <Link
        to={props.route}
        onClick={() => window.scrollTo({ top: 0, behavior: "instant" })}
      >
        {props.galleryImg}
      </Link>
      <div className="game-text">
        <h3>{props.gameTitle}</h3>
        <p>{props.gameDescription}</p>
      </div>
    </div>
  )
};

export default GameGalleryCard;