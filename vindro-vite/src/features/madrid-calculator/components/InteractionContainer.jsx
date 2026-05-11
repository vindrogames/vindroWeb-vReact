import React from 'react';
import { useTranslation } from 'react-i18next';

const InteractionContainer = ({ isAudioOn, onToggleAudio, onOpenInfo }) => {
    const { t } = useTranslation('madrid-calculator');

    return (
        <div className="intro">
            <h1 translate="no">Calculadora Madridista</h1>
            <h2>{t('intro.tagline1')}</h2>
            <h2>{t('intro.tagline2')}</h2>
        </div>
    );
};

export default InteractionContainer;
