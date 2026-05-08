import React, { useState, useRef, useEffect } from 'react';
import useCalculator from './hooks/useCalculator';
import InteractionContainer from './components/InteractionContainer';
import Calculator from './components/Calculator';
import MadridCalculatorHelmet from '../../page-helmets/MadridCalculatorHelmet';

const MadridCalculator = () => {
  const calcHooks = useCalculator();
  const [isChampionsAudioOn, setIsChampionsAudioOn] = useState(true);
  const [isSiuAudioOn, setIsSiuAudioOn] = useState(true);

  const siuAudio = useRef(null);
  const championsAudio = useRef(null);

  useEffect(() => {
    // Initialize once on mount
    siuAudio.current = new Audio("/audio/siuuu.mp3");
    championsAudio.current = new Audio("/audio/intro-uefa-champions-league.mp3");
  }, []);

  return (
    <main id="madrid-calculator">
      <MadridCalculatorHelmet />
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



