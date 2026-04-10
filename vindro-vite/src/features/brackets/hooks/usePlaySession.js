// Custom hook for managing the current play/tournament session
import { useState, useCallback } from 'react';

/**
 * Manages the state of the current play session
 * Tracks play name and current phase (intro, naming, groups, bracket, etc.)
 */
export const usePlaySession = () => {
  const [playName, setPlayName] = useState('');
  const [currentPhase, setCurrentPhase] = useState('intro'); // 'intro' | 'name' | 'groups' | 'bracket' | 'review' | 'submitted'

  // Start a new play session
  const startNewPlay = useCallback(() => {
    setCurrentPhase('name');
    setPlayName('');
  }, []);

  // Set the play name and move to groups phase
  const setPlayNameAndProceed = useCallback((name) => {
    setPlayName(name);
    setCurrentPhase('groups');
  }, []);

  // Move to bracket phase after groups are complete
  const proceedToBracket = useCallback(() => {
    setCurrentPhase('bracket');
  }, []);

  // Move to review phase after bracket is complete
  const proceedToReview = useCallback(() => {
    setCurrentPhase('review');
  }, []);

  // Submit the play
  const submitPlay = useCallback(() => {
    setCurrentPhase('submitted');
  }, []);

  // Reset to intro phase
  const resetToIntro = useCallback(() => {
    setCurrentPhase('intro');
    setPlayName('');
  }, []);

  return {
    playName,
    currentPhase,
    startNewPlay,
    setPlayNameAndProceed,
    proceedToBracket,
    proceedToReview,
    submitPlay,
    resetToIntro,
  };
};
