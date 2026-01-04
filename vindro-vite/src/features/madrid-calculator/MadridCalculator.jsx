// MadridCalculator.jsx Component
import React, { useState, useRef } from 'react';
import useCalculator from './hooks/useCalculator'; // The .js hook
import InteractionContainer from './components/InteractionContainer';
import Calculator from './components/Calculator';

const MadridCalculator = () => {
  // Logic Hook
  const calcHooks = useCalculator();

  // UI State
  const [isChampionsAudioOn, setIsChampionsAudioOn] = useState(true);
  const [isSiuAudioOn, setIsSiuAudioOn] = useState(true);

  // Audio Refs (Persist across renders)
  const siuAudio = useRef(new Audio("/audio/siuuu.mp3"));
  const championsAudio = useRef(new Audio("/audio/intro-uefa-champions-league.mp3"));

  return (
    <main id="madrid-calculator">
      <InteractionContainer />

      <Calculator 
        calcHooks={calcHooks}
        isChampionsAudioOn={isChampionsAudioOn}
        isSiuAudioOn={isSiuAudioOn}
        onToggleChampionsAudio={() => setIsChampionsAudioOn(!isChampionsAudioOn)}
        onToggleSiuAudio={() => setIsSiuAudioOn(!isSiuAudioOn)}
        siuAudio={siuAudio}
        championsAudio={championsAudio}
      />
    </main>
  );
};

export default MadridCalculator;



