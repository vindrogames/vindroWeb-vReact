// src/game-42/Game42.jsx
import React from "react";
import Board from "./components/Board";
import GameDisplay from "./components/GameDisplay";
import UseGame42Logic from "./hooks/UseGame42Logic";

// new lines

export default function Game42() {
  const {
    numsPlaced,
    numToPlace,
    points,
    gameOver,
    endCause,
    gameStarted,
    startGame,
    placeNum,
    playAgain,
  } = UseGame42Logic();

  return (
    <main className="game-42">
      <Board numsPlaced={numsPlaced} placeNum={placeNum} gameOver={gameOver} />

      <GameDisplay
        gameStarted={gameStarted}
        numToPlace={numToPlace}
        points={points}
        gameOver={gameOver}
        endCause={endCause}
        startGame={startGame}
        playAgain={playAgain}
      />
    </main>
  );
}
