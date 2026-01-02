import React, { useState, useRef } from 'react';
import useCalculator from './hooks/useCalculator'; // The .js hook
import InteractionContainer from './components/InteractionContainer';
import Calculator from './components/Calculator';
import InfoModal from './components/InfoModal';

const MadridCalculator = () => {
  // Logic Hook
  const calcHooks = useCalculator();

  // UI State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAudioOn, setIsAudioOn] = useState(true);

  // Audio Refs (Persist across renders)
  const siuAudio = useRef(new Audio("/madrid-calculator/siuuu.mp3"));
  const championsAudio = useRef(new Audio("/madrid-calculator/intro-uefa-champions-league.mp3"));

  return (
    <main id="madrid-calculator">
      <InteractionContainer 
        isAudioOn={isAudioOn}
        onToggleAudio={() => setIsAudioOn(!isAudioOn)}
        onOpenInfo={() => setIsModalOpen(true)}
      />

      <Calculator 
        calcHooks={calcHooks}
        isAudioOn={isAudioOn}
        siuAudio={siuAudio}
        championsAudio={championsAudio}
      />

      <InfoModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </main>
  );
};

export default MadridCalculator;



