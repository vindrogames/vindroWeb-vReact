// src/game-42/components/GameDisplay.jsx
import React from "react";

export default function GameDisplay({
  gameStarted,
  numToPlace,
  points,
  startGame,
  playAgain,
  gameOver,
  endCause,
  prevPoints,
  todayBest,
}) {
  const renderEndText = () => {
    if (!endCause) return null;
    switch (endCause) {
      case "bad-placement":
        return <>❌ Wrong placement! You scored {points} points.</>;
      case "42":
        return <>🎉 You reached 42 points! Perfect order!</>;
      default:
        return <>Game ended. You scored {points} points.</>;
    }
  };

  return (
    <section id="display-42">
      <div className="instructions-42">
        <h1 className="title-42">
          <span className="inline-teal inline-bold">42</span> the game
        </h1>
        <h2>Place 14 random numbers between 1–42 in ascending order.</h2>
        <p>Each round the numbers are shuffled and will be revealed in different order.</p>
        <p>You will have to think a bit about probability of possible numbers.</p>
        <p>You lose if ascending order is broken.</p>
      </div>

      <div className="showcase-42">
        <div className="game-42-play-container">
          {!gameStarted || gameOver ? (
            <button
              id="game-42-play-button"
              onClick={gameOver ? playAgain : startGame}
              className="btn"
            >
              {gameOver ? "Play again" : "Start"}
            </button>
          ) : (
            <div className="game-42-number-display">
              <div id="number-to-place" className="displayed">
                {numToPlace ?? "-"}
              </div>
            </div>
          )}
        </div>

        <div className="game-42-results">
          <h3>Points: {points}</h3>
          <h3>Prev Points: {prevPoints ?? "-"}</h3>
          <h3>Today's Best: {todayBest?? "-"}</h3>
          {gameOver && <div className="end-game-message">{renderEndText()}</div>}
        </div>
      </div>
    </section>
  );
}
