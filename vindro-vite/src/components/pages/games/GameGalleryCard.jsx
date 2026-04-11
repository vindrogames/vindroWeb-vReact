import SmartLink from '../../ui/SmartLink';

const GameGalleryCard = ({ route, galleryImg, gameTitle, gameDescription }) => {

    return (
        <div className="game">
            <SmartLink to={route}>
                {galleryImg}
            </SmartLink>
            <div className="game-text">
                <SmartLink to={route}>
                    <h3>{gameTitle}</h3>
                </SmartLink>
                <p>{gameDescription}</p>
            </div>
        </div>
    );
}

export default GameGalleryCard;
