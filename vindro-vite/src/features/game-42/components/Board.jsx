// src/game-42/components/Board.jsx
import React from "react";

export default function Board({ numsPlaced, placeNum, gameOver }) {
  return (
    <section id="game-42-buttons">
      {numsPlaced.map((val, idx) => (
        <button
          key={idx}
          id={`${idx + 1}`}
          className={`pos-42 ${val === 0 ? "open" : "closed"} ${
            gameOver ? "game-over" : ""
          }`}
          onClick={() => placeNum(idx)}
          disabled={gameOver || val !== 0}
          aria-label={
            val === 0
              ? `Position ${idx + 1} empty`
              : `Position ${idx + 1} with ${val}`
          }
        >
          {val === 0 ? `${idx + 1}.` : val}
        </button>
      ))}
    </section>
  );
}
