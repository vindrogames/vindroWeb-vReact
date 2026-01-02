import React from 'react';

const InteractionContainer = ({ isAudioOn, onToggleAudio, onOpenInfo }) => {
    return (
        <div className="calc-interaction-bar">

            <button className="info-text-btn" onClick={onOpenInfo}>
                What is this?
            </button>
            
            <button className="icon-btn" onClick={onToggleAudio}>
                <i className={`fa-solid ${isAudioOn ? 'fa-volume-high' : 'fa-volume-xmark'}`}></i>
            </button>
            
        </div>
    );
};

export default InteractionContainer;