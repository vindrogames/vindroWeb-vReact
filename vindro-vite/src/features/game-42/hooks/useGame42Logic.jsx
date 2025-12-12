// src/game-42/hooks/useGameLogic.js
import { useState, useRef } from "react";

export default function useGame42Logic() {

  const [numsRound, setNumsRound] = useState([]);
  const [numToPlace, setNumToPlace] = useState(null);
  const [numsPlaced, setNumsPlaced] = useState(Array(14).fill(0));
  const [points, setPoints] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [endCause, setEndCause] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);

  /** -------- Utilities -------- */
  const generateGameNums = () => {
    const nums = Array.from({ length: 42 }, (_, i) => i + 1);
    for (let i = nums.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [nums[i], nums[j]] = [nums[j], nums[i]];
    }
    return nums.slice(0, 14);
  };

  /** -------- Game Logic -------- */

  const startGame = () => {
    const newNums = generateGameNums();
    setNumsRound(newNums.slice(1));
    setNumToPlace(newNums[0]);
    setNumsPlaced(Array(14).fill(0));
    setPoints(0);
    setGameOver(false);
    setEndCause(null);
    setGameStarted(true);
  };

  const checkPlacedNum = (placements) => {
    const numsToCheck = placements.filter((num) => num !== 0);
    for (let i = 0; i < numsToCheck.length; i++) {
      if (numsToCheck[i] > numsToCheck[i + 1]) return true;
    }
    return false;
  };

  const checkNewNum = (candidate, placements) => {
    const numsToCheck = placements.filter((n) => n !== 0);
    if (numsToCheck.length > 1) {
      for (let i = 0; i < placements.length; i++) {
        if (placements[i] === 0) continue;
        if (placements[i] > candidate) return false;
      }
    }
    return false;
  };

  const nextNum = () => {
    if (!numsRound.length) return;
    const next = numsRound[0];
    setNumToPlace(next);
    setNumsRound((prev) => prev.slice(1));
  };

  const placeNum = (index) => {
    if (!gameStarted || gameOver || numsPlaced[index] !== 0) return;

    const updated = [...numsPlaced];
    updated[index] = numToPlace;
    const bad = checkPlacedNum(updated);

    if (bad) {
      setNumsPlaced(updated);
      endGame("bad-placement");
      return;
    }

    const newPoints = points + 3;
    setNumsPlaced(updated);
    setPoints(newPoints);

    if (newPoints === 42) {
      endGame("42");
      return;
    }

    nextNum();
  };

  const endGame = (cause) => {
    setGameOver(true);
    setEndCause(cause);
  };

  const playAgain = () => {
    startGame();
  };

  return {
    // State
    numsPlaced,
    numToPlace,
    points,
    gameOver,
    endCause,
    gameStarted,
    // Actions
    startGame,
    placeNum,
    playAgain,
  };
}
