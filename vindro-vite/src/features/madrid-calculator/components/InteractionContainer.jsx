import React from 'react';

const InteractionContainer = ({ isAudioOn, onToggleAudio, onOpenInfo }) => {
    return (
        <div className="intro">
            <h1>Calculadora Madridista</h1>
            <h2>Calcula como siempre...</h2>
            <h2>O por las champions del Madrid</h2>
        </div>
    );
};

export default InteractionContainer;